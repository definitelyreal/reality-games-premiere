import { NextRequest, NextResponse } from "next/server";

// For now, append to a Google Sheet via the Sheets API.
// The sheet ID and credentials are set via environment variables.

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

async function getAccessToken(): Promise<string> {
  // Create a JWT and exchange it for an access token
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const key = GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!key) throw new Error("Missing GOOGLE_PRIVATE_KEY");

  // Import the private key
  const pemContents = key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const claimB64 = btoa(JSON.stringify(claim))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const signatureInput = encoder.encode(`${headerB64}.${claimB64}`);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signatureInput
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${headerB64}.${claimB64}.${signatureB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

async function appendToSheet(row: string[]) {
  if (!SHEET_ID) {
    console.log("No SHEET_ID configured. Row data:", row);
    return;
  }

  const accessToken = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:A:append?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets API error: ${text}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const timestamp = new Date().toISOString();

    // Main person row
    const mainRow = [
      timestamp,
      body.code || "",
      body.hasComp ? "comp" : "reserve",
      body.name,
      body.email,
      body.phone,
      body.side,
      body.hasPlusOne ? "yes" : "no",
      body.gameOptIn ? "yes" : body.gameNotify ? "notify" : "no",
      body.teamPref || "",
      body.friendRequests || "",
    ];

    await appendToSheet(mainRow);

    // +1 row if applicable
    if (body.hasPlusOne && body.plusOneName) {
      const plusOneRow = [
        timestamp,
        body.code ? `${body.code}-plus1` : "",
        "plus-one",
        body.plusOneName,
        body.plusOneEmail,
        body.plusOnePhone,
        body.plusOneSide,
        "no",
        body.gameOptIn ? "yes" : "no",
        body.teamPref || "",
        "",
      ];
      await appendToSheet(plusOneRow);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("RSVP error:", err);
    return NextResponse.json(
      { error: "Failed to save RSVP. Please try again." },
      { status: 500 }
    );
  }
}

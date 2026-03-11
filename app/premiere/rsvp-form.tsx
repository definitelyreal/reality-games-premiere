"use client";

import { useSearchParams } from "next/navigation";
import { useState, FormEvent, useCallback, useEffect, useRef } from "react";

type Side = "build" | "burn" | null;
type TeamPref = "friends" | "matched" | null;

interface FormData {
  name: string;
  email: string;
  phone: string;
  side: Side;
  hasPlusOne: boolean;
  plusOneName: string;
  plusOneEmail: string;
  plusOnePhone: string;
  plusOneSide: Side;
  plusOneConsent: boolean;
  gameOptIn: boolean;
  teamPref: TeamPref;
  friendRequests: FriendEntry[];
  privacyConsent: boolean;
  gameNotify: boolean;
}

interface FriendEntry {
  name: string;
  contact: string; // email or phone
}

/* ============================================================
   COPY OPTIONS — Michael picks one, then we hardcode it
   ============================================================ */
const COPY_OPTIONS = [
  // 1. THE PROVOCATION
  "A film seven years in the making. A question that won't leave you alone: when the system is rigged, do you fix it or burn it? The answer starts with you.",
  // 2. THE INSIDER
  "You're holding an invitation most people will never see. Come find out what happens when the audience becomes part of the story.",
  // 3. THE DARE
  "Reality Games isn't just a movie. It's a test. Pick a side. Complete missions. Win something real. This is your way in.",
  // 4. THE STAKES
  "450 seats. One night. A film about AI, manipulation, and what happens when people fight back. If you're reading this, someone thought you should be there.",
  // 5. THE MYSTERY
  "Something is happening in San Francisco on May 16. It starts as a film premiere. It becomes something else. The rest unfolds when you say yes.",
];

// Default to option 4 (THE STAKES) — change index to swap
const HERO_COPY = COPY_OPTIONS[3];

export function RSVPForm() {
  const params = useSearchParams();
  const code = params.get("code");
  const hasComp = !!code;

  const [codeInput, setCodeInput] = useState("");
  const [codeSubmitted, setCodeSubmitted] = useState(hasComp);
  const [showTrailer, setShowTrailer] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: params.get("name") || "",
    email: params.get("email") || "",
    phone: "",
    side: null,
    hasPlusOne: false,
    plusOneName: "",
    plusOneEmail: "",
    plusOnePhone: "",
    plusOneSide: null,
    plusOneConsent: false,
    gameOptIn: true, // default ON
    teamPref: null,
    friendRequests: [{ name: "", contact: "" }],
    privacyConsent: false,
    gameNotify: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  function updateFriend(index: number, field: keyof FriendEntry, value: string) {
    setForm((prev) => {
      const updated = [...prev.friendRequests];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, friendRequests: updated };
    });
  }

  function addFriend() {
    setForm((prev) => ({
      ...prev,
      friendRequests: [...prev.friendRequests, { name: "", contact: "" }],
    }));
  }

  function removeFriend(index: number) {
    setForm((prev) => ({
      ...prev,
      friendRequests: prev.friendRequests.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }
    if (!form.side) {
      setError("Please choose a side.");
      return;
    }
    if (codeSubmitted && form.hasPlusOne) {
      if (!form.plusOneName || !form.plusOneEmail || !form.plusOnePhone) {
        setError("Please fill in your +1's information.");
        return;
      }
      if (!form.plusOneSide) {
        setError("Your +1 needs to choose a side too.");
        return;
      }
      if (!form.plusOneConsent) {
        setError("Please confirm your +1 has agreed to participate.");
        return;
      }
    }
    if (form.gameOptIn && form.teamPref === "friends") {
      const validFriends = form.friendRequests.filter((f) => f.name && f.contact);
      if (validFriends.length === 0) {
        setError("Please add at least one friend, or choose 'Match me' instead.");
        return;
      }
    }
    if (!form.privacyConsent) {
      setError("Please accept the privacy policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        code: code || codeInput || null,
        hasComp: codeSubmitted,
        friendRequests: form.friendRequests
          .filter((f) => f.name || f.contact)
          .map((f) => `${f.name} (${f.contact})`)
          .join(", "),
      };
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- SUCCESS STATE ---- */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-8 animate-fade-up">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              form.side === "build" ? "bg-[var(--color-build)]/20" : "bg-[var(--color-burn)]/20"
            }`}
          >
            <span className="text-3xl">{form.side === "build" ? "+" : "/"}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">You're in.</h1>
          <p className="text-[var(--color-text-muted)] text-lg leading-relaxed">
            {codeSubmitted
              ? "We'll be in touch with details as the premiere approaches. Keep an eye on your phone."
              : "You're on the list. We'll reach out when tickets go on sale."}
          </p>
          {form.gameOptIn && (
            <p className="text-[var(--color-text-muted)]">
              The game starts soon. Watch for a message.
            </p>
          )}
          <div
            className={`inline-block px-6 py-3 rounded-full text-sm font-semibold tracking-wide uppercase ${
              form.side === "build" ? "glow-build" : "glow-burn"
            }`}
            style={{
              background: form.side === "build" ? "var(--color-build)" : "var(--color-burn)",
              color: "#000",
            }}
          >
            {form.side === "build" ? "Build it Better" : "Burn it Down"}
          </div>
          <p className="text-xs text-[var(--color-text-dim)]">
            May 16, 2026 &middot; Victoria Theater &middot; San Francisco
          </p>
        </div>
      </div>
    );
  }

  /* ---- MAIN FORM ---- */
  return (
    <>
      <div className="min-h-screen px-6 py-12 md:py-20 flex justify-center">
        <div className="w-full max-w-2xl stagger">
          {/* ---- HERO ---- */}
          <header className="mb-16 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Reality Games
              <br />
              <span className="text-[var(--color-text-muted)]">Premiere + Afterparty</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-xl">
              {HERO_COPY}
            </p>
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-dim)]">
              <span>May 16, 2026</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-text-dim)]" />
              <span>Victoria Theater, SF</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTrailer(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-border-hover)] transition-all group"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="group-hover:scale-110 transition-transform">
                <path d="M6 3.5L12.5 8L6 12.5V3.5Z" />
              </svg>
              Watch Trailer
            </button>
          </header>

          {/* ---- CODE ENTRY ---- */}
          <div className="mb-14">
            {codeSubmitted ? (
              <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-[var(--color-text-muted)]">Your code:</span>
                <span className="font-mono text-sm font-medium tracking-wider">
                  {code || codeInput}
                </span>
                {form.name && (
                  <>
                    <span className="text-[var(--color-text-dim)]">|</span>
                    <span className="text-sm">{form.name}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter invite code"
                    className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-sm font-mono tracking-wider text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-hover)] transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && codeInput) {
                        e.preventDefault();
                        setCodeSubmitted(true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (codeInput) setCodeSubmitted(true);
                    }}
                    disabled={!codeInput}
                    className="px-6 py-3.5 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
                  >
                    Enter
                  </button>
                </div>
                <p className="text-xs text-[var(--color-text-dim)]">
                  No code? No problem. Fill out the form below to get notified when tickets go on sale.
                </p>
              </div>
            )}
          </div>

          {/* ---- FORM ---- */}
          <form onSubmit={handleSubmit} className="space-y-14">
            {/* Basic Info */}
            <Section>
              <Input
                label="Name"
                value={form.name}
                onChange={(v) => update("name", v)}
                placeholder="Your full name"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                placeholder="you@example.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                placeholder="+1 (555) 000-0000"
              />
            </Section>

            {/* +1 Section (comp only) */}
            {codeSubmitted && (
              <Section>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">Bringing someone?</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Add your +1's details below.</p>
                  </div>
                  <Toggle
                    checked={form.hasPlusOne}
                    onChange={(v) => update("hasPlusOne", v)}
                  />
                </div>
                {form.hasPlusOne && (
                  <div className="space-y-4 mt-6 pl-5 border-l-2 border-[var(--color-border)]">
                    <Input
                      label="Their name"
                      value={form.plusOneName}
                      onChange={(v) => update("plusOneName", v)}
                    />
                    <Input
                      label="Their email"
                      type="email"
                      value={form.plusOneEmail}
                      onChange={(v) => update("plusOneEmail", v)}
                    />
                    <Input
                      label="Their phone"
                      type="tel"
                      value={form.plusOnePhone}
                      onChange={(v) => update("plusOnePhone", v)}
                    />
                    <div className="pt-2">
                      <p className="text-sm text-[var(--color-text-muted)] mb-3">
                        Their side:
                      </p>
                      <SideChoice
                        selected={form.plusOneSide}
                        onSelect={(s) => update("plusOneSide", s)}
                        compact
                      />
                    </div>
                    <Checkbox
                      label="I confirm my +1 has agreed to participate and has read the privacy policy"
                      checked={form.plusOneConsent}
                      onChange={(v) => update("plusOneConsent", v)}
                    />
                  </div>
                )}
              </Section>
            )}

            {/* ---- CHOOSE YOUR SIDE ---- */}
            <Section>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Choose your side</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                This determines your team, your missions, and your experience. Choose carefully.
              </p>
              <SideChoice
                selected={form.side}
                onSelect={(s) => update("side", s)}
              />
            </Section>

            {/* ---- THE GAME ---- */}
            <Section>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Let's play a game</h2>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-lg">
                  Between now and premiere night, we're running something. A scavenger hunt across
                  the real world and the digital one. You'll be placed on a team. Given weekly missions
                  tied to the film's themes. Compete against other teams for a prize announced at the
                  afterparty. Your missions depend on which side you chose.
                </p>
                {codeSubmitted ? (
                  <>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">I'm in</span>
                      <Toggle
                        checked={form.gameOptIn}
                        onChange={(v) => update("gameOptIn", v)}
                      />
                    </div>
                    {form.gameOptIn && (
                      <div className="space-y-5 mt-4 pl-5 border-l-2 border-[var(--color-border)]">
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Play with friends or get matched with strangers?
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => update("teamPref", "friends")}
                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                              form.teamPref === "friends"
                                ? "border-white bg-white/10 text-white"
                                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)]"
                            }`}
                          >
                            People I know
                          </button>
                          <button
                            type="button"
                            onClick={() => update("teamPref", "matched")}
                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                              form.teamPref === "matched"
                                ? "border-white bg-white/10 text-white"
                                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)]"
                            }`}
                          >
                            Match me
                          </button>
                        </div>
                        {form.teamPref === "friends" && (
                          <div className="space-y-4">
                            <p className="text-xs text-[var(--color-text-dim)]">
                              Add the people you want on your team. Name plus email or phone.
                            </p>
                            {form.friendRequests.map((friend, i) => (
                              <div key={i} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={friend.name}
                                    onChange={(e) => updateFriend(i, "name", e.target.value)}
                                    placeholder="Name"
                                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-hover)] transition-colors"
                                  />
                                  <input
                                    type="text"
                                    value={friend.contact}
                                    onChange={(e) => updateFriend(i, "contact", e.target.value)}
                                    placeholder="Email or phone"
                                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-hover)] transition-colors"
                                  />
                                </div>
                                {form.friendRequests.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeFriend(i)}
                                    className="mt-2 text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors p-1"
                                    aria-label="Remove"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <path d="M4 4L12 12M12 4L4 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addFriend}
                              className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
                            >
                              + Add another
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <Toggle
                    checked={form.gameNotify}
                    onChange={(v) => update("gameNotify", v)}
                    label="Let me know when the game starts"
                  />
                )}
              </div>
            </Section>

            {/* ---- PRIVACY ---- */}
            <Section>
              <Checkbox
                label={
                  <>
                    I agree to the{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      className="underline hover:text-white transition-colors"
                    >
                      privacy and ethics policy
                    </a>
                  </>
                }
                checked={form.privacyConsent}
                onChange={(v) => update("privacyConsent", v)}
              />
            </Section>

            {/* ---- ERROR ---- */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* ---- SUBMIT ---- */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all uppercase"
            >
              {submitting
                ? "Processing..."
                : codeSubmitted
                ? "Confirm RSVP"
                : "Reserve my spot"}
            </button>
          </form>
        </div>
      </div>

      {/* ---- TRAILER MODAL ---- */}
      {showTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center trailer-backdrop bg-black/80"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-4xl mx-4 aspect-video rounded-2xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Replace this with the actual trailer embed URL */}
            <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)]">
              <p className="text-sm">Trailer embed goes here</p>
            </div>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4L12 12M12 4L4 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function Section({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-[var(--color-text-dim)] mb-2 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-border-hover)] transition-colors"
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      <div
        className={`w-11 h-6 rounded-full relative transition-colors ${
          checked ? "bg-white" : "bg-[var(--color-border)]"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
            checked ? "left-6 bg-black" : "left-1 bg-[var(--color-text-dim)]"
          }`}
        />
      </div>
      {label && (
        <span className="text-sm text-[var(--color-text-muted)] group-hover:text-white transition-colors">
          {label}
        </span>
      )}
    </button>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 group text-left"
    >
      <div
        className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
          checked
            ? "bg-white border-white"
            : "border-[var(--color-border)] group-hover:border-[var(--color-border-hover)]"
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-black">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-[var(--color-text-muted)] group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
}

function SideChoice({
  selected,
  onSelect,
  compact = false,
}: {
  selected: Side;
  onSelect: (s: Side) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-1 sm:grid-cols-2 gap-4"}`}>
      <button
        type="button"
        onClick={() => onSelect("build")}
        className={`text-left rounded-xl border transition-all ${
          compact ? "p-3" : "p-6"
        } ${
          selected === "build"
            ? "border-[var(--color-build)] bg-[var(--color-build-glow)] glow-build"
            : "border-[var(--color-border)] hover:border-[var(--color-build)]/40 bg-[var(--color-surface)]"
        }`}
      >
        <div
          className={`font-bold ${compact ? "text-sm" : "text-lg"}`}
          style={{ color: "var(--color-build)" }}
        >
          Build it Better
        </div>
        {!compact && (
          <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed">
            Build new technology. Build relationships. Forgive quickly. Progress is the only
            lasting solution. Work within the system, because that's where the real levers are.
            When something's broken, you fix it, improve it, make it better than it was.
          </p>
        )}
      </button>
      <button
        type="button"
        onClick={() => onSelect("burn")}
        className={`text-left rounded-xl border transition-all ${
          compact ? "p-3" : "p-6"
        } ${
          selected === "burn"
            ? "border-[var(--color-burn)] bg-[var(--color-burn-glow)] glow-burn"
            : "border-[var(--color-border)] hover:border-[var(--color-burn)]/40 bg-[var(--color-surface)]"
        }`}
      >
        <div
          className={`font-bold ${compact ? "text-sm" : "text-lg"}`}
          style={{ color: "var(--color-burn)" }}
        >
          Burn it Down
        </div>
        {!compact && (
          <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed">
            Take criminals to task. Pry the system from their grubby hands. When the system
            fails us, we need to take action. Social movements, revolutions, fighting for the
            little guy. When something's broken beyond repair, you don't patch it. You tear it
            down and build something new from the ashes.
          </p>
        )}
      </button>
    </div>
  );
}

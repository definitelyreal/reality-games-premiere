import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reality Games: Play For Real",
  description:
    "Reality Games premiere. May 16, 2026. Victoria Theater, San Francisco.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

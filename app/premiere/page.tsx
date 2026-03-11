import { Suspense } from "react";
import { RSVPForm } from "./rsvp-form";

export default function PremierePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">Loading...</div>}>
      <RSVPForm />
    </Suspense>
  );
}

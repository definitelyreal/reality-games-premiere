"use client";

import { useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";

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
  friendRequests: string;
  privacyConsent: boolean;
  gameNotify: boolean;
}

export function RSVPForm() {
  const params = useSearchParams();
  const code = params.get("code");
  const hasComp = !!code;

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
    gameOptIn: false,
    teamPref: null,
    friendRequests: "",
    privacyConsent: false,
    gameNotify: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    if (hasComp && form.hasPlusOne) {
      if (!form.plusOneName || !form.plusOneEmail || !form.plusOnePhone) {
        setError("Please fill in your +1's information.");
        return;
      }
      if (!form.plusOneSide) {
        setError("Your +1 needs to choose a side too.");
        return;
      }
      if (!form.plusOneConsent) {
        setError(
          "Please confirm your +1 has agreed to participate."
        );
        return;
      }
    }
    if (!form.privacyConsent) {
      setError("Please accept the privacy policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, code, hasComp }),
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-6">
          <h1 className="text-3xl font-bold">You're in.</h1>
          <p className="text-[var(--color-text-muted)] text-lg">
            {hasComp
              ? "We'll be in touch with details as the premiere approaches."
              : "You're on the list. We'll reach out when tickets go on sale."}
          </p>
          {form.gameOptIn && (
            <p className="text-[var(--color-text-muted)]">
              The game starts soon. Keep an eye on your phone.
            </p>
          )}
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background:
                form.side === "build"
                  ? "var(--color-build)"
                  : "var(--color-burn)",
            }}
          >
            {form.side === "build" ? "Build it Better" : "Burn it Down"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Reality Games
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            {hasComp
              ? "You've been invited to the premiere."
              : "The Reality Games premiere is coming. Reserve your spot and we'll be in touch when tickets go on sale."}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            May 16, 2026 · Victoria Theater · San Francisco
          </p>
        </div>

        {/* Basic Info */}
        <Section title="Your info">
          <Input
            label="Name"
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="Your name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            placeholder="+1 (555) 000-0000"
            required
          />
        </Section>

        {/* Choose Your Side */}
        <Section title="Choose your side">
          <SideChoice
            selected={form.side}
            onSelect={(s) => update("side", s)}
          />
        </Section>

        {/* +1 (comp only) */}
        {hasComp && (
          <Section title="Bringing someone?">
            <Toggle
              label="I'm bringing a +1"
              checked={form.hasPlusOne}
              onChange={(v) => update("hasPlusOne", v)}
            />
            {form.hasPlusOne && (
              <div className="space-y-4 mt-4 pl-4 border-l-2 border-[var(--color-border)]">
                <Input
                  label="Their name"
                  value={form.plusOneName}
                  onChange={(v) => update("plusOneName", v)}
                  required
                />
                <Input
                  label="Their email"
                  type="email"
                  value={form.plusOneEmail}
                  onChange={(v) => update("plusOneEmail", v)}
                  required
                />
                <Input
                  label="Their phone"
                  type="tel"
                  value={form.plusOnePhone}
                  onChange={(v) => update("plusOnePhone", v)}
                  required
                />
                <div className="pt-2">
                  <p className="text-sm text-[var(--color-text-muted)] mb-3">
                    Your +1 also needs to choose a side:
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

        {/* The Game */}
        {hasComp ? (
          <Section title="The Game">
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4">
              Between now and premiere night, you can join a scavenger hunt.
              You'll be placed on a team, given weekly missions tied to the
              film's themes, and compete for a prize. Missions are different
              depending on which side you chose.
            </p>
            <Toggle
              label="I want to play"
              checked={form.gameOptIn}
              onChange={(v) => update("gameOptIn", v)}
            />
            {form.gameOptIn && (
              <div className="space-y-4 mt-4 pl-4 border-l-2 border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Do you want to play with people you know, or be matched with
                  others?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => update("teamPref", "friends")}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.teamPref === "friends"
                        ? "border-white bg-white/10 text-white"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-white/30"
                    }`}
                  >
                    People I know
                  </button>
                  <button
                    type="button"
                    onClick={() => update("teamPref", "matched")}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.teamPref === "matched"
                        ? "border-white bg-white/10 text-white"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-white/30"
                    }`}
                  >
                    Match me
                  </button>
                </div>
                {form.teamPref === "friends" && (
                  <div>
                    <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">
                      Who do you want on your team? (names, emails, or phone
                      numbers)
                    </label>
                    <textarea
                      value={form.friendRequests}
                      onChange={(e) =>
                        update("friendRequests", e.target.value)
                      }
                      rows={3}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-white/40 transition-colors resize-none"
                      placeholder="Jane Doe (jane@example.com), John Smith (+1 555 123 4567)..."
                    />
                  </div>
                )}
              </div>
            )}
          </Section>
        ) : (
          <Section title="The Game">
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4">
              A scavenger hunt runs alongside the premiere. Teams, missions,
              prizes. More details coming soon.
            </p>
            <Toggle
              label="Let me know when the game starts"
              checked={form.gameNotify}
              onChange={(v) => update("gameNotify", v)}
            />
          </Section>
        )}

        {/* Privacy */}
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

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg font-medium text-sm bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? "Submitting..."
            : hasComp
            ? "Confirm RSVP"
            : "Reserve my spot"}
        </button>
      </form>
    </div>
  );
}

/* ---- Sub-components ---- */

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      )}
      {children}
    </div>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-white/40 transition-colors"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      <div
        className={`w-10 h-6 rounded-full relative transition-colors ${
          checked ? "bg-white" : "bg-[var(--color-border)]"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
            checked
              ? "left-5 bg-black"
              : "left-1 bg-[var(--color-text-muted)]"
          }`}
        />
      </div>
      <span className="text-sm text-[var(--color-text-muted)] group-hover:text-white transition-colors">
        {label}
      </span>
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
            : "border-[var(--color-border)] group-hover:border-white/40"
        }`}
      >
        {checked && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="text-black"
          >
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <button
        type="button"
        onClick={() => onSelect("build")}
        className={`w-full text-left rounded-lg border transition-all ${
          compact ? "p-3" : "p-5"
        } ${
          selected === "build"
            ? "border-[var(--color-build)] bg-[var(--color-build)]/10"
            : "border-[var(--color-border)] hover:border-[var(--color-build)]/50"
        }`}
      >
        <div
          className={`font-semibold ${compact ? "text-sm" : "text-base"}`}
          style={{ color: "var(--color-build)" }}
        >
          Build it Better
        </div>
        {!compact && (
          <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
            Build new technology. Build relationships. Forgive quickly. Progress
            is the only lasting solution. Work within the system, because
            that's where the real levers are. Deal with reality as it really
            is, not as you'd wish it to be. When something's broken, you fix
            it, improve it, make it better than it was.
          </p>
        )}
      </button>
      <button
        type="button"
        onClick={() => onSelect("burn")}
        className={`w-full text-left rounded-lg border transition-all ${
          compact ? "p-3" : "p-5"
        } ${
          selected === "burn"
            ? "border-[var(--color-burn)] bg-[var(--color-burn)]/10"
            : "border-[var(--color-border)] hover:border-[var(--color-burn)]/50"
        }`}
      >
        <div
          className={`font-semibold ${compact ? "text-sm" : "text-base"}`}
          style={{ color: "var(--color-burn)" }}
        >
          Burn it Down
        </div>
        {!compact && (
          <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
            Take criminals to task. Pry the system from their grubby hands.
            When the system fails us, we need to take action. Fire makes
            lasting change. Social movements, revolutions, fighting for the
            little guy. When something's broken beyond repair, you don't patch
            it. You tear it down and build something new from the ashes.
          </p>
        )}
      </button>
    </div>
  );
}

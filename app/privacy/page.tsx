export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-12 flex justify-center">
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Privacy & Ethics Policy
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Reality Games Premiere Experience
          </p>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Last updated: March 11, 2026
          </p>
        </div>

        <PolicySection title="What this is">
          <p>
            Reality Games is a feature film about AI, manipulation, and agency.
            The premiere experience uses AI-generated content as part of the
            event, consistent with the film's themes. This policy explains what
            we collect, how we use it, and your rights.
          </p>
        </PolicySection>

        <PolicySection title="What we collect">
          <p>When you RSVP, we collect:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Your name, email address, and phone number</li>
            <li>
              Your choice of "Build it Better" or "Burn it Down" (used to
              personalize your experience)
            </li>
            <li>
              Whether you opt into the scavenger hunt game, and your team
              preferences
            </li>
            <li>
              Information about your +1 if you bring one (provided with their
              consent)
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="AI-generated content">
          <p>
            This experience uses AI-generated content, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Personalized video invitations</strong> featuring an
              AI-generated likeness of Michael Morgenstern (the director). These
              are deepfake videos created using voice cloning and video avatar
              technology. They are not real recordings.
            </li>
            <li>
              <strong>An AI chatbot</strong> that communicates in Michael's
              style. This is not the real Michael. It's an AI trained on his
              communication patterns. It will always identify itself as an AI
              when asked directly.
            </li>
            <li>
              <strong>Game communications</strong> sent via Signal or SMS that
              may be generated or assisted by AI.
            </li>
          </ul>
          <p className="mt-3">
            We believe in transparency about AI use. The use of AI in this
            experience is thematic: the film itself is about what happens when AI
            is used to manipulate people without their knowledge. We're doing the
            opposite: telling you upfront.
          </p>
        </PolicySection>

        <PolicySection title="How we use your data">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              To send you premiere information, tickets, and event details
            </li>
            <li>
              To personalize your experience based on your Build/Burn choice
            </li>
            <li>
              To place you on a scavenger hunt team if you opt in
            </li>
            <li>
              To contact you via phone, email, or Signal about the event and
              game
            </li>
            <li>
              To generate a personalized AI video invitation using publicly
              available information about you (your name and, if you provide a
              social media profile, publicly posted content)
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="The scavenger hunt game">
          <p>If you opt into the game:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              You'll be placed in a Signal group with 5-7 other participants
            </li>
            <li>
              Your name will be visible to your team members and on the public
              leaderboard (you can request to use a pseudonym)
            </li>
            <li>
              Submissions you make for missions may be displayed on the
              leaderboard website for voting
            </li>
            <li>
              Your participation data (points, submissions, team) is stored in
              our database
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="Your likeness">
          <p>
            We will not create AI-generated content of your likeness without
            your explicit, separate consent. The deepfake invitations feature
            Michael Morgenstern only. If any premiere activities involve
            generating content with your likeness (e.g., a deepfake photo
            booth), you will be asked for consent at that time.
          </p>
        </PolicySection>

        <PolicySection title="Data sharing">
          <p>
            We don't sell your data. We share it only with:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Service providers that help run the experience (hosting, messaging,
              AI generation platforms)
            </li>
            <li>
              Your scavenger hunt team members (name only, if you opt into the
              game)
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="Data retention">
          <p>
            We keep your data for the duration of the premiere campaign (through
            summer 2026). After that, we retain only what's needed for any
            ongoing screenings or follow-up events. You can request deletion at
            any time.
          </p>
        </PolicySection>

        <PolicySection title="Your rights">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Access:</strong> You can ask what data we have about you
            </li>
            <li>
              <strong>Correction:</strong> You can ask us to fix incorrect data
            </li>
            <li>
              <strong>Deletion:</strong> You can ask us to delete your data at
              any time
            </li>
            <li>
              <strong>Opt out:</strong> You can leave the game at any time by
              telling the bot or contacting us
            </li>
            <li>
              <strong>Pseudonym:</strong> You can request to use a pseudonym on
              the public leaderboard
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="Contact">
          <p>
            Questions about this policy or your data? Email{" "}
            <a
              href="mailto:privacy@definitelyreal.com"
              className="underline hover:text-white transition-colors"
            >
              privacy@definitelyreal.com
            </a>
          </p>
        </PolicySection>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            Definitely Real, Inc. · San Francisco, CA
          </p>
        </div>
      </div>
    </div>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-[var(--color-text-muted)] text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

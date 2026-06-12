import { Link, createFileRoute } from "@tanstack/react-router";
import { FiArrowLeft, FiShield } from "react-icons/fi";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Auralis" },
      {
        name: "description",
        content: "Read the Auralis privacy policy before signing in with Google.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <section className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="mb-8">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FiShield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy - Auralis Music</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: June 11, 2026</p>
        </div>

        <div className="space-y-6 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">Information We Collect</h2>
            <p>
              When you use Auralis, we may collect the following information.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-bold text-foreground">Account Information</h3>
                <p>When you sign in with Google, we may collect:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Profile picture</li>
                  <li>Unique account identifier</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-foreground">Music Activity</h3>
                <p>To improve your experience, we may store:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Recently played songs</li>
                  <li>Liked songs</li>
                  <li>Playlists you create</li>
                  <li>Listening history</li>
                  <li>App preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-foreground">Device & Usage Information</h3>
                <p>We may automatically collect:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Browser type</li>
                  <li>Device information</li>
                  <li>IP address</li>
                  <li>App usage statistics</li>
                  <li>Error logs and diagnostics</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Authenticate your account</li>
              <li>Save your music preferences</li>
              <li>Synchronize data across devices</li>
              <li>Display recently played songs</li>
              <li>Manage playlists and favorites</li>
              <li>Improve app performance and reliability</li>
              <li>Prevent abuse and unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">Data Storage</h2>
            <p>
              Your account and music activity data are stored securely using third-party cloud
              services, including Supabase.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">Third-Party Services</h2>
            <p>Auralis may use third-party services including:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Google Authentication</li>
              <li>Supabase</li>
              <li>YouTube for music discovery and playback</li>
              <li>SoundCloud for music streaming and search</li>
            </ul>
            <p>
              These services may collect information according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">Data Sharing</h2>
            <p>We do not sell your personal information.</p>
            <p className="mt-2">We may share data only:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>When required by law</li>
              <li>To protect users and the platform</li>
              <li>With service providers necessary for app functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">Your Rights</h2>
            <p>You may:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access your account information</li>
              <li>Request correction of inaccurate information</li>
              <li>Delete your account</li>
              <li>Request deletion of stored music activity</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">Data Security</h2>
            <p>
              We implement reasonable security measures to protect user information from
              unauthorized access, disclosure, or misuse.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">Children's Privacy</h2>
            <p>Auralis is not intended for children under 13 years of age.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Continued use of Auralis after
              updates constitutes acceptance of the revised policy.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

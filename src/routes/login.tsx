import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiLock, FiMusic } from "react-icons/fi";
import { Checkbox } from "@/components/ui/checkbox";
import { builtInAvatars, pendingAvatarKey } from "@/lib/avatars";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - Auralis" },
      { name: "description", content: "Sign in to your Auralis music account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(builtInAvatars[0].id);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");

    if (!acceptedPrivacyPolicy) {
      setError("Please accept the privacy policy before continuing with Google.");
      return;
    }

    setLoading(true);
    localStorage.setItem(pendingAvatarKey, selectedAvatar);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (authError) {
      setError(
        authError.message.toLowerCase().includes("unsupported provider")
          ? "Google sign in is not enabled in Supabase yet."
          : authError.message,
      );
      return;
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-5xl items-center gap-8 py-8 lg:grid-cols-[1fr_24rem]">
      <section className="text-center lg:text-left">
        <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-glow)]">
          <FiMusic className="h-7 w-7" />
        </div>
        <h1 className="mx-auto mt-5 max-w-sm text-3xl font-extrabold leading-tight sm:text-4xl lg:mx-0 lg:mt-6 lg:max-w-lg lg:text-5xl">
          Sign in and keep your music close.
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground sm:max-w-sm lg:mx-0 lg:mt-4 lg:max-w-md">
          Continue with Google to access your saved library, liked songs, and recent plays.
        </p>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="mb-8">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FiLock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with Google to continue your music session.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-3 text-sm font-semibold">Choose avatar</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {builtInAvatars.map((avatar) => {
                const active = selectedAvatar === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    aria-label={`Choose ${avatar.label} avatar`}
                    className={`grid aspect-square place-items-center rounded-2xl border bg-background p-1 transition-all ${
                      active ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/60"
                    }`}
                  >
                    <img
                      src={avatar.imageUrl}
                      alt={avatar.label}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">{error}</p>}

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
            <Checkbox
              checked={acceptedPrivacyPolicy}
              onCheckedChange={(checked) => setAcceptedPrivacyPolicy(checked === true)}
              className="mt-1"
              aria-label="Accept privacy policy"
            />
            <span>
              I agree to the{" "}
              <Link to="/privacy-policy" className="font-semibold text-primary underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !acceptedPrivacyPolicy}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FcGoogle className="h-5 w-5" />
            {loading ? "Opening Google..." : "Sign in with Google"}
          </button>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            {/* Only Google sign in is enabled for this app. */}
          </p>
        </div>
      </section>
    </div>
  );
}

// import { createFileRoute } from "@tanstack/react-router";
// import { useState } from "react";
// import { FcGoogle } from "react-icons/fc";
// import { FiLock, FiMusic } from "react-icons/fi";
// import { builtInAvatars, pendingAvatarKey } from "@/lib/avatars";
// import { supabase } from "@/lib/supabase";

// export const Route = createFileRoute("/login")({
//   head: () => ({
//     meta: [
//       { title: "Login - Auralis" },
//       { name: "description", content: "Sign in to your Auralis music account." },
//     ],
//   }),
//   component: LoginPage,
// });

// function LoginPage() {
//   const [selectedAvatar, setSelectedAvatar] = useState(builtInAvatars[0].id);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleGoogleSignIn = async () => {
//     setError("");
//     setLoading(true);
//     localStorage.setItem(pendingAvatarKey, selectedAvatar);

//     const { error: authError } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: window.location.origin,
//       },
//     });

//     setLoading(false);

//     if (authError) {
//       setError(
//         authError.message.toLowerCase().includes("unsupported provider")
//           ? "Google sign in is not enabled in Supabase yet."
//           : authError.message,
//       );
//       return;
//     }
//   };

//   return (
//     <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 lg:min-h-[calc(100vh-12rem)] lg:py-8">
//       <div className="w-full lg:grid lg:grid-cols-[1fr_24rem] lg:gap-8">
//         {/* Left hero section – hidden on mobile */}
//         <section className="hidden lg:block">
//           <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-glow)]">
//             <FiMusic className="h-7 w-7" />
//           </div>
//           <h1 className="mt-6 max-w-lg text-5xl font-extrabold leading-tight">
//             Sign in and keep your music close.
//           </h1>
//           <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
//             Continue with Google to access your saved library, liked songs, and recent plays.
//           </p>
//         </section>

//         {/* Sign‑in card – full width on mobile */}
//         <section className="w-full rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6 md:p-8">
//           <div className="mb-6 sm:mb-8">
//             <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
//               <FiLock className="h-5 w-5 sm:h-6 sm:w-6" />
//             </div>
//             <h2 className="text-xl font-bold sm:text-2xl">Welcome back</h2>
//             <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
//               Sign in with Google to continue your music session.
//             </p>
//           </div>

//           <div className="space-y-5 sm:space-y-6">
//             {/* Avatar selection – responsive grid */}
//             <div>
//               <p className="mb-2 text-sm font-semibold sm:mb-3">Choose avatar</p>
//               <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
//                 {builtInAvatars.map((avatar) => {
//                   const active = selectedAvatar === avatar.id;
//                   return (
//                     <button
//                       key={avatar.id}
//                       type="button"
//                       onClick={() => setSelectedAvatar(avatar.id)}
//                       aria-label={`Choose ${avatar.label} avatar`}
//                       className={`grid aspect-square place-items-center rounded-2xl border bg-background p-1 transition-all active:scale-95 ${
//                         active
//                           ? "border-primary ring-2 ring-primary/40"
//                           : "border-border hover:border-primary/60"
//                       }`}
//                     >
//                       <img
//                         src={avatar.imageUrl}
//                         alt={avatar.label}
//                         className="h-full w-full rounded-xl object-cover"
//                       />
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Error message */}
//             {error && (
//               <p className="rounded-2xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary sm:px-4 sm:py-3 sm:text-sm">
//                 {error}
//               </p>
//             )}

//             {/* Google sign in button – touch friendly */}
//             <button
//               type="button"
//               onClick={handleGoogleSignIn}
//               disabled={loading}
//               className="flex w-full items-center justify-center gap-3 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:px-5 sm:py-3"
//             >
//               <FcGoogle className="h-5 w-5" />
//               {loading ? "Opening Google..." : "Sign in with Google"}
//             </button>

//             {/* Optional footer note – hidden on very small screens */}
//             <p className="hidden text-center text-xs leading-5 text-muted-foreground sm:block">
//               {/* Only Google sign in is enabled for this app. */}
//             </p>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

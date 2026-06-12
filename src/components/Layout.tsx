import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { PlayerProvider } from "@/context/PlayerContext";
import { pendingAvatarKey, userAvatarKey } from "@/lib/avatars";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { BotGreeting } from "./BotGreeting";
import { MusicPlayer } from "./MusicPlayer";

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSession] = useState<Session | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const isLoginPage = pathname === "/login";
  const isPrivacyPolicyPage = pathname === "/privacy-policy";
  const isPublicPage = isLoginPage || isPrivacyPolicyPage;

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setCheckingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setAvatarId(null);
      return;
    }

    const key = userAvatarKey(session.user.id);
    const pendingAvatar = localStorage.getItem(pendingAvatarKey);

    if (pendingAvatar) {
      localStorage.setItem(key, pendingAvatar);
      localStorage.removeItem(pendingAvatarKey);
      setAvatarId(pendingAvatar);
      return;
    }

    setAvatarId(localStorage.getItem(key));
  }, [session]);

  useEffect(() => {
    if (checkingAuth) return;

    if (!session && !isPublicPage) {
      navigate({ to: "/login", replace: true });
    }

    if (session && isLoginPage) {
      navigate({ to: "/", replace: true });
    }
  }, [checkingAuth, isLoginPage, isPublicPage, navigate, session]);

  if (checkingAuth) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
        <div>
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">Loading Auralis...</p>
        </div>
      </div>
    );
  }

  if (!session && !isPublicPage) {
    return null;
  }

  if (session && isLoginPage) {
    return null;
  }

  return (
    <PlayerProvider>
      <div className="flex min-h-screen w-full bg-background">
        {!isPublicPage && session && <Sidebar session={session} avatarId={avatarId} />}
        <div className="min-w-0 flex-1 overflow-x-hidden">
          <main className="mx-auto max-w-5xl px-4 pb-48 pt-6 sm:px-6 lg:pb-40">
            {children}
            {/* <footer className="pt-12 text-center text-xs font-medium text-muted-foreground">
              Build by Manish
            </footer> */}
          </main>
        </div>
        <BotGreeting session={session} isPublicPage={isPublicPage} />
        {!isPublicPage && <MusicPlayer />}
        {!isPublicPage && session && <BottomNav session={session} avatarId={avatarId} />}
      </div>
    </PlayerProvider>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}

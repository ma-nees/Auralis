import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { FiHome, FiSearch, FiHeart, FiMusic, FiLogOut, FiPlusCircle } from "react-icons/fi";
import { playlists } from "@/data/music";
import { getBuiltInAvatar } from "@/lib/avatars";
import { supabase } from "@/lib/supabase";

const items = [
  { to: "/", label: "Home", icon: FiHome },
  { to: "/search", label: "Search", icon: FiSearch },
  { to: "/library", label: "Your Library", icon: FiMusic },
  { to: "/favorites", label: "Liked Songs", icon: FiHeart },
] as const;

export function Sidebar({ session, avatarId }: { session: Session; avatarId: string | null }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountClosing, setAccountClosing] = useState(false);
  const userName =
    session.user.user_metadata.full_name ||
    session.user.user_metadata.name ||
    session.user.email ||
    "User";
  const avatarUrl = session.user.user_metadata.avatar_url;
  const builtInAvatar = getBuiltInAvatar(avatarId);
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };
  const closeAccount = () => {
    setAccountClosing(true);
    window.setTimeout(() => {
      setAccountOpen(false);
      setAccountClosing(false);
    }, 150);
  };

  useEffect(() => {
    if (!accountOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        closeAccount();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [accountOpen]);

  return (
    <aside className="sticky top-0 h-screen hidden w-64 shrink-0 flex-col gap-6 border-r border-border/60 bg-surface/40 p-6 lg:flex">
      <Link to="/" className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-glow)]">
          <FiMusic className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-bold">Auralis</span>
      </Link>

      <nav>
        <ul className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted ${
                    active ? "bg-muted text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Playlists
        </p>
        <ul className="space-y-1">
          {playlists.map((p) => (
            <li key={p.id}>
              <Link
                to="/library"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <img
                  src={p.cover}
                  alt={p.name}
                  loading="lazy"
                  className="h-9 w-9 rounded-md object-cover"
                />
                <span className="truncate">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div ref={accountRef} className="relative">
        <button
          type="button"
          onClick={() => {
            if (accountOpen) {
              closeAccount();
              return;
            }

            setAccountClosing(false);
            setAccountOpen(true);
          }}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left transition-colors hover:bg-secondary"
        >
          {builtInAvatar ? (
            <img
              src={builtInAvatar.imageUrl}
              alt={builtInAvatar.label}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>
        </button>

        {accountOpen && (
          <div
            className={`absolute bottom-full left-0 right-0 mb-2 origin-bottom rounded-2xl border border-border/60 bg-card p-2 shadow-[var(--shadow-soft)] transition-all duration-150 ${
              accountClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FiPlusCircle className="h-4 w-4" />
              Add account
            </button>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { FiHome, FiSearch, FiHeart, FiMusic, FiLogOut, FiPlusCircle } from "react-icons/fi";
import { getBuiltInAvatar } from "@/lib/avatars";
import { supabase } from "@/lib/supabase";

const items = [
  { to: "/", label: "Home", icon: FiHome },
  { to: "/search", label: "Search", icon: FiSearch },
  { to: "/library", label: "Library", icon: FiMusic },
  { to: "/favorites", label: "Liked", icon: FiHeart },
] as const;

export function BottomNav({ session, avatarId }: { session: Session; avatarId: string | null }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const accountRef = useRef<HTMLElement | null>(null);
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
    <nav ref={accountRef} className="fixed inset-x-0 bottom-0 z-40 glass border-t border-border/60 lg:hidden">
      {accountOpen && (
        <div
          className={`absolute bottom-full right-3 mb-3 w-48 origin-bottom-right rounded-2xl border border-border/60 bg-card p-2 shadow-[var(--shadow-soft)] transition-all duration-150 ${
            accountClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="border-b border-border/60 px-3 py-2">
            <p className="truncate text-sm font-bold">{userName}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>
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

      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`}
                />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
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
            className={`flex w-full flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
              accountOpen ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {builtInAvatar ? (
              <img
                src={builtInAvatar.imageUrl}
                alt={builtInAvatar.label}
                className={`h-6 w-6 rounded-full object-cover transition-transform ${accountOpen ? "scale-110" : ""}`}
              />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className={`h-6 w-6 rounded-full object-cover transition-transform ${accountOpen ? "scale-110" : ""}`}
              />
            ) : (
              <span className={`grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground transition-transform ${accountOpen ? "scale-110" : ""}`}>
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
            Profile
          </button>
        </li>
      </ul>
    </nav>
  );
}

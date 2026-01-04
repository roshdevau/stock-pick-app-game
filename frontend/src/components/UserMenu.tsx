"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "aws-amplify/auth";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

const iconOptions = [
  {
    id: "dino",
    label: "Dino",
    svg: (
      <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
        <path
          d="M9 28c0-8 6-14 14-14h6c6 0 10 4 10 10v9H9v-5z"
          fill="#1a8f7a"
        />
        <path d="M21 13l4-6 4 6" fill="#f5d27a" />
        <circle cx="29" cy="21" r="2" fill="#132a23" />
        <path d="M14 33h6v6h-6zM28 33h6v6h-6z" fill="#1a8f7a" />
      </svg>
    ),
  },
  {
    id: "rocket",
    label: "Rocket",
    svg: (
      <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
        <path d="M24 6c8 4 12 12 12 22l-12 6-12-6c0-10 4-18 12-22z" fill="#f26f63" />
        <circle cx="24" cy="20" r="4" fill="#fff3d4" />
        <path d="M16 34l-6 6 8-2zM32 34l6 6-8-2z" fill="#f2b880" />
      </svg>
    ),
  },
  {
    id: "robot",
    label: "Robot",
    svg: (
      <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
        <rect x="10" y="12" width="28" height="26" rx="6" fill="#7aa6f5" />
        <circle cx="19" cy="24" r="3" fill="#0f1f3a" />
        <circle cx="29" cy="24" r="3" fill="#0f1f3a" />
        <path d="M18 32h12" stroke="#0f1f3a" strokeWidth="2" />
        <rect x="21" y="6" width="6" height="6" rx="2" fill="#7aa6f5" />
      </svg>
    ),
  },
  {
    id: "star",
    label: "Star",
    svg: (
      <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
        <path
          d="M24 6l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z"
          fill="#f2b880"
        />
      </svg>
    ),
  },
  {
    id: "cat",
    label: "Cat",
    svg: (
      <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
        <path d="M12 18l6-8 6 6 6-6 6 8v16H12z" fill="#f5a97f" />
        <circle cx="20" cy="26" r="2" fill="#3a2d22" />
        <circle cx="28" cy="26" r="2" fill="#3a2d22" />
        <path d="M22 30h4" stroke="#3a2d22" strokeWidth="2" />
      </svg>
    ),
  },
];

const themeOptions = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

const readStoredPrefs = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as { avatarId?: string; theme?: string } | null;
  } catch {
    return null;
  }
};

const writeStoredPrefs = (key: string, prefs: { avatarId?: string; theme?: string }) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors to avoid breaking UI.
  }
};

export default function UserMenu() {
  const { signedIn, checking, userName, userId, isConfigured } = useAuth();
  const prefsKey = useMemo(
    () => (userId ? `spg.preferences.${userId}` : "spg.preferences"),
    [userId]
  );
  const [displayName, setDisplayName] = useState(userName);
  const [open, setOpen] = useState(false);
  const [avatarId, setAvatarId] = useState(() => readStoredPrefs(prefsKey)?.avatarId ?? "dino");
  const [theme, setTheme] = useState(() => readStoredPrefs(prefsKey)?.theme ?? "light");
  const menuRef = useRef<HTMLDivElement | null>(null);

  if (!isConfigured) {
    return null;
  }

  useEffect(() => {
    setDisplayName(userName);
  }, [userName]);

  useEffect(() => {
    const stored = readStoredPrefs(prefsKey);
    if (stored?.avatarId) setAvatarId(stored.avatarId);
    if (stored?.theme) setTheme(stored.theme);
  }, [prefsKey]);

  useEffect(() => {
    if (!signedIn) {
      setOpen(false);
      setDisplayName("Player");
      return;
    }

    let alive = true;
    (async () => {
      const profile = await api.getProfile().catch(() => null);
      if (!alive) return;
      setDisplayName(profile?.displayName || userName);
      if (profile?.avatarId) setAvatarId(profile.avatarId);
      if (profile?.theme) setTheme(profile.theme);
      writeStoredPrefs(prefsKey, {
        avatarId: profile?.avatarId || avatarId,
        theme: profile?.theme || theme,
      });
    })();

    return () => {
      alive = false;
    };
  }, [signedIn, userName, prefsKey, avatarId, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current || !event.target) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedIcon = useMemo(
    () => iconOptions.find((icon) => icon.id === avatarId) || iconOptions[0],
    [avatarId]
  );

  if (checking) {
    return (
      <div className="h-9 w-24 rounded-full border border-[var(--card-border)] bg-[var(--card)]/80" />
    );
  }

  if (!signedIn) {
    return (
      <a
        className="rounded-full border border-[var(--card-border)] bg-[var(--card)]/80 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--teal)]"
        href="/login"
      >
        Sign in
      </a>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)]/80 px-3 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--teal)]"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-sand)]">
          {selectedIcon.svg}
        </span>
        <span className="max-w-[160px] truncate text-left text-sm font-semibold">
          {displayName}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-3 w-80 rounded-3xl border border-[var(--card-border)] bg-[var(--card)]/95 p-4 text-[var(--ink)] shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">User</p>
          <p className="mt-2 text-sm font-semibold">{displayName}</p>

          <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Customize avatar</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon.id}
                  className={`flex items-center justify-center rounded-2xl border px-2 py-2 ${
                    avatarId === icon.id ? "border-[var(--teal)]" : "border-[var(--card-border)]"
                  }`}
                  onClick={() => {
                    setAvatarId(icon.id);
                    writeStoredPrefs(prefsKey, { avatarId: icon.id, theme });
                    api.updatePreferences({ avatarId: icon.id }).catch(() => {});
                  }}
                  aria-label={icon.label}
                >
                  {icon.svg}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Background</p>
            <div className="mt-2 flex gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    theme === option.id ? "border-[var(--teal)] text-[var(--teal)]" : "border-[var(--card-border)]"
                  }`}
                  onClick={() => {
                    setTheme(option.id);
                    writeStoredPrefs(prefsKey, { avatarId, theme: option.id });
                    api.updatePreferences({ theme: option.id }).catch(() => {});
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold"
              onClick={async () => {
                await signOut().catch(() => {});
                setOpen(false);
                window.location.href = "/";
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/components/AuthProvider";
import { useIsAdmin } from "@/lib/hooks-auth";
const participantNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trade", label: "Trade" },
  { href: "/orders", label: "Orders" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const adminNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { signedIn, checking } = useAuth();
  const isAdmin = useIsAdmin();
  const visibleNav = signedIn ? (isAdmin ? adminNav : participantNav) : [];

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-4 pt-8 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--teal)] text-white">
            SP
          </div>
          <div>
            <p className="text-lg font-semibold">Stock Pick Game</p>
            <p className="text-sm text-[var(--muted)]">Season Alpha</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {checking
              ? null
              : visibleNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm transition hover:border-[var(--teal)] hover:text-[var(--teal)]"
                  >
                    {item.label}
                  </Link>
                ))}
          </nav>
          <UserMenu />
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="glass-card flex flex-col gap-2 rounded-3xl px-6 py-6">
          {subtitle ? (
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{subtitle}</p>
          ) : null}
          <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
        <AuthGate>{children}</AuthGate>
      </main>
    </div>
  );
}

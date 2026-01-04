"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--teal)] text-white">
            SP
          </div>
          <div>
            <p className="text-lg font-semibold">Stock Pick Game</p>
            <p className="text-sm text-[var(--muted)]">Real-time paper trading</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/leaderboard" className="hover:text-[var(--teal)]">
            Leaderboard
          </Link>
        </nav>
        <Link
          href="/login"
          className="rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold !text-white shadow-sm transition hover:-translate-y-0.5"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-24 pt-10 md:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col gap-6">
          <span className="w-fit rounded-full border border-[var(--card-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Paper trading league
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Draft your portfolio.
            <br />
            Trade the market.
            <br />
            Climb the leaderboard.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
            The Stock Pick Game gives every player a virtual kitty and a real-time market feed.
            Place market or limit orders, track performance, and compete across seasons.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-[var(--teal)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Start trading
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-full border border-[var(--card-border)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5"
            >
              View leaderboard
            </Link>
          </div>
          <div className="grid gap-4 pt-6 sm:grid-cols-3">
            {[
              { label: "Players", value: "500+" },
              { label: "Quotes", value: "Real-time" },
              { label: "Seasons", value: "Always on" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl px-5 py-4">
                <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card flex flex-col gap-5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Today</p>
              <p className="text-2xl font-semibold">Market pulse</p>
            </div>
            <span className="rounded-full bg-[var(--sunset)] px-3 py-1 text-xs font-semibold">
              Live
            </span>
          </div>
          <div className="grid gap-4">
            {[
              { symbol: "AAPL", price: "187.42", change: "+1.2%" },
              { symbol: "NVDA", price: "924.10", change: "+2.9%" },
              { symbol: "AMZN", price: "184.35", change: "-0.4%" },
            ].map((item) => (
              <div key={item.symbol} className="flex items-center justify-between rounded-2xl border border-[var(--card-border)] px-4 py-3">
                <div>
                  <p className="text-sm text-[var(--muted)]">{item.symbol}</p>
                  <p className="text-lg font-semibold">${item.price}</p>
                </div>
                <span className="text-sm font-semibold">{item.change}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-[var(--card-border)] px-4 py-4 text-sm text-[var(--muted)]">
            Get streaming quotes when available. We fall back to cached pricing to keep costs low.
          </div>
        </section>
      </main>
    </div>
  );
}

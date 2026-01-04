"use client";

import AppShell from "@/components/AppShell";
import { useLeaderboard } from "@/lib/hooks";

export default function LeaderboardPage() {
  const { data: leaderboard = [] } = useLeaderboard();

  return (
    <AppShell title="Leaderboard" subtitle="Season performance">
      <div className="glass-card rounded-3xl p-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)]">
          <div className="grid grid-cols-4 gap-3 bg-[var(--bg-sand)] px-4 py-3 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
            <span>Rank</span>
            <span>Player</span>
            <span>Return</span>
            <span>Portfolio</span>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {leaderboard.map((row) => (
              <div key={row.rank} className="grid grid-cols-4 gap-3 px-4 py-4 text-sm">
                <span className="font-semibold">#{row.rank}</span>
                <span>{row.name}</span>
                <span className="text-[var(--teal)]">+{row.return.toFixed(1)}%</span>
                <span>${row.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

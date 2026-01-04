"use client";

export default function LoadingScreen({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)]/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--card-border)] bg-white/90 px-6 py-5 text-sm shadow-xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--card-border)] border-t-[var(--teal)]" />
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      </div>
    </div>
  );
}

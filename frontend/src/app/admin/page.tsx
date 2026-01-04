import AppShell from "@/components/AppShell";

export default function AdminPage() {
  return (
    <AppShell title="Admin console" subtitle="Game operations">
      <div className="glass-card rounded-3xl p-6 text-sm text-[var(--muted)]">
        Admin tools are now available from the Dashboard.
      </div>
    </AppShell>
  );
}

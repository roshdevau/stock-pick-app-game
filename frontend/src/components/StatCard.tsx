export default function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="glass-card flex flex-col gap-3 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <span>{label}</span>
        {delta ? <span className="font-semibold text-[var(--teal)]">{delta}</span> : null}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

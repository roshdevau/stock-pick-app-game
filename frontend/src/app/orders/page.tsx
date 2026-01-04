"use client";

import AppShell from "@/components/AppShell";
import { useOrders } from "@/lib/hooks";

export default function OrdersPage() {
  const { data: orders = [] } = useOrders();

  return (
    <AppShell title="Orders" subtitle="Manage open and filled orders">
      <div className="glass-card rounded-3xl p-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)]">
          <div className="grid grid-cols-6 gap-3 bg-[var(--bg-sand)] px-4 py-3 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
            <span>Order</span>
            <span>Symbol</span>
            <span>Side</span>
            <span>Type</span>
            <span>Qty</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {orders.map((order) => (
              <div key={order.orderId || `${order.symbol}-${order.createdAt}`} className="grid grid-cols-6 gap-3 px-4 py-4 text-sm">
                <span className="font-semibold">{order.orderId}</span>
                <span>{order.symbol}</span>
                <span>{order.side}</span>
                <span>{order.type}</span>
                <span>{order.qty.toFixed(2)}</span>
                <span className={order.status === "Pending" ? "text-[var(--teal)]" : "text-[var(--muted)]"}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

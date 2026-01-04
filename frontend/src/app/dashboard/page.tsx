"use client";

import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import {
  useAdminUserOrders,
  useAdminUsers,
  useOrders,
  usePortfolio,
} from "@/lib/hooks";
import { useIsAdmin } from "@/lib/hooks-auth";

export default function DashboardPage() {
  const isAdmin = useIsAdmin();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <ParticipantDashboard />;
}

function AdminDashboard() {
  const { data: users = [], isLoading, error } = useAdminUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: userOrders = [] } = useAdminUserOrders(selectedUserId || undefined);
  const [fundingUserId, setFundingUserId] = useState<string | null>(null);
  const [funding, setFunding] = useState({ userId: "", amount: "" });
  const queryClient = useQueryClient();
  const toggleStatus = useMutation({
    mutationFn: async (payload: { userId: string; disabled: boolean }) => {
      if (payload.disabled) {
        return api.enableUser(payload.userId);
      }
      return api.disableUser(payload.userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
  const fundUser = useMutation({
    mutationFn: api.fundUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setFunding({ userId: "", amount: "" });
      setFundingUserId(null);
    },
  });

  return (
    <AppShell title="Dashboard" subtitle="">
      <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-100 px-5 py-4 text-sm font-semibold text-amber-900">
        Logged in Administrator
      </div>
      <div className="glass-card rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Users</p>
        {isLoading ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Loading users…</p>
        ) : null}
        {error ? (
          <p className="mt-4 text-sm text-red-600">{String(error.message || error)}</p>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 text-sm">
          {users.map((user: any) => (
            <div
              key={user.userId}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--card-border)] px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-xs text-[var(--muted)]">{user.userId}</p>
              </div>
              <div className="text-xs text-[var(--muted)] md:text-right">
                <p>Cash: ${Number(user.currentCash || 0).toFixed(2)}</p>
                <p>P&L: ${Number(user.pnl || 0).toFixed(2)}</p>
                <p>Status: {user.disabled ? "Disabled" : "Active"}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  className="rounded-full border border-[var(--card-border)] px-3 py-1 font-semibold"
                  onClick={() => {
                    setSelectedUserId(user.userId);
                  }}
                >
                  Orders
                </button>
                <button
                  className={`rounded-full border px-3 py-1 font-semibold ${
                    user.disabled
                      ? "border-emerald-200 text-emerald-700"
                      : "border-amber-200 text-amber-800"
                  }`}
                  onClick={() =>
                    toggleStatus.mutate({ userId: user.userId, disabled: user.disabled })
                  }
                >
                  {user.disabled ? "Enable user" : "Disable user"}
                </button>
                <button
                  className="rounded-full bg-[var(--ink)] px-3 py-1 font-semibold text-white"
                  onClick={() => {
                    setFundingUserId(user.userId);
                    setFunding({ userId: user.userId, amount: "" });
                  }}
                >
                  Allocate cash
                </button>
              </div>
            </div>
          ))}
        </div>
        {!isLoading && !error && users.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No users found.</p>
        ) : null}
      </div>

      {selectedUserId ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-6">
          <div className="glass-card w-full max-w-2xl rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">User trades</p>
                <p className="text-lg font-semibold">{selectedUserId}</p>
              </div>
              <button className="text-sm text-[var(--muted)]" onClick={() => setSelectedUserId(null)}>
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              {userOrders.length ? (
                userOrders.map((order: any) => (
                  <div
                    key={order.orderId || order.id}
                    className="grid grid-cols-5 items-center gap-3 rounded-2xl border border-[var(--card-border)] px-4 py-3"
                  >
                    <span className="font-semibold">{order.symbol}</span>
                    <span>{order.side}</span>
                    <span>{order.qty}</span>
                    <span>{order.status}</span>
                    <span>${order.fillPrice ? Number(order.fillPrice).toFixed(2) : "-"}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-[var(--card-border)] px-4 py-3 text-sm text-[var(--muted)]">
                  No trades found.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {fundingUserId ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-6">
          <div className="glass-card w-full max-w-md rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Allocate cash</p>
              <button className="text-sm text-[var(--muted)]" onClick={() => setFundingUserId(null)}>
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <label className="flex flex-col gap-2 text-sm">
                User ID
                <input
                  className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                  value={funding.userId}
                  onChange={(event) => setFunding({ ...funding, userId: event.target.value })}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Amount
                <input
                  className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                  value={funding.amount}
                  onChange={(event) => setFunding({ ...funding, amount: event.target.value })}
                />
              </label>
              <button
                className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
                onClick={() =>
                  fundUser.mutate({
                    userId: funding.userId,
                    amount: Number(funding.amount),
                  })
                }
              >
                Allocate funds
              </button>
              {fundUser.isSuccess ? (
                <p className="text-xs text-[var(--muted)]">Funding applied.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function ParticipantDashboard() {
  const { data: portfolio } = usePortfolio();
  const { data: orders = [] } = useOrders();
  const holdings = portfolio?.holdings || [];
  const portfolioValue = portfolio?.portfolioValue ?? 0;
  const cash = portfolio?.cash ?? 0;
  const unrealized = holdings.reduce((sum, item) => sum + (item.unrealizedPnL || 0), 0);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [sellDialog, setSellDialog] = useState<{
    symbol: string;
    qty: number;
    lotOrderId: string;
  } | null>(null);
  const [sellType, setSellType] = useState("market");
  const [sellLimit, setSellLimit] = useState("");
  const sellOrder = useMutation({
    mutationFn: (payload: unknown) => api.placeOrder(payload),
  });

  const tradesForSymbol = orders.filter(
    (order) =>
      order.symbol === selectedSymbol &&
      order.side?.toLowerCase() === "buy" &&
      order.status === "filled" &&
      (order.remainingQty || 0) > 0
  );
  const activity = orders.slice(0, 3).map((order) => ({
    time: order.filledAt || order.createdAt || "",
    action: order.side?.toUpperCase() || "ORDER",
    symbol: order.symbol,
    detail: `${order.qty} ${order.type}${order.fillPrice ? ` @ $${order.fillPrice}` : ""}`,
  }));

  return (
    <AppShell title="Portfolio overview" subtitle="Current season">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Portfolio value"
              value={`$${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            />
            <StatCard
              label="Cash available"
              value={`$${cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            />
            <StatCard
              label="Unrealized P&L"
              value={`$${unrealized.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            />
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Holdings</p>
                <p className="text-2xl font-semibold">Active positions</p>
              </div>
              <span className="rounded-full bg-[var(--sunset)] px-3 py-1 text-xs font-semibold">Real-time</span>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--card-border)]">
              <div className="grid grid-cols-5 gap-4 bg-[var(--bg-sand)] px-4 py-3 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
                <span>Symbol</span>
                <span>Qty</span>
                <span>Avg cost</span>
                <span>Value</span>
                <span>P&L</span>
              </div>
              <div className="divide-y divide-[var(--card-border)]">
                {holdings.map((row) => (
                  <button
                    type="button"
                    key={row.symbol}
                    onClick={() => setSelectedSymbol(row.symbol)}
                    className="grid w-full grid-cols-5 gap-4 px-4 py-4 text-left text-sm transition hover:bg-[var(--bg-sand)]"
                  >
                    <span className="font-semibold">{row.symbol}</span>
                    <span>{row.qty.toFixed(2)}</span>
                    <span>${row.avgCost.toFixed(2)}</span>
                    <span>${row.marketValue.toFixed(2)}</span>
                    <span className={row.unrealizedPnL < 0 ? "text-red-500" : "text-[var(--teal)]"}>
                      ${row.unrealizedPnL.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedSymbol ? (
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Position details</p>
                  <p className="text-2xl font-semibold">{selectedSymbol} trades</p>
                </div>
                <button
                  className="text-xs text-[var(--muted)]"
                  onClick={() => setSelectedSymbol(null)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                {tradesForSymbol.length ? (
                  tradesForSymbol.map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between rounded-2xl border border-[var(--card-border)] px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">
                          {order.remainingQty?.toFixed(2)} @ ${order.fillPrice?.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{order.filledAt}</p>
                      </div>
                      <button
                        className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold"
                        onClick={() => {
                          setSellDialog({ symbol: order.symbol, qty: order.remainingQty, lotOrderId: order.orderId });
                          setSellType("market");
                          setSellLimit("");
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[var(--card-border)] px-4 py-3 text-sm text-[var(--muted)]">
                    No filled trades yet for this symbol.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Cash ledger</p>
            <p className="text-2xl font-semibold">$100,000 start</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Last funding: 2024-05-01 10:00 AEST</p>
            <div className="mt-5 rounded-2xl border border-dashed border-[var(--card-border)] px-4 py-4 text-sm text-[var(--muted)]">
              No pending settlements. Your cash is fully available.
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Recent activity</p>
            <div className="mt-4 flex flex-col gap-3">
              {activity.map((item) => (
                <div key={`${item.time}-${item.symbol}`} className="flex items-center justify-between rounded-2xl border border-[var(--card-border)] px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{item.action} {item.symbol}</p>
                    <p className="text-xs text-[var(--muted)]">{item.detail}</p>
                  </div>
                  <span className="text-xs text-[var(--muted)]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {sellDialog ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-6">
          <div className="glass-card w-full max-w-md rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Sell {sellDialog.symbol}</p>
              <button className="text-sm text-[var(--muted)]" onClick={() => setSellDialog(null)}>
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <label className="flex flex-col gap-2 text-sm">
                Quantity
                <input
                  className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                  value={sellDialog.qty}
                  onChange={(event) =>
                    setSellDialog({ ...sellDialog, qty: Number(event.target.value) })
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Order type
                <select
                  className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                  value={sellType}
                  onChange={(event) => setSellType(event.target.value)}
                >
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                </select>
              </label>
              {sellType === "limit" ? (
                <label className="flex flex-col gap-2 text-sm">
                  Limit price
                  <input
                    className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                    value={sellLimit}
                    onChange={(event) => setSellLimit(event.target.value)}
                  />
                </label>
              ) : null}
              <button
                className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
                onClick={() =>
                  sellOrder.mutate({
                    symbol: sellDialog.symbol,
                    side: "sell",
                    type: sellType,
                    qty: sellDialog.qty,
                    ...(sellType === "limit" ? { limitPrice: Number(sellLimit) } : {}),
                    sellQty: sellDialog.qty,
                    lotOrderId: sellDialog.lotOrderId,
                  })
                }
              >
                Submit sell order
              </button>
              {sellOrder.isSuccess ? (
                <p className="text-xs text-[var(--muted)]">Order accepted.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import { useQuotes, useSymbolSearch } from "@/lib/hooks";

export default function TradePage() {
  const [symbolInput, setSymbolInput] = useState("AAPL");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState("market");
  const [qty, setQty] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const { data: searchResults = [] } = useSymbolSearch(symbolInput.trim());
  const { data, error, isError } = useQuotes([selectedSymbol]);
  const quote = data?.quotes?.[0];
  const placeOrder = useMutation({
    mutationFn: (payload: unknown) => api.placeOrder(payload),
    onSuccess: (data: any) => {
      if (data?.status === "accepted") {
        setNotice(`Order accepted. ID: ${data.orderId}`);
      } else if (data?.status === "filled") {
        setNotice(`Order accepted and filled. ID: ${data.orderId}`);
      } else {
        setNotice(`Order accepted. ID: ${data?.orderId || "pending"}`);
      }
    },
  });

  const showLimit = orderType === "limit";
  const limitMissing = showLimit && (!limitPrice || Number(limitPrice) <= 0);
  const qtyMissing = !qty || Number(qty) <= 0;

  return (
    <AppShell title="Trade ticket" subtitle="Real-time quotes">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">New order</p>
              <p className="text-2xl font-semibold">Place a trade</p>
            </div>
            <span className="rounded-full bg-[var(--sunset)] px-3 py-1 text-xs font-semibold">Live</span>
          </div>
          <div className="mt-6 grid gap-4">
            <label className="flex flex-col gap-2 text-sm">
              Symbol
              <div className="relative">
                <input
                  className="w-full rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                  placeholder="AAPL"
                  value={symbolInput}
                  onChange={(event) => {
                    const value = event.target.value.toUpperCase();
                    setSymbolInput(value);
                    setSelectedSymbol(value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 120);
                  }}
                />
                {showSuggestions && symbolInput.length > 0 && searchResults.length > 0 ? (
                  <div className="absolute z-10 mt-2 w-full rounded-2xl border border-[var(--card-border)] bg-white shadow-lg">
                    {searchResults.slice(0, 6).map((item, index) => (
                      <button
                        key={`${item.symbol}-${item.exchange}-${index}`}
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-[var(--bg-sand)]"
                        onClick={() => {
                          setSymbolInput(item.symbol);
                          setSelectedSymbol(item.symbol);
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="font-semibold">{item.symbol}</span>
                        <span className="text-xs text-[var(--muted)]">{item.name}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                Side
                <select
                  className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                  value={side}
                  onChange={(event) => setSide(event.target.value)}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Order type
                <select
                  className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                  value={orderType}
                  onChange={(event) => setOrderType(event.target.value)}
                >
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                Quantity
                <input
                  className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                  placeholder="0.00"
                  value={qty}
                  onChange={(event) => setQty(event.target.value)}
                />
              </label>
              {showLimit ? (
                <label className="flex flex-col gap-2 text-sm">
                  Limit price
                  <input
                    className="rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3"
                    placeholder="$0.00"
                    value={limitPrice}
                    onChange={(event) => setLimitPrice(event.target.value)}
                  />
                </label>
              ) : (
                <div className="flex items-center rounded-2xl border border-dashed border-[var(--card-border)] px-4 py-3 text-sm text-[var(--muted)]">
                  Market orders execute at the latest quote.
                </div>
              )}
            </div>
            {showLimit && limitMissing ? (
              <p className="text-xs text-red-500">Limit price is required for limit orders.</p>
            ) : null}
            <button
              className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={qtyMissing || limitMissing || placeOrder.isPending}
              onClick={() =>
                placeOrder.mutate({
                  symbol: selectedSymbol,
                  side,
                  type: orderType,
                  qty: Number(qty),
                  ...(showLimit ? { limitPrice: Number(limitPrice) } : {}),
                })
              }
            >
              Submit order
            </button>
            {notice ? <p className="text-xs text-[var(--muted)]">{notice}</p> : null}
            {placeOrder.isError ? (
              <p className="text-xs text-red-500">Order failed. Check funds/holdings.</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Current quote</p>
            <div className="mt-4 flex flex-col gap-3">
              {isError ? (
                <div className="rounded-2xl border border-[var(--card-border)] px-4 py-3 text-sm text-red-500">
                  Unable to load quote. Please confirm you are signed in.
                </div>
              ) : quote ? (
                <div className="flex items-center justify-between rounded-2xl border border-[var(--card-border)] px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{quote.symbol}</p>
                    <p className="text-xs text-[var(--muted)]">${quote.lastPrice.toFixed(2)}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      quote.isRealtime ? "text-[var(--teal)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {quote.isRealtime ? "Live" : "Cached"}
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--card-border)] px-4 py-3 text-sm text-[var(--muted)]">
                  No quote available yet.
                </div>
              )}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6 text-sm text-[var(--muted)]">
            Orders use the latest cached quote. If the quote is stale, we fetch on-demand before executing.
          </div>
        </div>
      </div>
    </AppShell>
  );
}

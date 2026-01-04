"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  mockLeaderboard,
  mockOrders,
  mockPortfolio,
  mockProfile,
  mockQuotes,
  mockSymbols,
} from "@/lib/mocks";

const hasApi = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_AUTH_MODE);

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
    enabled: hasApi,
    initialData: hasApi ? undefined : mockProfile,
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: api.getPortfolio,
    enabled: hasApi,
    initialData: hasApi ? undefined : mockPortfolio,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
    enabled: hasApi,
    initialData: hasApi ? undefined : mockOrders,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: api.getLeaderboard,
    enabled: hasApi,
    initialData: hasApi ? undefined : mockLeaderboard,
  });
}

export function useQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: () => api.getQuotes(symbols),
    enabled: hasApi,
    initialData: hasApi ? undefined : { quotes: mockQuotes },
  });
}

export function useSymbols() {
  return useQuery({
    queryKey: ["symbols"],
    queryFn: api.getSymbols,
    enabled: hasApi,
    initialData: hasApi ? undefined : mockSymbols,
  });
}

export function useAdminSymbols() {
  return useQuery({
    queryKey: ["admin-symbols"],
    queryFn: api.getAdminSymbols,
    enabled: hasApi,
    initialData: hasApi ? undefined : mockSymbols,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: api.getAdminUsers,
    enabled: hasApi,
  });
}

export function useAdminUserOrders(userId?: string) {
  return useQuery({
    queryKey: ["admin-user-orders", userId],
    queryFn: () => api.getAdminUserOrders(userId || ""),
    enabled: hasApi && Boolean(userId),
  });
}

export function useAdminUserTransactions(userId?: string) {
  return useQuery({
    queryKey: ["admin-user-transactions", userId],
    queryFn: () => api.getAdminUserTransactions(userId || ""),
    enabled: hasApi && Boolean(userId),
  });
}

export function useSymbolSearch(query: string) {
  return useQuery({
    queryKey: ["symbol-search", query],
    queryFn: () => api.searchSymbols(query),
    enabled: hasApi && query.length > 0,
    initialData: hasApi || !query ? undefined : mockSymbols,
  });
}

import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (process.env.NEXT_PUBLIC_AUTH_MODE) {
    try {
      const session = await fetchAuthSession();
      const token =
        session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // Ignore auth errors until Cognito is fully wired.
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = text;
    }
  }

  if (!res.ok) {
    const detail = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(`API error: ${res.status}${detail ? ` - ${detail}` : ""}`);
  }

  return data as T;
}

export type QuoteResponse = {
  quotes: Array<{ symbol: string; lastPrice: number; asOf: string; isRealtime: boolean }>;
};

export const api = {
  getProfile: () => request("/profile"),
  updatePreferences: (payload: { avatarId?: string; theme?: string }) =>
    request("/preferences", { method: "POST", body: JSON.stringify(payload) }),
  getPortfolio: () => request("/portfolio"),
  getOrders: () => request("/orders"),
  placeOrder: (payload: unknown) =>
    request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  cancelOrder: (payload: { orderId: string }) =>
    request("/orders/cancel", { method: "POST", body: JSON.stringify(payload) }),
  getLeaderboard: () => request("/leaderboard"),
  getSymbols: () => request("/symbols"),
  searchSymbols: (query: string) => request(`/symbols?search=${encodeURIComponent(query)}`),
  getAdminSymbols: () => request("/admin/symbols"),
  upsertSymbol: (payload: unknown) =>
    request("/admin/symbols", { method: "POST", body: JSON.stringify(payload) }),
  getAdminUsers: () => request("/admin/users"),
  getAdminUserOrders: (userId: string) => request(`/admin/users/${userId}/orders`),
  getAdminUserTransactions: (userId: string) => request(`/admin/users/${userId}/transactions`),
  disableUser: (userId: string) =>
    request(`/admin/users/${userId}/disable`, { method: "POST" }),
  enableUser: (userId: string) =>
    request(`/admin/users/${userId}/enable`, { method: "POST" }),
  fundUser: (payload: { userId: string; amount: number }) =>
    request("/admin/fund", { method: "POST", body: JSON.stringify(payload) }),
  getQuotes: (symbols: string[]) =>
    request<QuoteResponse>(`/quotes?symbols=${encodeURIComponent(symbols.join(","))}`),
};

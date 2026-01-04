export const mockProfile = {
  displayName: "Jordan Lee",
  startingCash: 100000,
  currentCash: 18240.5,
};

export const mockPortfolio = {
  cash: 18240.5,
  holdings: [
    { symbol: "AAPL", qty: 12.5, avgCost: 162.2, marketValue: 2342.75, unrealizedPnL: 128.4 },
    { symbol: "NVDA", qty: 4, avgCost: 810.1, marketValue: 3696.4, unrealizedPnL: 436.0 },
    { symbol: "AMZN", qty: 8.75, avgCost: 172.6, marketValue: 1612.1, unrealizedPnL: -18.5 },
  ],
  portfolioValue: 107482.3,
};

export const mockOrders = [
  { id: "ORD-1201", symbol: "MSFT", side: "Buy", type: "Limit", qty: 3, status: "Pending" },
  { id: "ORD-1200", symbol: "AAPL", side: "Sell", type: "Market", qty: 2.5, status: "Filled" },
  { id: "ORD-1198", symbol: "TSLA", side: "Buy", type: "Market", qty: 1, status: "Filled" },
];

export const mockLeaderboard = [
  { rank: 1, name: "Ari Chen", return: 12.4, value: 112400 },
  { rank: 2, name: "Maya Singh", return: 10.9, value: 110900 },
  { rank: 3, name: "Sam Lopez", return: 9.1, value: 109100 },
  { rank: 4, name: "Jordan Lee", return: 7.6, value: 107600 },
];

export const mockQuotes = [
  { symbol: "AAPL", lastPrice: 187.42, asOf: "2024-05-01T02:15:00Z", isRealtime: true },
  { symbol: "NVDA", lastPrice: 924.1, asOf: "2024-05-01T02:14:50Z", isRealtime: true },
  { symbol: "MSFT", lastPrice: 412.1, asOf: "2024-05-01T02:14:45Z", isRealtime: false },
];

export const mockSymbols = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", isActive: true },
  { symbol: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ", isActive: true },
  { symbol: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ", isActive: true },
];

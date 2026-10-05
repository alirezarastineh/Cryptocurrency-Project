/**
 * Application Configuration & Route Constants
 * FinTech Cryptocurrency Club Portal
 */

export const APP_CONFIG = {
  name: "Cryptocurrency Club",
  shortName: "Crypto Club",
  version: "1.0.0",
  description:
    "Enterprise FinTech crypto market intelligence, portfolio simulators, and investment club.",
  author: "Cryptocurrency Club Team",
  storagePrefix: "crypto_club_v1_",
  defaultTheme: "dark",
};

export const STORAGE_KEYS = {
  THEME: "crypto_club_v1_theme",
  WATCHLIST: "crypto_club_v1_watchlist",
  PORTFOLIO: "crypto_club_v1_portfolio",
  DCA_CONFIG: "crypto_club_v1_dca_config",
  NEWS_BOOKMARKS: "crypto_club_v1_news_bookmarks",
  USER_PROFILE: "crypto_club_v1_user_profile",
};

/**
 * Navigation routes configuration.
 * Paths are relative to the project root.
 */
export const ROUTES = [
  {
    id: "home",
    label: "Home",
    icon: "home",
    path: "index.html",
    description: "Overview, hero metrics, and portal introductions",
  },
  {
    id: "coins",
    label: "Markets",
    icon: "monetization_on",
    path: "coins/coins.html",
    description:
      "Real-time crypto prices, sparklines, filtering, and detail modal",
  },
  {
    id: "investment",
    label: "Investment",
    icon: "psychology_alt",
    path: "investment/investment.html",
    description: "DCA calculator & simulated portfolio tracker",
  },
  {
    id: "news",
    label: "News",
    icon: "breaking_news_alt_1",
    path: "news/news.html",
    description: "Categorized crypto news feed with sentiment analysis",
  },
  {
    id: "membership",
    label: "Membership",
    icon: "payments",
    path: "membership/membership.html",
    description: "Mentorship tiers, dynamic pricing, and feature matrix",
  },
  {
    id: "registration",
    label: "Join Club",
    icon: "how_to_reg",
    path: "registration/registration.html",
    description: "5-step onboarding wizard and risk assessment quiz",
  },
  {
    id: "contact",
    label: "Contact",
    icon: "contact_support",
    path: "contact/contact.html",
    description: "Support desk, headquarters location, and inquiries",
  },
];

/**
 * Top Cryptocurrencies for Live Ticker with fallback baseline values
 */
export const DEFAULT_TICKER_COINS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 68450.0,
    change24h: 3.42,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ABTCUSDTPERP",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3520.5,
    change24h: 2.15,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3AETHUSDTPERP",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 154.8,
    change24h: 6.84,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ASOLUSDTPERP",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 588.2,
    change24h: -0.65,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ABNBUSDTPERP",
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: 0.584,
    change24h: -1.24,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3AXRPUSDTPERP",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 0.462,
    change24h: 1.85,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3AADAUSDTPERP",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.134,
    change24h: 4.12,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ADOGEUSDTPERP",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 29.4,
    change24h: -2.3,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3AAVAXUSDTPERP",
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    price: 82.15,
    change24h: 0.78,
    tvUrl:
      "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ALTCUSDTPERP",
  },
];

/**
 * Direct TradingView chart links from original navigation
 */
export const TRADINGVIEW_LINKS = [
  {
    name: "Bitcoin (BTC)",
    symbol: "BTC",
    url: "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ABTCUSDTPERP",
  },
  {
    name: "Ethereum (ETH)",
    symbol: "ETH",
    url: "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3AETHUSDTPERP",
  },
  {
    name: "Litecoin (LTC)",
    symbol: "LTC",
    url: "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ALTCUSDTPERP",
  },
  {
    name: "Ripple (XRP)",
    symbol: "XRP",
    url: "https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3AXRPUSDTPERP",
  },
];

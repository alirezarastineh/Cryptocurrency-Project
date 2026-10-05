export const StorageManager = {
  getWatchlist() {
    try {
      return JSON.parse(
        localStorage.getItem("crypto_watchlist") || '["BTC", "ETH", "SOL"]',
      );
    } catch {
      return ["BTC", "ETH", "SOL"];
    }
  },
  toggleWatchlist(symbol) {
    const list = this.getWatchlist();
    const index = list.indexOf(symbol);
    if (index >= 0) list.splice(index, 1);
    else list.push(symbol);
    localStorage.setItem("crypto_watchlist", JSON.stringify(list));
    return list;
  },
  getPortfolio() {
    try {
      return JSON.parse(localStorage.getItem("crypto_portfolio") || "[]");
    } catch {
      return [];
    }
  },
  savePortfolio(items) {
    localStorage.setItem("crypto_portfolio", JSON.stringify(items));
  },
  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem("crypto_news_bookmarks") || "[]");
    } catch {
      return [];
    }
  },
  toggleBookmark(articleId) {
    const list = this.getBookmarks();
    const index = list.indexOf(articleId);
    if (index >= 0) list.splice(index, 1);
    else list.push(articleId);
    localStorage.setItem("crypto_news_bookmarks", JSON.stringify(list));
    return list;
  },
};

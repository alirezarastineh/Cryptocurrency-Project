import { StorageManager } from "../scripts/storage.js";
import { formatTimeAgo } from "../scripts/formatters.js";
import { ThemeService } from "../scripts/themeService.js";
import { CryptoAPI } from "../scripts/api.js";
import { TickerComponent } from "../scripts/components/Ticker.js";

let articles = [];
let activeCategory = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
  ThemeService.init();
  document
    .querySelectorAll(".theme-toggle-btn")
    .forEach((b) => b.addEventListener("click", () => ThemeService.toggle()));

  const coins = await CryptoAPI.getTopCoins();
  const tickerMount = document.querySelector("#ticker-mount");
  if (tickerMount) TickerComponent.render(tickerMount, coins);

  await fetchNews();

  // Category filter listeners
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.cat;
      renderNews(filterArticles(document.querySelector("#news-search").value));
    });
  });

  // Search listener
  document.querySelector("#news-search")?.addEventListener("input", (e) => {
    renderNews(filterArticles(e.target.value));
  });
});

async function fetchNews() {
  try {
    const res = await fetch(
      "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    articles = (data?.Data || []).map((item) => ({
      id: String(item.id),
      title: item.title,
      url: item.url,
      imageurl: item.imageurl,
      body: item.body,
      tags: item.tags || "",
      published_on: item.published_on,
      sentiment: determineSentiment(item.title + " " + item.body),
    }));
  } catch (err) {
    console.warn("Failed to fetch live news, using fallback feed:", err);
    articles = getFallbackNews();
  }
  renderNews(filterArticles());
}

function determineSentiment(text) {
  const lower = text.toLowerCase();
  const bullish = [
    "surge",
    "gain",
    "bull",
    "rally",
    "ath",
    "high",
    "growth",
    "adoption",
    "breakout",
  ];
  const bearish = [
    "crash",
    "drop",
    "bear",
    "fall",
    "loss",
    "decline",
    "ban",
    "lawsuit",
    "hack",
  ];

  let score = 0;
  bullish.forEach((w) => {
    if (lower.includes(w)) score++;
  });
  bearish.forEach((w) => {
    if (lower.includes(w)) score--;
  });

  if (score > 0) return "bullish";
  if (score < 0) return "bearish";
  return "neutral";
}

function filterArticles(query = "") {
  let list = [...articles];
  const q = query.trim().toLowerCase();
  if (q)
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
    );

  if (activeCategory === "BOOKMARKS") {
    const bookmarks = StorageManager.getBookmarks();
    list = list.filter((a) => bookmarks.includes(a.id));
  } else if (activeCategory !== "ALL") {
    list = list.filter(
      (a) =>
        a.tags.toUpperCase().includes(activeCategory) ||
        a.title.toUpperCase().includes(activeCategory),
    );
  }
  return list;
}

function renderNews(newsList) {
  const container = document.querySelector("#news-grid");
  if (!container) return;

  if (newsList.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 3rem 0;">No articles found matching criteria.</div>`;
    return;
  }

  const bookmarks = StorageManager.getBookmarks();

  container.innerHTML = newsList
    .map((a) => {
      const isBookmarked = bookmarks.includes(a.id);
      return `
      <div class="news-card">
        <img class="news-img" src="${a.imageurl}" alt="${a.title}" onerror="this.src='https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=60'">
        <div class="news-body">
          <div class="news-meta">
            <span class="sentiment-badge sentiment-${a.sentiment}">${a.sentiment}</span>
            <span style="color: var(--text-muted);">${formatTimeAgo(a.published_on)}</span>
          </div>
          <h3 class="news-title">${a.title}</h3>
          <p class="news-desc">${a.body.slice(0, 140)}...</p>
          <div class="news-actions">
            <a href="${a.url}" target="_blank" rel="noopener noreferrer" style="font-weight:600; font-size:0.9rem;">Read Story ↗</a>
            <button class="icon-btn bookmark-btn" data-id="${a.id}" style="padding:0.3rem 0.6rem;">${isBookmarked ? "🔖 Saved" : "📑 Save"}</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  container.querySelectorAll(".bookmark-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      StorageManager.toggleBookmark(btn.dataset.id);
      renderNews(filterArticles(document.querySelector("#news-search").value));
    });
  });
}

function getFallbackNews() {
  return [
    {
      id: "1",
      title:
        "Institutional Inflows Drive Bitcoin Momentum Across Global Exchanges",
      url: "https://cryptonews.com",
      imageurl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60",
      body: "Major asset managers report continued inflows into spot digital asset products.",
      published_on: Math.floor(Date.now() / 1000) - 3600,
      sentiment: "bullish",
      tags: "BTC",
    },
    {
      id: "2",
      title: "Layer-2 Ecosystem Surpasses New Milestone in Total Value Locked",
      url: "https://cryptonews.com",
      imageurl:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=60",
      body: "DeFi protocols observe record user engagement and smart contract interactions.",
      published_on: Math.floor(Date.now() / 1000) - 7200,
      sentiment: "bullish",
      tags: "ETH",
    },
  ];
}

import { CryptoAPI } from "../scripts/api.js";
import { StorageManager } from "../scripts/storage.js";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
} from "../scripts/formatters.js";
import { ThemeService } from "../scripts/themeService.js";
import { TickerComponent } from "../scripts/components/Ticker.js";

let allCoins = [];
let activeFilter = "all";
let sortField = "market_cap";
let sortAsc = false;

document.addEventListener("DOMContentLoaded", async () => {
  ThemeService.init();
  document
    .querySelectorAll(".theme-toggle-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => ThemeService.toggle()),
    );

  await loadCoins();

  // Search Listener
  document.querySelector("#coin-search")?.addEventListener("input", (e) => {
    renderTable(filterCoins(e.target.value));
  });

  // Filter Pills
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderTable(filterCoins(document.querySelector("#coin-search").value));
    });
  });

  // Sorting
  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (sortField === field) sortAsc = !sortAsc;
      else {
        sortField = field;
        sortAsc = false;
      }
      renderTable(filterCoins(document.querySelector("#coin-search").value));
    });
  });

  document.querySelector("#refresh-btn")?.addEventListener("click", loadCoins);
});

async function loadCoins() {
  allCoins = await CryptoAPI.getTopCoins(true);
  const tickerMount = document.querySelector("#ticker-mount");
  if (tickerMount) TickerComponent.render(tickerMount, allCoins);
  renderTable(filterCoins());
}

function filterCoins(query = "") {
  let list = [...allCoins];
  const q = query.trim().toLowerCase();
  if (q)
    list = list.filter(
      (c) =>
        c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );

  if (activeFilter === "favorites") {
    const watchlist = StorageManager.getWatchlist();
    list = list.filter((c) => watchlist.includes(c.symbol));
  } else if (activeFilter === "gainers") {
    list = list.filter((c) => c.price_change_percentage_24h > 0);
  } else if (activeFilter === "losers") {
    list = list.filter((c) => c.price_change_percentage_24h < 0);
  }

  const SORT_PROPERTY_MAP = {
    price: "current_price",
    change: "price_change_percentage_24h",
  };
  const propKey = SORT_PROPERTY_MAP[sortField] || sortField;

  list.sort((a, b) => {
    const v1 = a[propKey];
    const v2 = b[propKey];
    return sortAsc ? v1 - v2 : v2 - v1;
  });

  return list;
}

function renderTable(coins) {
  const tbody = document.querySelector("#market-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  const watchlist = StorageManager.getWatchlist();

  coins.forEach((coin) => {
    const isFav = watchlist.includes(coin.symbol);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><button class="fav-btn" data-symbol="${coin.symbol}" title="Toggle Watchlist">${isFav ? "⭐" : "☆"}</button></td>
      <td style="display: flex; align-items: center; gap: 0.75rem;">
        <img src="${coin.image}" width="28" height="28" style="border-radius:50%;" alt="${coin.name}" onerror="this.src='https://assets.coingecko.com/coins/images/1/small/bitcoin.png'">
        <div>
          <div style="font-weight:700;">${coin.symbol}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${coin.name}</div>
        </div>
      </td>
      <td style="font-family:var(--font-mono); font-weight:600;">${formatCurrency(coin.current_price)}</td>
      <td class="${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}" style="font-weight:600;">
        ${formatPercent(coin.price_change_percentage_24h)}
      </td>
      <td style="font-size:0.85rem; color:var(--text-secondary);">${formatCurrency(coin.low_24h)} - ${formatCurrency(coin.high_24h)}</td>
      <td>${formatNumber(coin.market_cap)}</td>
      <td><canvas class="sparkline-canvas" width="100" height="32"></canvas></td>
    `;

    tbody.appendChild(tr);

    // Render Canvas Sparkline
    const canvas = tr.querySelector(".sparkline-canvas");
    drawSparkline(
      canvas,
      coin.sparkline,
      coin.price_change_percentage_24h >= 0,
    );

    // Watchlist listener
    tr.querySelector(".fav-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      StorageManager.toggleWatchlist(coin.symbol);
      renderTable(filterCoins(document.querySelector("#coin-search").value));
    });
  });
}

function drawSparkline(canvas, data, isPositive) {
  if (!canvas || !data || data.length === 0) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  ctx.beginPath();
  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * (w - 4) + 2;
    const y = h - ((val - min) / range) * (h - 8) - 4;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = isPositive ? "#10b981" : "#f43f5e";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Real-Time Crypto Price Ticker Component
 * FinTech Cryptocurrency Club Portal
 */

import { BaseComponent } from "./BaseComponent.js";
import { DEFAULT_TICKER_COINS } from "../config.js";
import { formatCurrency, formatPercent } from "../utils/formatters.js";

export class Ticker extends BaseComponent {
  target = null;
  coins = [...DEFAULT_TICKER_COINS];

  /**
   * Mount ticker component
   * @param {string|HTMLElement} target
   */
  mount(target = "#app-ticker") {
    this.target = this.resolveTarget(target);
    if (!this.target) {
      const targetStr =
        typeof target === "string"
          ? target
          : String(target?.tagName || "element");
      console.warn(`[Ticker] Target element "${targetStr}" not found.`);
      return;
    }

    this.render();
  }

  /**
   * Update ticker coin data if new live prices are available
   * @param {Array} newCoins
   */
  updateCoins(newCoins) {
    if (Array.isArray(newCoins) && newCoins.length > 0) {
      this.coins = newCoins;
      if (this.target) {
        this.render();
      }
    }
  }

  /**
   * Render continuous marquee track
   */
  render() {
    const coinsUrl = this.resolvePath("coins/coins.html");

    // Duplicate list to achieve continuous seamless loop
    const displayList = [...this.coins, ...this.coins];

    const itemsHtml = displayList
      .map((coin, index) => {
        const isBullish = coin.change24h >= 0;
        const changeClass = isBullish ? "bullish" : "bearish";
        const formattedPrice = formatCurrency(coin.price);
        const formattedChange = formatPercent(coin.change24h);

        return `
        <a href="${coinsUrl}?coin=${encodeURIComponent(coin.symbol)}" class="cc-ticker-item" aria-label="${coin.name} price: ${formattedPrice}, 24 hour change: ${formattedChange}" data-index="${index}">
          <span class="cc-ticker-symbol">${coin.symbol}</span>
          <span class="cc-ticker-price mono-num">${formattedPrice}</span>
          <span class="cc-ticker-change ${changeClass} mono-num">${formattedChange}</span>
        </a>
      `;
      })
      .join("");

    this.target.innerHTML = `
      <div class="cc-ticker-badge" aria-hidden="true">
        <span class="cc-ticker-badge-dot"></span>
        <span>Live Markets</span>
      </div>
      <div class="cc-ticker-track-wrapper" role="region" aria-label="Cryptocurrency Price Ticker">
        <div class="cc-ticker-track">
          ${itemsHtml}
        </div>
      </div>
    `;
  }
}

export default new Ticker();

/**
 * Quick Search & Command Palette Modal (Cmd/Ctrl+K)
 * FinTech Cryptocurrency Club Portal
 */

import { BaseComponent } from "./BaseComponent.js";
import { DEFAULT_TICKER_COINS } from "../config.js";
import { escapeHtml } from "../utils/formatters.js";

class QuickSearchManager extends BaseComponent {
  modalEl = null;
  backdropEl = null;
  inputEl = null;
  resultsEl = null;
  isOpen = false;
  selectedIndex = 0;
  filteredItems = [];

  constructor() {
    super();
    this._handleGlobalKeyDown = this._handleGlobalKeyDown.bind(this);
    this._handleInput = this._handleInput.bind(this);
    this._handleModalKeyDown = this._handleModalKeyDown.bind(this);
  }

  /**
   * Build searchable index with dynamic relative paths
   * @private
   */
  _buildSearchIndex() {
    const pages = [
      {
        type: "Page",
        title: "Home Overview",
        subtitle: "Portal overview & crypto fundamentals",
        icon: "home",
        url: this.resolvePath("index.html"),
        keywords: "home dashboard main welcome bitcoin intro start",
      },
      {
        type: "Page",
        title: "Live Market Terminal",
        subtitle:
          "Top 100 cryptocurrencies, real-time prices, filters, and sparklines",
        icon: "monetization_on",
        url: this.resolvePath("coins/coins.html"),
        keywords:
          "market terminal prices coins crypto quotes sparkline watchlist",
      },
      {
        type: "Page",
        title: "DCA Profit Simulator",
        subtitle: "Simulate recurring crypto investments vs lump-sum ROI",
        icon: "psychology_alt",
        url: this.resolvePath("investment/investment.html#dca"),
        keywords:
          "dca dollar cost average investment returns profit calculator growth",
      },
      {
        type: "Page",
        title: "Simulated Portfolio Tracker",
        subtitle:
          "Track custom crypto holdings, unrealized P&L, and asset allocation",
        icon: "pie_chart",
        url: this.resolvePath("investment/investment.html#portfolio"),
        keywords:
          "portfolio net worth tracker holdings profit loss allocation donut",
      },
      {
        type: "Page",
        title: "Crypto News & Sentiment",
        subtitle:
          "Live breaking news feed with sentiment analysis and bookmarks",
        icon: "breaking_news_alt_1",
        url: this.resolvePath("news/news.html"),
        keywords: "news feed sentiment bullish bearish articles market updates",
      },
      {
        type: "Page",
        title: "VIP Membership & Pricing",
        subtitle:
          "Mentorship tiers, feature comparison matrix, and billing discounts",
        icon: "payments",
        url: this.resolvePath("membership/membership.html"),
        keywords:
          "membership pricing pro vip tiers plans cost discount mentors",
      },
      {
        type: "Page",
        title: "Investor Onboarding Wizard",
        subtitle: "5-step registration and psychometric investor profile setup",
        icon: "how_to_reg",
        url: this.resolvePath("registration/registration.html"),
        keywords:
          "registration signup onboarding wizard form join register account",
      },
      {
        type: "Page",
        title: "Risk Assessment Questionnaire",
        subtitle: "Calculate objective risk profile score and recommended tier",
        icon: "quiz",
        url: this.resolvePath("registration/registration.html#risk"),
        keywords:
          "risk assessment quiz score conservative balanced aggressive profile",
      },
      {
        type: "Page",
        title: "Support & Office Desk",
        subtitle: "Contact Cryptocurrency Club office in Berlin, Germany",
        icon: "contact_support",
        url: this.resolvePath("contact/contact.html"),
        keywords: "contact support help berlin office email inquiry desk",
      },
    ];

    const coinsUrl = this.resolvePath("coins/coins.html");
    const coins = DEFAULT_TICKER_COINS.map((c) => ({
      type: "Crypto",
      title: `${c.name} (${c.symbol})`,
      subtitle: `View live market details & exchange charts`,
      icon: "toll",
      url: `${coinsUrl}?coin=${c.symbol}`,
      keywords: `${c.symbol} ${c.name} crypto currency token price chart coin`,
    }));

    return [...pages, ...coins];
  }

  /**
   * Initialize modal DOM and bind global shortcut listener
   */
  init() {
    if (typeof document === "undefined") return;

    if (!document.getElementById("cc-search-backdrop")) {
      const backdrop = document.createElement("div");
      backdrop.id = "cc-search-backdrop";
      backdrop.className = "cc-search-backdrop";
      backdrop.setAttribute("role", "dialog");
      backdrop.setAttribute("aria-modal", "true");
      backdrop.setAttribute("aria-label", "Quick Command Search");

      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPhone|iPod|iPad/.test(navigator.platform);
      const searchKbd = isMac ? "⌘K" : "Ctrl+K";

      backdrop.innerHTML = `
        <div class="cc-search-modal" id="cc-search-modal">
          <div class="cc-search-input-wrapper">
            <span class="material-symbols-outlined">search</span>
            <input
              type="text"
              class="cc-search-input"
              id="cc-search-input"
              placeholder="Search markets, tools, news, guides..."
              autocomplete="off"
              spellcheck="false"
              aria-autocomplete="list"
              aria-controls="cc-search-results"
            />
            <kbd class="cc-search-esc-badge">ESC</kbd>
          </div>
          <div class="cc-search-results" id="cc-search-results" role="listbox"></div>
          <div class="cc-search-footer">
            <div class="cc-search-footer-shortcuts">
              <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Select</span>
              <span><kbd>ESC</kbd> Close</span>
            </div>
            <span>FinTech Command Bar (${searchKbd})</span>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      this.backdropEl = backdrop;
      this.modalEl = backdrop.querySelector("#cc-search-modal");
      this.inputEl = backdrop.querySelector("#cc-search-input");
      this.resultsEl = backdrop.querySelector("#cc-search-results");

      // Bind backdrop click to close
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          this.close();
        }
      });

      this.inputEl.addEventListener("input", this._handleInput);
      this.inputEl.addEventListener("keydown", this._handleModalKeyDown);
    }

    // Global Cmd/Ctrl+K shortcut listener
    window.removeEventListener("keydown", this._handleGlobalKeyDown);
    window.addEventListener("keydown", this._handleGlobalKeyDown);
  }

  /**
   * Global shortcut detector
   * @private
   */
  _handleGlobalKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  /**
   * Handle modal navigation keys (ArrowUp, ArrowDown, Enter, Escape)
   * @private
   */
  _handleModalKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this._moveSelection(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._moveSelection(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      this._selectCurrent();
    }
  }

  _handleInput() {
    const query = this.inputEl.value.trim().toLowerCase();
    this._renderResults(query);
  }

  _moveSelection(delta) {
    if (this.filteredItems.length === 0) return;
    this.selectedIndex =
      (this.selectedIndex + delta + this.filteredItems.length) %
      this.filteredItems.length;
    this._updateSelectionHighlight();
  }

  _updateSelectionHighlight() {
    const items = this.resultsEl.querySelectorAll(".cc-search-item");
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add("is-selected");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("is-selected");
      }
    });
  }

  _selectCurrent() {
    if (
      this.filteredItems.length > 0 &&
      this.filteredItems[this.selectedIndex]
    ) {
      const selected = this.filteredItems[this.selectedIndex];
      this.close();
      window.location.href = selected.url;
    }
  }

  _renderResults(query) {
    const allItems = this._buildSearchIndex();

    if (!query) {
      this.filteredItems = allItems;
    } else {
      const qTokens = query.split(/\s+/).filter(Boolean);
      this.filteredItems = allItems.filter((item) => {
        const target =
          `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase();
        return qTokens.every((token) => target.includes(token));
      });
    }

    this.selectedIndex = 0;

    if (this.filteredItems.length === 0) {
      this.resultsEl.innerHTML = `
        <div class="cc-search-empty">
          <p>No results found for "<strong>${escapeHtml(query)}</strong>"</p>
          <span style="font-size: 12px; color: var(--color-text-muted);">Try searching for Bitcoin, DCA, Portfolio, News, or Membership</span>
        </div>
      `;
      return;
    }

    // Group items by category (Pages vs Cryptocurrencies)
    let currentCategory = "";
    let html = "";

    this.filteredItems.forEach((item, index) => {
      if (item.type !== currentCategory) {
        currentCategory = item.type;
        html += `<div class="cc-search-category-title">${currentCategory === "Page" ? "Portals & Tools" : "Cryptocurrency Assets"}</div>`;
      }

      const isSelected = index === this.selectedIndex ? " is-selected" : "";

      html += `
        <a href="${item.url}" class="cc-search-item${isSelected}" data-index="${index}" role="option">
          <div class="cc-search-item-left">
            <span class="material-symbols-outlined cc-search-item-icon">${item.icon}</span>
            <div>
              <span class="cc-search-item-title">${escapeHtml(item.title)}</span>
              <span class="cc-search-item-subtitle">${escapeHtml(item.subtitle)}</span>
            </div>
          </div>
          <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-text-muted);">chevron_right</span>
        </a>
      `;
    });

    this.resultsEl.innerHTML = html;

    // Add click listeners to items
    this.resultsEl.querySelectorAll(".cc-search-item").forEach((el) => {
      el.addEventListener("click", () => {
        this.close();
      });
    });
  }

  open() {
    this.init();
    this.isOpen = true;
    this.backdropEl.classList.add("is-open");
    this.inputEl.value = "";
    this._renderResults("");
    setTimeout(() => {
      this.inputEl.focus();
    }, 50);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (this.backdropEl) {
      this.backdropEl.classList.remove("is-open");
    }
  }
}

export const QuickSearch = new QuickSearchManager();
export default QuickSearch;

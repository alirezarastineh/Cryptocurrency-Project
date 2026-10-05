/**
 * Modular Reusable Header & Navigation Component
 * FinTech Cryptocurrency Club Portal
 */

import { BaseComponent } from "./BaseComponent.js";
import { ROUTES, TRADINGVIEW_LINKS, APP_CONFIG } from "../config.js";
import { ThemeService } from "../services/themeService.js";
import { QuickSearch } from "./QuickSearch.js";

export class Header extends BaseComponent {
  target = null;
  isDrawerOpen = false;

  constructor() {
    super();
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleThemeChange = this._handleThemeChange.bind(this);
  }

  /**
   * Determine which route ID corresponds to the current page
   * @returns {string}
   */
  getActiveRouteId() {
    if (typeof window === "undefined") return "home";
    const path = window.location.pathname.toLowerCase();

    if (path.includes("coins")) return "coins";
    if (path.includes("investment")) return "investment";
    if (path.includes("news")) return "news";
    if (path.includes("membership")) return "membership";
    if (path.includes("registration")) return "registration";
    if (path.includes("contact")) return "contact";
    if (path.includes("confirmation")) return "registration";

    // Default to home
    return "home";
  }

  /**
   * Render and mount Header component
   * @param {string|HTMLElement} target
   */
  mount(target = "#app-header") {
    this.target = this.resolveTarget(target);
    if (!this.target) {
      const targetStr =
        typeof target === "string"
          ? target
          : String(target?.tagName || "element");
      console.warn(`[Header] Target element "${targetStr}" not found.`);
      return;
    }

    this.render();
    this.bindEvents();
  }

  /**
   * Render HTML structure
   */
  render() {
    const activeRouteId = this.getActiveRouteId();
    const effectiveTheme = ThemeService.getEffectiveTheme();
    const isDark = effectiveTheme === "dark";
    const isMac =
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPod|iPad/.test(navigator.platform);
    const searchKbd = isMac ? "⌘K" : "Ctrl+K";

    const homeUrl = this.resolvePath("index.html");

    // Build Desktop Nav Links
    const navItemsHtml = ROUTES.map((route) => {
      const isActive = route.id === activeRouteId;
      const url = this.resolvePath(route.path);
      const activeClass = isActive ? " active" : "";
      const ariaCurrent = isActive ? ' aria-current="page"' : "";

      // Include Dropdown for Coins route (matching original TradingView chart links)
      if (route.id === "coins") {
        const dropdownItemsHtml = TRADINGVIEW_LINKS.map(
          (link) => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="cc-dropdown-link" title="Open ${link.name} chart on TradingView">
            <span>${link.name}</span>
            <span class="cc-external-tag">Chart ↗</span>
          </a>
        `,
        ).join("");

        return `
          <li class="cc-nav-item">
            <a href="${url}" class="cc-nav-link${activeClass}" id="nav-item-${route.id}"${ariaCurrent}>
              <span class="material-symbols-outlined">${route.icon}</span>
              <span>${route.label}</span>
              <span class="material-symbols-outlined" style="font-size: 16px; margin-left: -2px;">expand_more</span>
            </a>
            <div class="cc-dropdown-menu" role="menu" aria-label="Coin Markets">
              <div class="cc-dropdown-header">Live Exchange Charts</div>
              ${dropdownItemsHtml}
            </div>
          </li>
        `;
      }

      return `
        <li class="cc-nav-item">
          <a href="${url}" class="cc-nav-link${activeClass}" id="nav-item-${route.id}"${ariaCurrent}>
            <span class="material-symbols-outlined">${route.icon}</span>
            <span>${route.label}</span>
          </a>
        </li>
      `;
    }).join("");

    // Build Mobile Drawer Nav Links
    const mobileLinksHtml = ROUTES.map((route) => {
      const isActive = route.id === activeRouteId;
      const url = this.resolvePath(route.path);
      const activeClass = isActive ? " active" : "";
      const ariaCurrent = isActive ? ' aria-current="page"' : "";

      return `
        <a href="${url}" class="cc-drawer-link${activeClass}"${ariaCurrent}>
          <span class="material-symbols-outlined">${route.icon}</span>
          <span>${route.label}</span>
        </a>
      `;
    }).join("");

    this.target.innerHTML = `
      <div class="cc-header-inner">
        <!-- Brand Logo -->
        <a href="${homeUrl}" class="cc-brand" aria-label="Cryptocurrency Club Home">
          <div class="cc-brand-icon">
            <span class="material-symbols-outlined">currency_bitcoin</span>
          </div>
          <div class="cc-brand-name">
            <span class="cc-brand-title">${APP_CONFIG.shortName}</span>
            <span class="cc-brand-subtitle">Intelligence</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="cc-nav-container" aria-label="Main Navigation">
          <ul class="cc-nav-desktop">
            ${navItemsHtml}
          </ul>
        </nav>

        <!-- Header Actions: Search, Theme Toggle, Mobile Hamburger -->
        <div class="cc-header-actions">
          <button type="button" class="cc-search-trigger" id="cc-search-btn" aria-label="Quick search (Shortcut: ${searchKbd})">
            <span class="material-symbols-outlined">search</span>
            <span>Search</span>
            <kbd class="cc-kbd-shortcut">${searchKbd}</kbd>
          </button>

          <button type="button" class="cc-theme-toggle" id="cc-theme-btn" aria-label="Toggle dark/light theme" title="Toggle theme">
            <span class="material-symbols-outlined">${isDark ? "light_mode" : "dark_mode"}</span>
          </button>

          <button type="button" class="cc-hamburger-btn" id="cc-mobile-toggle" aria-label="Open mobile menu" aria-expanded="false">
            <span class="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      <!-- Mobile Slide-out Drawer & Overlay -->
      <div class="cc-mobile-overlay" id="cc-mobile-overlay" aria-hidden="true"></div>
      <div class="cc-mobile-drawer" id="cc-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
        <div class="cc-drawer-header">
          <a href="${homeUrl}" class="cc-brand" aria-label="Home">
            <div class="cc-brand-icon" style="width: 30px; height: 30px;">
              <span class="material-symbols-outlined" style="font-size: 18px;">currency_bitcoin</span>
            </div>
            <span class="cc-brand-title" style="font-size: 15px;">${APP_CONFIG.shortName}</span>
          </a>
          <button type="button" class="cc-drawer-close-btn" id="cc-drawer-close" aria-label="Close menu">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav class="cc-drawer-nav" aria-label="Mobile Navigation">
          ${mobileLinksHtml}
        </nav>

        <div class="cc-drawer-footer">
          <button type="button" class="cc-search-trigger" id="cc-drawer-search-btn" style="width: 100%; justify-content: center;">
            <span class="material-symbols-outlined">search</span>
            <span>Search Portal (${searchKbd})</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Bind event listeners for actions and drawer interactions
   */
  bindEvents() {
    const searchBtn = this.target.querySelector("#cc-search-btn");
    const drawerSearchBtn = this.target.querySelector("#cc-drawer-search-btn");
    const themeBtn = this.target.querySelector("#cc-theme-btn");
    const mobileToggle = this.target.querySelector("#cc-mobile-toggle");
    const drawerClose = this.target.querySelector("#cc-drawer-close");
    const mobileOverlay = this.target.querySelector("#cc-mobile-overlay");

    if (searchBtn) {
      searchBtn.addEventListener("click", () => QuickSearch.open());
    }

    if (drawerSearchBtn) {
      drawerSearchBtn.addEventListener("click", () => {
        this.closeDrawer();
        QuickSearch.open();
      });
    }

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        ThemeService.toggleTheme();
      });
    }

    if (mobileToggle) {
      mobileToggle.addEventListener("click", () => {
        this.toggleDrawer();
      });
    }

    if (drawerClose) {
      drawerClose.addEventListener("click", () => {
        this.closeDrawer();
      });
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener("click", () => {
        this.closeDrawer();
      });
    }

    window.removeEventListener("keydown", this._handleKeyDown);
    window.addEventListener("keydown", this._handleKeyDown);

    window.removeEventListener("themechange", this._handleThemeChange);
    window.addEventListener("themechange", this._handleThemeChange);
  }

  toggleDrawer() {
    if (this.isDrawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    this.isDrawerOpen = true;
    const drawer = this.target.querySelector("#cc-mobile-drawer");
    const overlay = this.target.querySelector("#cc-mobile-overlay");
    const toggle = this.target.querySelector("#cc-mobile-toggle");

    if (drawer) drawer.classList.add("is-open");
    if (overlay) {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
    }
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    const drawer = this.target.querySelector("#cc-mobile-drawer");
    const overlay = this.target.querySelector("#cc-mobile-overlay");
    const toggle = this.target.querySelector("#cc-mobile-toggle");

    if (drawer) drawer.classList.remove("is-open");
    if (overlay) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  _handleKeyDown(e) {
    if (e.key === "Escape" && this.isDrawerOpen) {
      this.closeDrawer();
    }
  }

  _handleThemeChange(e) {
    const themeBtn = this.target.querySelector("#cc-theme-btn");
    if (themeBtn) {
      const effective =
        e.detail?.effectiveTheme || ThemeService.getEffectiveTheme();
      const icon = themeBtn.querySelector(".material-symbols-outlined");
      if (icon) {
        icon.textContent = effective === "dark" ? "light_mode" : "dark_mode";
      }
    }
  }
}

export default new Header();

/**
 * Theme Engine & System Preference Controller
 * FinTech Cryptocurrency Club Portal
 */

import { Storage } from "./storage.js";
import { STORAGE_KEYS } from "../config.js";

class ThemeServiceImpl {
  mediaQuery = null;
  initialized = false;

  constructor() {
    this._handleSystemChange = this._handleSystemChange.bind(this);
  }

  /**
   * Initialize theme engine and apply active theme
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;

    if (typeof window !== "undefined" && window.matchMedia) {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      try {
        this.mediaQuery.addEventListener("change", this._handleSystemChange);
      } catch {
        // Fallback for older Safari/WebKit
        this.mediaQuery.addListener(this._handleSystemChange);
      }
    }

    // Multi-tab storage sync
    Storage.subscribe(STORAGE_KEYS.THEME, (newTheme) => {
      if (newTheme && newTheme !== this.getTheme()) {
        this._applyTheme(newTheme, false);
      }
    });

    const current = this.getTheme();
    this._applyTheme(current, false);
  }

  /**
   * Get configured theme preference ('dark', 'light', or 'system')
   * @returns {'dark' | 'light' | 'system'}
   */
  getTheme() {
    const saved = Storage.get(STORAGE_KEYS.THEME, null);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
    return "dark"; // Default FinTech theme is dark
  }

  /**
   * Get effective visual theme currently rendered ('dark' or 'light')
   * @returns {'dark' | 'light'}
   */
  getEffectiveTheme() {
    const pref = this.getTheme();
    if (pref === "system") {
      return this._getSystemPreference();
    }
    return pref;
  }

  /**
   * Set theme preference and apply instantly
   * @param {'dark' | 'light' | 'system'} theme
   */
  setTheme(theme) {
    if (theme !== "dark" && theme !== "light" && theme !== "system") {
      console.warn(
        `[ThemeService] Invalid theme: "${theme}", defaulting to "dark".`,
      );
      theme = "dark";
    }

    Storage.set(STORAGE_KEYS.THEME, theme);
    this._applyTheme(theme, true);
  }

  /**
   * Toggle between dark and light themes (convenience helper)
   * @returns {'dark' | 'light'}
   */
  toggleTheme() {
    const currentEffective = this.getEffectiveTheme();
    const next = currentEffective === "dark" ? "light" : "dark";
    this.setTheme(next);
    return next;
  }

  /**
   * Apply theme to DOM documentElement and dispatch event
   * @private
   */
  _applyTheme(theme, dispatchEvent = true) {
    const effective = theme === "system" ? this._getSystemPreference() : theme;

    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = effective;
      // Ensure color-scheme matches for native form controls
      document.documentElement.style.colorScheme = effective;
    }

    if (dispatchEvent && typeof window !== "undefined") {
      const event = new CustomEvent("themechange", {
        detail: {
          theme,
          effectiveTheme: effective,
        },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Detect OS dark mode preference
   * @private
   */
  _getSystemPreference() {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  }

  /**
   * System theme change listener
   * @private
   */
  _handleSystemChange() {
    if (this.getTheme() === "system") {
      this._applyTheme("system", true);
    }
  }
}

export const ThemeService = new ThemeServiceImpl();
export default ThemeService;

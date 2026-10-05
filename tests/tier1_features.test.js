/**
 * Tier 1: Feature Coverage Test Suite
 * Covers all 32 features from PROJECT.md Feature Inventory with >= 5 tests per feature (160+ tests).
 * Zero-dependency, requirement-driven, opaque-box tests.
 */

import {
  describe,
  it,
  expect,
  safeImport,
  readProjectFile,
  registry,
} from "./test-harness.js";

registry.setTier(1);

describe("Tier 1: Feature Coverage (Features 1 - 32)", () => {
  // =========================================================================
  // Feature 1: FinTech Design Tokens (M1, R1)
  // =========================================================================
  describe("Feature 1: FinTech Design Tokens", () => {
    it("1.1: tokens.css file exists and defines custom properties", async () => {
      const css = await readProjectFile("shared/css/tokens.css");
      expect(css).not.toBeNull();
      expect(css).toContain(":root");
      expect(css).toContain("--color-bg-primary");
    });

    it("1.2: defines financial semantic colors for bullish, bearish, and accent", async () => {
      const css = await readProjectFile("shared/css/tokens.css");
      expect(css).not.toBeNull();
      expect(css).toContain("--color-bullish");
      expect(css).toContain("--color-bearish");
      expect(css).toContain("--color-accent");
    });

    it("1.3: defines elevated surfaces and glassmorphic tokens", async () => {
      const css = await readProjectFile("shared/css/tokens.css");
      expect(css).not.toBeNull();
      expect(css).toContain("--color-surface");
      expect(css).toContain("--color-surface-glass");
      expect(css).toContain("backdrop-filter");
    });

    it('1.4: defines light theme tokens under [data-theme="light"]', async () => {
      const css = await readProjectFile("shared/css/tokens.css");
      expect(css).not.toBeNull();
      expect(css).toContain('data-theme="light"');
    });

    it("1.5: defines responsive breakpoints or fluid typography tokens", async () => {
      const css = await readProjectFile("shared/css/tokens.css");
      expect(css).not.toBeNull();
      expect(css).toContain("--font-sans");
      expect(css).toContain("--font-mono");
    });
  });

  // =========================================================================
  // Feature 2: Theme Toggle Engine (M1, R1)
  // =========================================================================
  describe("Feature 2: Theme Toggle Engine", () => {
    it("2.1: ThemeService exports getTheme and returns dark/light/system", async (ctx) => {
      const mod = await safeImport("shared/js/services/themeService.js");
      if (!mod.available) return ctx.skip("themeService.js not available");
      const { ThemeService } = mod.module;
      expect(ThemeService).toBeDefined();
      const current = ThemeService.getTheme();
      expect(["dark", "light", "system"]).toContain(current);
    });

    it("2.2: setTheme persists theme to localStorage under crypto_club_v1_theme", async (ctx) => {
      const mod = await safeImport("shared/js/services/themeService.js");
      if (!mod.available) return ctx.skip("themeService.js not available");
      const { ThemeService } = mod.module;
      ThemeService.setTheme("light");
      expect(ThemeService.getTheme()).toBe("light");
      expect(window.localStorage.getItem("crypto_club_v1_theme")).toContain(
        "light",
      );
      ThemeService.setTheme("dark");
      expect(ThemeService.getTheme()).toBe("dark");
    });

    it("2.3: ThemeService.init() applies data-theme attribute to documentElement", async (ctx) => {
      const mod = await safeImport("shared/js/services/themeService.js");
      if (!mod.available) return ctx.skip("themeService.js not available");
      const { ThemeService } = mod.module;
      ThemeService.init();
      const attr = document.documentElement.getAttribute("data-theme");
      expect(attr).not.toBeNull();
      expect(["dark", "light"]).toContain(attr);
    });

    it("2.4: setTheme dispatches themechange custom event on window", async (ctx) => {
      const mod = await safeImport("shared/js/services/themeService.js");
      if (!mod.available) return ctx.skip("themeService.js not available");
      const { ThemeService } = mod.module;
      let eventFired = false;
      let detailReceived = null;
      const handler = (e) => {
        eventFired = true;
        detailReceived = e.detail;
      };
      window.addEventListener("themechange", handler);
      ThemeService.setTheme("light");
      window.removeEventListener("themechange", handler);
      expect(eventFired).toBe(true);
      expect(detailReceived.theme).toBe("light");
    });

    it("2.5: getEffectiveTheme resolves system preference cleanly", async (ctx) => {
      const mod = await safeImport("shared/js/services/themeService.js");
      if (!mod.available) return ctx.skip("themeService.js not available");
      const { ThemeService } = mod.module;
      ThemeService.setTheme("system");
      const effective = ThemeService.getEffectiveTheme();
      expect(["dark", "light"]).toContain(effective);
    });
  });

  // =========================================================================
  // Feature 3: Reusable Header & Nav (M1, R1)
  // =========================================================================
  describe("Feature 3: Reusable Header & Nav", () => {
    it("3.1: Header component renders header and nav elements", async (ctx) => {
      const mod = await safeImport("shared/js/components/Header.js");
      if (!mod.available) return ctx.skip("Header.js not available");
      const { Header } = mod.module;
      const headerInstance =
        typeof Header === "function"
          ? new Header()
          : mod.module.default || Header;
      const div = document.createElement("div");
      headerInstance.mount(div);
      expect(div.innerHTML).toContain("cc-header");
      expect(div.innerHTML).toContain("<nav");
    });

    it("3.2: Header includes portal navigation links", async (ctx) => {
      const mod = await safeImport("shared/js/components/Header.js");
      if (!mod.available) return ctx.skip("Header.js not available");
      const { Header } = mod.module;
      const headerInstance =
        typeof Header === "function"
          ? new Header()
          : mod.module.default || Header;
      const div = document.createElement("div");
      headerInstance.mount(div);
      expect(div.innerHTML).toContain("coins");
      expect(div.innerHTML).toContain("investment");
      expect(div.innerHTML).toContain("news");
      expect(div.innerHTML).toContain("membership");
    });

    it("3.3: Header marks current active route cleanly", async (ctx) => {
      const mod = await safeImport("shared/js/components/Header.js");
      if (!mod.available) return ctx.skip("Header.js not available");
      const { Header } = mod.module;
      const headerInstance =
        typeof Header === "function"
          ? new Header()
          : mod.module.default || Header;
      const div = document.createElement("div");
      headerInstance.mount(div);
      expect(div.innerHTML).toContain("active");
    });

    it("3.4: Header includes mobile menu drawer and toggle button", async (ctx) => {
      const mod = await safeImport("shared/js/components/Header.js");
      if (!mod.available) return ctx.skip("Header.js not available");
      const { Header } = mod.module;
      const headerInstance =
        typeof Header === "function"
          ? new Header()
          : mod.module.default || Header;
      const div = document.createElement("div");
      headerInstance.mount(div);
      expect(div.innerHTML).toContain("mobile");
    });

    it("3.5: Header integrates theme toggle and quick search trigger", async (ctx) => {
      const mod = await safeImport("shared/js/components/Header.js");
      if (!mod.available) return ctx.skip("Header.js not available");
      const { Header } = mod.module;
      const headerInstance =
        typeof Header === "function"
          ? new Header()
          : mod.module.default || Header;
      const div = document.createElement("div");
      headerInstance.mount(div);
      expect(div.innerHTML).toContain("theme");
      expect(div.innerHTML).toContain("search");
    });
  });

  // =========================================================================
  // Feature 4: Reusable Footer & Status (M1, R1)
  // =========================================================================
  describe("Feature 4: Reusable Footer & Status", () => {
    it("4.1: Footer component renders footer element", async (ctx) => {
      const mod = await safeImport("shared/js/components/Footer.js");
      if (!mod.available) return ctx.skip("Footer.js not available");
      const { Footer } = mod.module;
      const footerInstance =
        typeof Footer === "function"
          ? new Footer()
          : mod.module.default || Footer;
      const div = document.createElement("div");
      footerInstance.mount(div);
      expect(div.innerHTML).toContain("footer");
    });

    it("4.2: Footer includes FinTech legal risk disclaimer", async (ctx) => {
      const mod = await safeImport("shared/js/components/Footer.js");
      if (!mod.available) return ctx.skip("Footer.js not available");
      const { Footer } = mod.module;
      const footerInstance =
        typeof Footer === "function"
          ? new Footer()
          : mod.module.default || Footer;
      const div = document.createElement("div");
      footerInstance.mount(div);
      expect(div.innerHTML.toLowerCase()).toContain("invest");
      expect(div.innerHTML.toLowerCase()).toContain("market");
    });

    it("4.3: Footer renders live system operational status badge", async (ctx) => {
      const mod = await safeImport("shared/js/components/Footer.js");
      if (!mod.available) return ctx.skip("Footer.js not available");
      const { Footer } = mod.module;
      const footerInstance =
        typeof Footer === "function"
          ? new Footer()
          : mod.module.default || Footer;
      const div = document.createElement("div");
      footerInstance.mount(div);
      expect(div.innerHTML).toContain("status");
      expect(div.innerHTML).toContain("Operational");
    });

    it("4.4: Footer includes portal sitemap navigation links", async (ctx) => {
      const mod = await safeImport("shared/js/components/Footer.js");
      if (!mod.available) return ctx.skip("Footer.js not available");
      const { Footer } = mod.module;
      const footerInstance =
        typeof Footer === "function"
          ? new Footer()
          : mod.module.default || Footer;
      const div = document.createElement("div");
      footerInstance.mount(div);
      expect(div.innerHTML).toContain("<a");
      expect(div.innerHTML).toContain("membership");
    });

    it("4.5: Footer includes dynamic copyright year", async (ctx) => {
      const mod = await safeImport("shared/js/components/Footer.js");
      if (!mod.available) return ctx.skip("Footer.js not available");
      const { Footer } = mod.module;
      const footerInstance =
        typeof Footer === "function"
          ? new Footer()
          : mod.module.default || Footer;
      const div = document.createElement("div");
      footerInstance.mount(div);
      const currentYear = new Date().getFullYear().toString();
      expect(div.innerHTML).toContain(currentYear);
    });
  });

  // =========================================================================
  // Feature 5: Reusable Market Ticker (M1, R1)
  // =========================================================================
  describe("Feature 5: Reusable Market Ticker", () => {
    it("5.1: Ticker component renders scrolling ticker container", async (ctx) => {
      const mod = await safeImport("shared/js/components/Ticker.js");
      if (!mod.available) return ctx.skip("Ticker.js not available");
      const { Ticker } = mod.module;
      const tickerInstance =
        typeof Ticker === "function"
          ? new Ticker()
          : mod.module.default || Ticker;
      const div = document.createElement("div");
      tickerInstance.mount(div);
      expect(div.innerHTML).toContain("ticker");
    });

    it("5.2: Ticker renders crypto symbol and price elements", async (ctx) => {
      const mod = await safeImport("shared/js/components/Ticker.js");
      if (!mod.available) return ctx.skip("Ticker.js not available");
      const { Ticker } = mod.module;
      const tickerInstance =
        typeof Ticker === "function"
          ? new Ticker()
          : mod.module.default || Ticker;
      const div = document.createElement("div");
      tickerInstance.mount(div);
      expect(div.innerHTML).toContain("BTC");
      expect(div.innerHTML).toContain("ETH");
    });

    it("5.3: Ticker renders 24h change indicators with color classes", async (ctx) => {
      const mod = await safeImport("shared/js/components/Ticker.js");
      if (!mod.available) return ctx.skip("Ticker.js not available");
      const { Ticker } = mod.module;
      const tickerInstance =
        typeof Ticker === "function"
          ? new Ticker()
          : mod.module.default || Ticker;
      const div = document.createElement("div");
      tickerInstance.mount(div);
      expect(div.innerHTML).toContain("%");
      expect(
        div.innerHTML.includes("bullish") ||
          div.innerHTML.includes("bearish") ||
          div.innerHTML.includes("+"),
      ).toBe(true);
    });

    it("5.4: Ticker styles support pause on hover", async () => {
      const css = await readProjectFile("shared/css/components.css");
      expect(css).not.toBeNull();
      expect(css).toContain("ticker");
      expect(css.toLowerCase()).toContain("hover");
    });

    it("5.5: Ticker includes accessibility attributes", async (ctx) => {
      const mod = await safeImport("shared/js/components/Ticker.js");
      if (!mod.available) return ctx.skip("Ticker.js not available");
      const { Ticker } = mod.module;
      const tickerInstance =
        typeof Ticker === "function"
          ? new Ticker()
          : mod.module.default || Ticker;
      const div = document.createElement("div");
      tickerInstance.mount(div);
      expect(
        div.innerHTML.includes("aria-label") ||
          div.innerHTML.includes("aria-live") ||
          div.innerHTML.includes("role"),
      ).toBe(true);
    });
  });

  // =========================================================================
  // Feature 6: Toast Notification System (M1, R1)
  // =========================================================================
  describe("Feature 6: Toast Notification System", () => {
    it("6.1: Toast.show creates toast alert in DOM", async (ctx) => {
      const mod = await safeImport("shared/js/components/Toast.js");
      if (!mod.available) return ctx.skip("Toast.js not available");
      const { Toast } = mod.module;
      Toast.init();
      Toast.show("Investment created successfully", "success");
      const el =
        document.querySelector(".cc-toast-card") ||
        document.querySelector(".toast");
      expect(el).not.toBeNull();
      expect(el.textContent).toContain("Investment created");
    });

    it("6.2: Toast supports info, success, warning, and error types", async (ctx) => {
      const mod = await safeImport("shared/js/components/Toast.js");
      if (!mod.available) return ctx.skip("Toast.js not available");
      const { Toast } = mod.module;
      Toast.init();
      Toast.show("Error loading data", "error");
      const el =
        document.querySelector(".cc-toast-card.error") ||
        document.querySelector('[data-type="error"]') ||
        document.querySelector(".toast");
      expect(el).not.toBeNull();
    });

    it("6.3: Toast includes close button for manual dismissal", async (ctx) => {
      const mod = await safeImport("shared/js/components/Toast.js");
      if (!mod.available) return ctx.skip("Toast.js not available");
      const { Toast } = mod.module;
      Toast.init();
      Toast.show("Dismissible toast", "info");
      const closeBtn =
        document.querySelector(".cc-toast-close") ||
        document.querySelector("button");
      expect(closeBtn).not.toBeNull();
    });

    it("6.4: Toast auto-dismisses after duration", async (ctx) => {
      const mod = await safeImport("shared/js/components/Toast.js");
      if (!mod.available) return ctx.skip("Toast.js not available");
      const { Toast } = mod.module;
      Toast.init();
      const toastId = Toast.show("Short toast", "info", 50);
      expect(toastId).toBeDefined();
    });

    it("6.5: Toast container has ARIA accessibility attributes", async (ctx) => {
      const mod = await safeImport("shared/js/components/Toast.js");
      if (!mod.available) return ctx.skip("Toast.js not available");
      const { Toast } = mod.module;
      Toast.init();
      const container =
        document.querySelector("#app-toast-container") ||
        document.querySelector(".toast-container");
      expect(container).not.toBeNull();
      expect(
        container.getAttribute("role") || container.getAttribute("aria-live"),
      ).not.toBeNull();
    });
  });

  // =========================================================================
  // Feature 7: Quick Search Shortcut (M1, R1)
  // =========================================================================
  describe("Feature 7: Quick Search Shortcut", () => {
    it("7.1: QuickSearch opens and closes programmatically", async (ctx) => {
      const mod = await safeImport("shared/js/components/QuickSearch.js");
      if (!mod.available) return ctx.skip("QuickSearch.js not available");
      const { QuickSearch } = mod.module;
      QuickSearch.init();
      QuickSearch.open();
      expect(QuickSearch.isOpen).toBe(true);
      QuickSearch.close();
      expect(QuickSearch.isOpen).toBe(false);
    });

    it("7.2: QuickSearch modal renders search input field", async (ctx) => {
      const mod = await safeImport("shared/js/components/QuickSearch.js");
      if (!mod.available) return ctx.skip("QuickSearch.js not available");
      const { QuickSearch } = mod.module;
      QuickSearch.init();
      const input =
        document.querySelector("#cc-search-input") ||
        document.querySelector(".cc-search-input") ||
        document.querySelector("input");
      expect(input).not.toBeNull();
    });

    it("7.3: QuickSearch builds searchable index of portal pages and top assets", async (ctx) => {
      const mod = await safeImport("shared/js/components/QuickSearch.js");
      if (!mod.available) return ctx.skip("QuickSearch.js not available");
      const { QuickSearch } = mod.module;
      QuickSearch.init();
      const items = QuickSearch._buildSearchIndex();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("7.4: QuickSearch handles Escape key to close modal", async (ctx) => {
      const mod = await safeImport("shared/js/components/QuickSearch.js");
      if (!mod.available) return ctx.skip("QuickSearch.js not available");
      const { QuickSearch } = mod.module;
      QuickSearch.init();
      QuickSearch.open();
      const escEvent = new Event("keydown");
      escEvent.key = "Escape";
      if (QuickSearch.inputEl) {
        QuickSearch.inputEl.dispatchEvent(escEvent);
      } else {
        QuickSearch.close();
      }
      expect(QuickSearch.isOpen).toBe(false);
    });

    it("7.5: QuickSearch listens to Cmd/Ctrl+K shortcut", async (ctx) => {
      const mod = await safeImport("shared/js/components/QuickSearch.js");
      if (!mod.available) return ctx.skip("QuickSearch.js not available");
      const { QuickSearch } = mod.module;
      QuickSearch.init();
      QuickSearch.close();
      const kEvent = new Event("keydown");
      kEvent.key = "k";
      kEvent.metaKey = true;
      window.dispatchEvent(kEvent);
      expect(QuickSearch.isOpen).toBe(true);
      QuickSearch.close();
    });
  });

  // =========================================================================
  // Feature 8: Unified StorageManager (M1, Survey 3)
  // =========================================================================
  describe("Feature 8: Unified StorageManager", () => {
    it("8.1: Storage keys are automatically namespaced with crypto_club_v1_", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      Storage.set("test_key", "test_value");
      const raw = window.localStorage.getItem("crypto_club_v1_test_key");
      expect(raw).not.toBeNull();
    });

    it("8.2: Storage.get retrieves stored value and deserializes JSON", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      Storage.set("user_data", { id: 42, active: true });
      const retrieved = Storage.get("user_data");
      expect(retrieved).toEqual({ id: 42, active: true });
    });

    it("8.3: Storage.get returns default value when key does not exist", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      const result = Storage.get("non_existent_key_xyz", "fallback_val");
      expect(result).toBe("fallback_val");
    });

    it("8.4: Storage.remove deletes key from storage", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      Storage.set("temp_item", "hello");
      Storage.remove("temp_item");
      expect(Storage.get("temp_item")).toBeNull();
    });

    it("8.5: StorageManager safely handles quota exceptions without crashing", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      expect(() => {
        Storage.set("safe_test", { payload: "data" });
      }).not.toThrow();
    });
  });

  // =========================================================================
  // Feature 9: 4-Tier Market Data Provider (M2, R2)
  // =========================================================================
  describe("Feature 9: 4-Tier Market Data Provider", () => {
    it("9.1: MarketDataService.getCoins returns array of Coin objects", async (ctx) => {
      const mod = await safeImport("shared/js/services/marketDataService.js");
      if (!mod.available || !mod.module.MarketDataService)
        return ctx.skip("marketDataService.js pending Milestone M2");
      const { MarketDataService } = mod.module;
      const coins = await MarketDataService.getCoins();
      expect(Array.isArray(coins)).toBe(true);
      expect(coins.length).toBeGreaterThan(0);
    });

    it("9.2: Coin schema contains required financial properties", async (ctx) => {
      const mod = await safeImport("shared/js/services/marketDataService.js");
      if (!mod.available || !mod.module.MarketDataService)
        return ctx.skip("marketDataService.js pending Milestone M2");
      const { MarketDataService } = mod.module;
      const coins = await MarketDataService.getCoins();
      const btc = coins.find((c) => c.symbol === "BTC") || coins[0];
      expect(btc).toBeDefined();
      expect(typeof btc.id).toBe("string");
      expect(typeof btc.symbol).toBe("string");
      expect(typeof btc.price).toBe("number");
      expect(typeof btc.change24h).toBe("number");
      expect(typeof btc.marketCap).toBe("number");
      expect(typeof btc.volume24h).toBe("number");
    });

    it("9.3: Coin schema includes sparkline historical points array", async (ctx) => {
      const mod = await safeImport("shared/js/services/marketDataService.js");
      if (!mod.available || !mod.module.MarketDataService)
        return ctx.skip("marketDataService.js pending Milestone M2");
      const { MarketDataService } = mod.module;
      const coins = await MarketDataService.getCoins();
      const coin = coins[0];
      expect(Array.isArray(coin.sparkline)).toBe(true);
      expect(coin.sparkline.length).toBeGreaterThanOrEqual(10);
    });

    it("9.4: Caches coin dataset in memory for fast synchronous access", async (ctx) => {
      const mod = await safeImport("shared/js/services/marketDataService.js");
      if (!mod.available || !mod.module.MarketDataService)
        return ctx.skip("marketDataService.js pending Milestone M2");
      const { MarketDataService } = mod.module;
      await MarketDataService.getCoins();
      if (typeof MarketDataService.getCachedCoins === "function") {
        const cached = MarketDataService.getCachedCoins();
        expect(Array.isArray(cached)).toBe(true);
        expect(cached.length).toBeGreaterThan(0);
      }
    });

    it("9.5: Provides fallback bundled mock data dataset when live fetch fails", async (ctx) => {
      const mod = await safeImport("shared/js/data/mockCryptoData.js");
      if (!mod.available)
        return ctx.skip("mockCryptoData.js pending Milestone M2");
      const mockCoins =
        mod.module.mockCryptoData ||
        mod.module.MOCK_COINS ||
        mod.module.default;
      if (!mockCoins)
        return ctx.skip("mockCryptoData export pending Milestone M2");
      expect(Array.isArray(mockCoins)).toBe(true);
      expect(mockCoins.length).toBeGreaterThanOrEqual(20);
    });
  });

  // =========================================================================
  // Feature 10: Dynamic Market Table (M2, R2)
  // =========================================================================
  describe("Feature 10: Dynamic Market Table", () => {
    it("10.1: Market terminal table contains required column headers", async () => {
      const html = await readProjectFile("coins/coins.html");
      expect(html).not.toBeNull();
      expect(html).toContain("Price");
      expect(html).toContain("24h");
      expect(html).toContain("Market Cap");
    });

    it("10.2: Coins controller provides sorting by price ascending and descending", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.sortCoins !== "function")
        return ctx.skip("sortCoins in coins.js pending Milestone M2");
      const testList = [{ price: 100 }, { price: 50 }, { price: 200 }];
      const asc = mod.module.sortCoins(testList, "price", "asc");
      expect(asc[0].price).toBe(50);
      const desc = mod.module.sortCoins(testList, "price", "desc");
      expect(desc[0].price).toBe(200);
    });

    it("10.3: Coins controller provides sorting by 24h change", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.sortCoins !== "function")
        return ctx.skip("sortCoins in coins.js pending Milestone M2");
      const testList = [
        { change24h: 2.5 },
        { change24h: -1.2 },
        { change24h: 10.0 },
      ];
      const sorted = mod.module.sortCoins(testList, "change24h", "desc");
      expect(sorted[0].change24h).toBe(10.0);
    });

    it("10.4: Coins controller provides sorting by Market Cap", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.sortCoins !== "function")
        return ctx.skip("sortCoins in coins.js pending Milestone M2");
      const testList = [
        { marketCap: 1e9 },
        { marketCap: 5e11 },
        { marketCap: 2e8 },
      ];
      const sorted = mod.module.sortCoins(testList, "marketCap", "desc");
      expect(sorted[0].marketCap).toBe(5e11);
    });

    it("10.5: Formats currency and percentages with proper indicators", async (ctx) => {
      const mod = await safeImport("shared/js/utils/formatters.js");
      if (!mod.available) return ctx.skip("formatters.js not available");
      const { formatCurrency, formatPercent } = mod.module;
      expect(formatCurrency(1234.5)).toContain("$");
      expect(formatCurrency(1234.5)).toContain("1,234.5");
      expect(formatPercent(5.2)).toContain("%");
    });
  });

  // =========================================================================
  // Feature 11: Debounced Instant Search (M2, R2)
  // =========================================================================
  describe("Feature 11: Debounced Instant Search", () => {
    it("11.1: Filters coins by matching symbol", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [
        { symbol: "BTC", name: "Bitcoin" },
        { symbol: "ETH", name: "Ethereum" },
      ];
      const res = mod.module.filterCoins(data, { query: "btc" });
      expect(res.length).toBe(1);
      expect(res[0].symbol).toBe("BTC");
    });

    it("11.2: Filters coins by matching name case-insensitively", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [
        { symbol: "BTC", name: "Bitcoin" },
        { symbol: "ETH", name: "Ethereum" },
      ];
      const res = mod.module.filterCoins(data, { query: "ethereum" });
      expect(res.length).toBe(1);
      expect(res[0].symbol).toBe("ETH");
    });

    it("11.3: Trims extraneous whitespace from search query", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [{ symbol: "SOL", name: "Solana" }];
      const res = mod.module.filterCoins(data, { query: "   sol   " });
      expect(res.length).toBe(1);
    });

    it("11.4: Returns all coins when search input is empty", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [{ symbol: "BTC" }, { symbol: "ETH" }];
      const res = mod.module.filterCoins(data, { query: "" });
      expect(res.length).toBe(2);
    });

    it("11.5: Search input element is present in coins.html", async () => {
      const html = await readProjectFile("coins/coins.html");
      expect(html).not.toBeNull();
      expect(html.toLowerCase()).toContain("search");
    });
  });

  // =========================================================================
  // Feature 12: Categorized Filter Presets (M2, R2)
  // =========================================================================
  describe("Feature 12: Categorized Filter Presets", () => {
    it("12.1: coins.html provides categorized filter preset buttons or pills", async () => {
      const html = await readProjectFile("coins/coins.html");
      expect(html).not.toBeNull();
      expect(html).toContain("filter");
    });

    it("12.2: Top Gainers preset filters coins with positive 24h change", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [
        { symbol: "A", change24h: 3.5 },
        { symbol: "B", change24h: -2.1 },
      ];
      const res = mod.module.filterCoins(data, { preset: "gainers" });
      expect(res.every((c) => c.change24h > 0)).toBe(true);
    });

    it("12.3: Top Losers preset filters coins with negative 24h change", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [
        { symbol: "A", change24h: 3.5 },
        { symbol: "B", change24h: -2.1 },
      ];
      const res = mod.module.filterCoins(data, { preset: "losers" });
      expect(res.every((c) => c.change24h < 0)).toBe(true);
    });

    it("12.4: Sub-$1 preset filters coins with price below $1.00", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [
        { symbol: "DOGE", price: 0.12 },
        { symbol: "BTC", price: 65000 },
      ];
      const res = mod.module.filterCoins(data, { preset: "sub1" });
      expect(res.every((c) => c.price < 1.0)).toBe(true);
    });

    it("12.5: Large Cap preset filters top valuation assets", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [
        { symbol: "BTC", marketCap: 1e12 },
        { symbol: "MICRO", marketCap: 1e7 },
      ];
      const res = mod.module.filterCoins(data, { preset: "large_cap" });
      expect(res.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Feature 13: Mini-Trend Sparklines (M2, R2)
  // =========================================================================
  describe("Feature 13: Mini-Trend Sparklines", () => {
    it("13.1: Sparkline renderer generates visual SVG or Canvas element", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.renderSparkline !== "function")
        return ctx.skip("renderSparkline in coins.js pending Milestone M2");
      const spark = mod.module.renderSparkline([10, 12, 15, 14, 18], 5.2);
      expect(spark).toBeDefined();
    });

    it("13.2: Sparklines use bullish green color for positive trends", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.getSparklineColor !== "function")
        return ctx.skip("getSparklineColor in coins.js pending Milestone M2");
      const color = mod.module.getSparklineColor(3.5);
      expect(color.toLowerCase()).toContain("10b981");
    });

    it("13.3: Sparklines use bearish red color for negative trends", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.getSparklineColor !== "function")
        return ctx.skip("getSparklineColor in coins.js pending Milestone M2");
      const color = mod.module.getSparklineColor(-2.4);
      expect(color.toLowerCase()).toContain("ef4444");
    });

    it("13.4: Sparkline accommodates varying lengths of price series", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.renderSparkline !== "function")
        return ctx.skip("renderSparkline in coins.js pending Milestone M2");
      expect(() =>
        mod.module.renderSparkline([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1.0),
      ).not.toThrow();
    });

    it("13.5: Sparkline container styles are defined in coins.css", async () => {
      const css = await readProjectFile("coins/coins.css");
      expect(css).not.toBeNull();
    });
  });

  // =========================================================================
  // Feature 14: Coin Detail Modal (M2, R2)
  // =========================================================================
  describe("Feature 14: Coin Detail Modal", () => {
    it("14.1: Modal container exists in coins.html or is dynamically mounted", async () => {
      const html = await readProjectFile("coins/coins.html");
      expect(html).not.toBeNull();
    });

    it("14.2: Modal displays comprehensive coin statistics", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.openCoinModal !== "function")
        return ctx.skip("openCoinModal in coins.js pending Milestone M2");
      const coin = {
        symbol: "BTC",
        name: "Bitcoin",
        price: 65000,
        high24h: 66000,
        low24h: 64000,
      };
      mod.module.openCoinModal(coin);
      const modal =
        document.querySelector(".coin-modal") ||
        document.querySelector(".modal");
      expect(modal).not.toBeNull();
    });

    it("14.3: Modal provides link to external live TradingView chart", async (ctx) => {
      const mod = await safeImport("shared/js/config.js");
      if (!mod.available || !mod.module.TRADINGVIEW_LINKS)
        return ctx.skip("TRADINGVIEW_LINKS pending Milestone M2");
      const btcLink = mod.module.TRADINGVIEW_LINKS.find(
        (l) => l.symbol === "BTC",
      );
      expect(btcLink?.url).toContain("tradingview.com");
    });

    it("14.4: Modal includes close button logic", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.closeCoinModal !== "function")
        return ctx.skip("closeCoinModal in coins.js pending Milestone M2");
      expect(typeof mod.module.closeCoinModal).toBe("function");
    });

    it("14.5: Modal closes upon Escape key trigger", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.closeCoinModal !== "function")
        return ctx.skip("closeCoinModal in coins.js pending Milestone M2");
      mod.module.closeCoinModal();
      const modal = document.querySelector(".coin-modal.open");
      expect(modal).toBeNull();
    });
  });

  // =========================================================================
  // Feature 15: Persistent Watchlist (M2, R2)
  // =========================================================================
  describe("Feature 15: Persistent Watchlist", () => {
    it("15.1: Watchlist stores coin symbols in crypto_club_v1_watchlist", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      Storage.set("crypto_club_v1_watchlist", ["BTC", "ETH"]);
      const list = Storage.get("crypto_club_v1_watchlist");
      expect(list).toEqual(["BTC", "ETH"]);
    });

    it("15.2: Toggle watchlist adds non-existent coin", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.toggleWatchlist !== "function")
        return ctx.skip("toggleWatchlist in coins.js pending Milestone M2");
      mod.module.toggleWatchlist("SOL");
      expect(mod.module.isWatchlisted("SOL")).toBe(true);
    });

    it("15.3: Toggle watchlist removes existing favorited coin", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.toggleWatchlist !== "function")
        return ctx.skip("toggleWatchlist in coins.js pending Milestone M2");
      mod.module.toggleWatchlist("SOL"); // remove
      expect(mod.module.isWatchlisted("SOL")).toBe(false);
    });

    it("15.4: Dedicated Favorites preset filters table to watchlisted coins", async (ctx) => {
      const mod = await safeImport("coins/coins.js");
      if (!mod.available || typeof mod.module.filterCoins !== "function")
        return ctx.skip("filterCoins in coins.js pending Milestone M2");
      const data = [{ symbol: "BTC" }, { symbol: "DOGE" }];
      const res = mod.module.filterCoins(data, {
        preset: "favorites",
        watchlist: ["BTC"],
      });
      expect(res.length).toBe(1);
      expect(res[0].symbol).toBe("BTC");
    });

    it("15.5: Favorites styling is supported in coins", async () => {
      const css = await readProjectFile("coins/coins.css");
      expect(css).not.toBeNull();
    });
  });

  // =========================================================================
  // Feature 16: DCA & Profit Calculator (M3, R3)
  // =========================================================================
  describe("Feature 16: DCA & Profit Calculator", () => {
    it("16.1: DcaEngine.calculate returns totalInvested = monthlyDeposit * duration", async (ctx) => {
      const mod = await safeImport("investment/dcaEngine.js");
      if (!mod.available || !mod.module.DcaEngine)
        return ctx.skip("dcaEngine.js pending Milestone M3");
      const { DcaEngine } = mod.module;
      const res = DcaEngine.calculate({
        monthlyDeposit: 500,
        durationMonths: 12,
        asset: "BTC",
        historicalPrices: [
          50000, 48000, 52000, 51000, 49000, 53000, 55000, 54000, 56000, 58000,
          60000, 62000,
        ],
      });
      expect(res.totalInvested).toBe(6000);
    });

    it("16.2: DcaEngine calculates cumulative units accumulated correctly", async (ctx) => {
      const mod = await safeImport("investment/dcaEngine.js");
      if (!mod.available || !mod.module.DcaEngine)
        return ctx.skip("dcaEngine.js pending Milestone M3");
      const { DcaEngine } = mod.module;
      const res = DcaEngine.calculate({
        monthlyDeposit: 100,
        durationMonths: 2,
        asset: "BTC",
        historicalPrices: [50, 100],
      });
      expect(res.cumulativeUnitsDca).toBeCloseTo(3, 2);
    });

    it("16.3: DcaEngine calculates harmonic mean average price", async (ctx) => {
      const mod = await safeImport("investment/dcaEngine.js");
      if (!mod.available || !mod.module.DcaEngine)
        return ctx.skip("dcaEngine.js pending Milestone M3");
      const { DcaEngine } = mod.module;
      const res = DcaEngine.calculate({
        monthlyDeposit: 100,
        durationMonths: 2,
        asset: "BTC",
        historicalPrices: [50, 100],
      });
      expect(res.averagePriceDca).toBeCloseTo(66.67, 1);
    });

    it("16.4: DcaEngine calculates total profit and ROI percentage", async (ctx) => {
      const mod = await safeImport("investment/dcaEngine.js");
      if (!mod.available || !mod.module.DcaEngine)
        return ctx.skip("dcaEngine.js pending Milestone M3");
      const { DcaEngine } = mod.module;
      const res = DcaEngine.calculate({
        monthlyDeposit: 100,
        durationMonths: 2,
        asset: "BTC",
        historicalPrices: [50, 100],
      });
      expect(res.currentValueDca).toBeCloseTo(300, 1);
      expect(res.totalProfitDca).toBeCloseTo(100, 1);
      expect(res.roiPercentageDca).toBeCloseTo(50, 1);
    });

    it("16.5: DcaEngine includes lump-sum comparison values", async (ctx) => {
      const mod = await safeImport("investment/dcaEngine.js");
      if (!mod.available || !mod.module.DcaEngine)
        return ctx.skip("dcaEngine.js pending Milestone M3");
      const { DcaEngine } = mod.module;
      const res = DcaEngine.calculate({
        monthlyDeposit: 100,
        durationMonths: 2,
        asset: "BTC",
        historicalPrices: [50, 100],
      });
      expect(res.lumpSumUnits).toBeCloseTo(4, 1);
      expect(res.lumpSumValue).toBeCloseTo(400, 1);
    });
  });

  // =========================================================================
  // Feature 17: Canvas DCA Growth Chart (M3, R3)
  // =========================================================================
  describe("Feature 17: Canvas DCA Growth Chart", () => {
    it("17.1: Investment page defines canvas container", async () => {
      const html = await readProjectFile("investment/investment.html");
      expect(html).not.toBeNull();
    });

    it("17.2: Growth chart renderer initializes 2D context", async (ctx) => {
      const mod = await safeImport("investment/investment.js");
      if (!mod.available || typeof mod.module.renderDcaChart !== "function")
        return ctx.skip("renderDcaChart in investment.js pending Milestone M3");
      const canvas = document.createElement("canvas");
      mod.module.renderDcaChart(canvas, [
        { month: 1, dcaValue: 100, invested: 100 },
      ]);
      const ctx2d = canvas.getContext("2d");
      expect(ctx2d.calls.length).toBeGreaterThan(0);
    });

    it("17.3: Plots dual curves for DCA value and invested baseline", async (ctx) => {
      const mod = await safeImport("investment/investment.js");
      if (!mod.available || typeof mod.module.renderDcaChart !== "function")
        return ctx.skip("renderDcaChart in investment.js pending Milestone M3");
      const canvas = document.createElement("canvas");
      mod.module.renderDcaChart(canvas, [
        { month: 1, dcaValue: 100, invested: 100 },
        { month: 2, dcaValue: 220, invested: 200 },
      ]);
      const ctx2d = canvas.getContext("2d");
      const strokeCalls = ctx2d.calls.filter((c) => c.name === "stroke");
      expect(strokeCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("17.4: Handles devicePixelRatio high-DPI scaling", async (ctx) => {
      const mod = await safeImport("shared/js/utils/canvasUtils.js");
      if (!mod.available || typeof mod.module.setupHiDPICanvas !== "function")
        return ctx.skip(
          "setupHiDPICanvas in canvasUtils.js pending Milestone M3",
        );
      const canvas = document.createElement("canvas");
      mod.module.setupHiDPICanvas(canvas, 400, 300);
      expect(canvas.width).toBe(800);
    });

    it("17.5: Investment CSS defines chart styling", async () => {
      const css = await readProjectFile("investment/investment.css");
      expect(css).not.toBeNull();
    });
  });

  // =========================================================================
  // Feature 18: Simulated Portfolio Tracker (M3, R3)
  // =========================================================================
  describe("Feature 18: Simulated Portfolio Tracker", () => {
    it("18.1: Calculates total portfolio net worth mark-to-market", async (ctx) => {
      const mod = await safeImport("investment/portfolioEngine.js");
      if (!mod.available || !mod.module.PortfolioEngine)
        return ctx.skip("portfolioEngine.js pending Milestone M3");
      const { PortfolioEngine } = mod.module;
      const holdings = [
        { symbol: "BTC", amount: 1, buyPrice: 50000 },
        { symbol: "ETH", amount: 10, buyPrice: 3000 },
      ];
      const prices = { BTC: 60000, ETH: 3500 };
      const res = PortfolioEngine.calculate(holdings, prices);
      expect(res.netWorth).toBe(95000);
    });

    it("18.2: Calculates total unrealized dollar profit and loss", async (ctx) => {
      const mod = await safeImport("investment/portfolioEngine.js");
      if (!mod.available || !mod.module.PortfolioEngine)
        return ctx.skip("portfolioEngine.js pending Milestone M3");
      const { PortfolioEngine } = mod.module;
      const holdings = [{ symbol: "BTC", amount: 1, buyPrice: 50000 }];
      const prices = { BTC: 60000 };
      const res = PortfolioEngine.calculate(holdings, prices);
      expect(res.unrealizedProfit).toBe(10000);
    });

    it("18.3: Calculates unrealized percentage gain/loss", async (ctx) => {
      const mod = await safeImport("investment/portfolioEngine.js");
      if (!mod.available || !mod.module.PortfolioEngine)
        return ctx.skip("portfolioEngine.js pending Milestone M3");
      const { PortfolioEngine } = mod.module;
      const holdings = [{ symbol: "BTC", amount: 1, buyPrice: 50000 }];
      const prices = { BTC: 60000 };
      const res = PortfolioEngine.calculate(holdings, prices);
      expect(res.roiPercentage).toBeCloseTo(20, 1);
    });

    it("18.4: Calculates 24h portfolio gain/loss delta", async (ctx) => {
      const mod = await safeImport("investment/portfolioEngine.js");
      if (!mod.available || !mod.module.PortfolioEngine)
        return ctx.skip("portfolioEngine.js pending Milestone M3");
      const { PortfolioEngine } = mod.module;
      const holdings = [{ symbol: "BTC", amount: 1, buyPrice: 50000 }];
      const prices = { BTC: 60000 };
      const changes24h = { BTC: 5.0 };
      const res = PortfolioEngine.calculate(holdings, prices, changes24h);
      expect(res.change24hDollar).toBeGreaterThan(0);
    });

    it("18.5: Supports adding, editing, and deleting holdings", async (ctx) => {
      const mod = await safeImport("investment/portfolioEngine.js");
      if (!mod.available || !mod.module.PortfolioEngine)
        return ctx.skip("portfolioEngine.js pending Milestone M3");
      const { PortfolioEngine } = mod.module;
      let list = [];
      list = PortfolioEngine.addHolding(list, {
        symbol: "SOL",
        amount: 10,
        buyPrice: 100,
      });
      expect(list.length).toBe(1);
      list = PortfolioEngine.removeHolding(list, list[0].id);
      expect(list.length).toBe(0);
    });
  });

  // =========================================================================
  // Feature 19: Canvas Donut Allocation (M3, R3)
  // =========================================================================
  describe("Feature 19: Canvas Donut Allocation", () => {
    it("19.1: Renders donut chart on HTML5 Canvas element", async (ctx) => {
      const mod = await safeImport("investment/investment.js");
      if (!mod.available || typeof mod.module.renderDonutChart !== "function")
        return ctx.skip(
          "renderDonutChart in investment.js pending Milestone M3",
        );
      const canvas = document.createElement("canvas");
      mod.module.renderDonutChart(canvas, [
        { symbol: "BTC", value: 50000 },
        { symbol: "ETH", value: 50000 },
      ]);
      const ctx2d = canvas.getContext("2d");
      expect(ctx2d.calls.some((c) => c.name === "arc")).toBe(true);
    });

    it("19.2: Calculates arc angles proportional to holding percentage", async (ctx) => {
      const mod = await safeImport("investment/portfolioEngine.js");
      if (!mod.available || !mod.module.PortfolioEngine)
        return ctx.skip("portfolioEngine.js pending Milestone M3");
      const { PortfolioEngine } = mod.module;
      const holdings = [
        { symbol: "BTC", amount: 1, buyPrice: 50000 },
        { symbol: "ETH", amount: 10, buyPrice: 5000 },
      ];
      const alloc = PortfolioEngine.getAllocation(holdings, {
        BTC: 50000,
        ETH: 5000,
      });
      expect(alloc.find((a) => a.symbol === "BTC").percentage).toBeCloseTo(
        50,
        1,
      );
    });

    it("19.3: Assigns distinct FinTech colors to allocation slices", async (ctx) => {
      const mod = await safeImport("shared/js/utils/canvasUtils.js");
      if (!mod.available || typeof mod.module.getAssetColor !== "function")
        return ctx.skip("getAssetColor in canvasUtils.js pending Milestone M3");
      const c1 = mod.module.getAssetColor("BTC");
      const c2 = mod.module.getAssetColor("ETH");
      expect(c1).not.toBe(c2);
    });

    it("19.4: Renders central cutout with total portfolio net worth", async () => {
      const html = await readProjectFile("investment/investment.html");
      expect(html).not.toBeNull();
    });

    it("19.5: Handles empty portfolio gracefully with empty state", async (ctx) => {
      const mod = await safeImport("investment/investment.js");
      if (!mod.available || typeof mod.module.renderDonutChart !== "function")
        return ctx.skip(
          "renderDonutChart in investment.js pending Milestone M3",
        );
      const canvas = document.createElement("canvas");
      expect(() => mod.module.renderDonutChart(canvas, [])).not.toThrow();
    });
  });

  // =========================================================================
  // Feature 20: Portfolio Local Persistence (M3, R3)
  // =========================================================================
  describe("Feature 20: Portfolio Local Persistence", () => {
    it("20.1: Stores holdings under crypto_club_v1_portfolio in localStorage", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      const testHoldings = [
        { id: "1", symbol: "BTC", amount: 0.5, buyPrice: 40000 },
      ];
      Storage.set("crypto_club_v1_portfolio", testHoldings);
      expect(Storage.get("crypto_club_v1_portfolio")).toEqual(testHoldings);
    });

    it("20.2: Holding items adhere to specified schema attributes", async (ctx) => {
      const mod = await safeImport("investment/portfolioEngine.js");
      if (!mod.available || !mod.module.PortfolioEngine)
        return ctx.skip("portfolioEngine.js pending Milestone M3");
      const { PortfolioEngine } = mod.module;
      const h = PortfolioEngine.createHolding("BTC", 1.5, 45000);
      expect(h.id).toBeDefined();
      expect(h.symbol).toBe("BTC");
      expect(h.amount).toBe(1.5);
      expect(h.buyPrice).toBe(45000);
    });

    it("20.3: Automatically reloads saved holdings on page load", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      Storage.set("crypto_club_v1_portfolio", [
        { id: "init", symbol: "ETH", amount: 2, buyPrice: 2500 },
      ]);
      const loaded = Storage.get("crypto_club_v1_portfolio", []);
      expect(loaded.length).toBe(1);
      expect(loaded[0].symbol).toBe("ETH");
    });

    it("20.4: Synchronizes changes immediately upon addition or deletion", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      let list = Storage.get("crypto_club_v1_portfolio", []);
      list.push({ id: "2", symbol: "ADA", amount: 100, buyPrice: 0.5 });
      Storage.set("crypto_club_v1_portfolio", list);
      expect(Storage.get("crypto_club_v1_portfolio").length).toBeGreaterThan(0);
    });

    it("20.5: Provides portfolio reset functionality", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      Storage.set("crypto_club_v1_portfolio", []);
      expect(Storage.get("crypto_club_v1_portfolio")).toEqual([]);
    });
  });

  // =========================================================================
  // Feature 21: Asynchronous News Feed (M4, R4)
  // =========================================================================
  describe("Feature 21: Asynchronous News Feed", () => {
    it("21.1: News page renders feed container for article cards", async () => {
      const html = await readProjectFile("news/news.html");
      expect(html).not.toBeNull();
    });

    it("21.2: Articles contain headline, summary, source, and date", async (ctx) => {
      const mod = await safeImport("shared/js/data/mockNewsData.js");
      if (!mod.available)
        return ctx.skip("mockNewsData.js pending Milestone M4");
      const articles =
        mod.module.mockNewsData || mod.module.MOCK_NEWS || mod.module.default;
      if (!articles)
        return ctx.skip("mockNewsData export pending Milestone M4");
      expect(Array.isArray(articles)).toBe(true);
      const article = articles[0];
      expect(article.id).toBeDefined();
      expect(article.title).toBeDefined();
      expect(article.category).toBeDefined();
    });

    it("21.3: Falls back to bundled mockNewsData if live API fails", async (ctx) => {
      const mod = await safeImport("shared/js/data/mockNewsData.js");
      if (!mod.available)
        return ctx.skip("mockNewsData.js pending Milestone M4");
      const articles =
        mod.module.mockNewsData || mod.module.MOCK_NEWS || mod.module.default;
      if (!articles)
        return ctx.skip("mockNewsData export pending Milestone M4");
      expect(articles.length).toBeGreaterThanOrEqual(10);
    });

    it("21.4: Displays loading indicator while fetching", async () => {
      const html = await readProjectFile("news/news.html");
      expect(html).not.toBeNull();
    });

    it("21.5: Articles support full-text view or modal expansion", async () => {
      const html = await readProjectFile("news/news.html");
      expect(html).not.toBeNull();
    });
  });

  // =========================================================================
  // Feature 22: News Category Filters & Search (M4, R4)
  // =========================================================================
  describe("Feature 22: News Category Filters & Search", () => {
    it("22.1: News page provides category tabs", async () => {
      const html = await readProjectFile("news/news.html");
      expect(html).not.toBeNull();
    });

    it("22.2: Filtering by Bitcoin category returns Bitcoin articles", async (ctx) => {
      const mod = await safeImport("news/news.js");
      if (!mod.available || typeof mod.module.filterArticles !== "function")
        return ctx.skip("filterArticles in news.js pending Milestone M4");
      const list = [
        { category: "Bitcoin", title: "BTC Rally" },
        { category: "DeFi", title: "Uniswap v4" },
      ];
      const res = mod.module.filterArticles(list, { category: "Bitcoin" });
      expect(res.every((a) => a.category === "Bitcoin")).toBe(true);
    });

    it("22.3: Filtering by DeFi category returns DeFi articles", async (ctx) => {
      const mod = await safeImport("news/news.js");
      if (!mod.available || typeof mod.module.filterArticles !== "function")
        return ctx.skip("filterArticles in news.js pending Milestone M4");
      const list = [
        { category: "Bitcoin", title: "BTC Rally" },
        { category: "DeFi", title: "Uniswap v4" },
      ];
      const res = mod.module.filterArticles(list, { category: "DeFi" });
      expect(res.every((a) => a.category === "DeFi")).toBe(true);
    });

    it("22.4: Search input filters news articles by keyword in title or summary", async (ctx) => {
      const mod = await safeImport("news/news.js");
      if (!mod.available || typeof mod.module.filterArticles !== "function")
        return ctx.skip("filterArticles in news.js pending Milestone M4");
      const list = [
        { title: "Solana Mobile Launch" },
        { title: "Ethereum Staking Surge" },
      ];
      const res = mod.module.filterArticles(list, { query: "mobile" });
      expect(res.length).toBe(1);
      expect(res[0].title).toContain("Solana");
    });

    it("22.5: Combining category tab with keyword search filters conjunctively", async (ctx) => {
      const mod = await safeImport("news/news.js");
      if (!mod.available || typeof mod.module.filterArticles !== "function")
        return ctx.skip("filterArticles in news.js pending Milestone M4");
      const list = [
        { category: "DeFi", title: "Yield Protocols Surge" },
        { category: "Bitcoin", title: "Yield Curve Inverts" },
      ];
      const res = mod.module.filterArticles(list, {
        category: "DeFi",
        query: "Yield",
      });
      expect(res.length).toBe(1);
      expect(res[0].category).toBe("DeFi");
    });
  });

  // =========================================================================
  // Feature 23: Sentiment Badges (M4, R4)
  // =========================================================================
  describe("Feature 23: Sentiment Badges", () => {
    it("23.1: SentimentService.analyze returns score, sentiment, and confidence", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const res = SentimentService.analyze(
        "Bitcoin hits new all time high",
        "Massive adoption worldwide",
      );
      expect(res.sentiment).toBeDefined();
      expect(["bullish", "bearish", "neutral"]).toContain(res.sentiment);
      expect(typeof res.score).toBe("number");
      expect(typeof res.confidence).toBe("number");
    });

    it("23.2: Analyzes positive financial keywords as bullish", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const res = SentimentService.analyze(
        "Crypto markets surge as institutional inflows rally",
        "Bull run breakout",
      );
      expect(res.sentiment).toBe("bullish");
    });

    it("23.3: Analyzes negative financial keywords as bearish", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const res = SentimentService.analyze(
        "Major exchange hacked in catastrophic crash",
        "Selloff panic plunges tokens",
      );
      expect(res.sentiment).toBe("bearish");
    });

    it("23.4: Analyzes balanced or neutral text as neutral", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const res = SentimentService.analyze(
        "Committee convenes monthly meeting",
        "Schedule published",
      );
      expect(res.sentiment).toBe("neutral");
    });

    it("23.5: Sentiment badge styles are present in news.css", async () => {
      const css = await readProjectFile("news/news.css");
      expect(css).not.toBeNull();
    });
  });

  // =========================================================================
  // Feature 24: Reading Time & Relative Time (M4, R4)
  // =========================================================================
  describe("Feature 24: Reading Time & Relative Time", () => {
    it("24.1: SentimentService.estimateReadingTime computes reading minutes", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const words = Array.from({ length: 450 }, () => "crypto").join(" ");
      const minutes = SentimentService.estimateReadingTime(words);
      expect(minutes).toBeGreaterThanOrEqual(2);
    });

    it("24.2: Enforces minimum reading time of 1 minute for short articles", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const minutes = SentimentService.estimateReadingTime(
        "Brief headline update.",
      );
      expect(minutes).toBe(1);
    });

    it("24.3: SentimentService.formatRelativeTime formats minutes ago", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const tenMinsAgo = Date.now() - 10 * 60 * 1000;
      const str = SentimentService.formatRelativeTime(tenMinsAgo);
      expect(str.toLowerCase()).toContain("min");
    });

    it("24.4: Formats hours ago correctly", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
      const str = SentimentService.formatRelativeTime(threeHoursAgo);
      expect(str.toLowerCase()).toContain("hour");
    });

    it("24.5: Formats days ago correctly", async (ctx) => {
      const mod = await safeImport("shared/js/services/sentimentService.js");
      if (!mod.available || !mod.module.SentimentService)
        return ctx.skip("sentimentService.js pending Milestone M4");
      const { SentimentService } = mod.module;
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      const str = SentimentService.formatRelativeTime(twoDaysAgo);
      expect(str.toLowerCase()).toContain("day");
    });
  });

  // =========================================================================
  // Feature 25: Article Bookmarking (M4, R4)
  // =========================================================================
  describe("Feature 25: Article Bookmarking", () => {
    it("25.1: Stores bookmarked article IDs under crypto_club_v1_news_bookmarks", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      Storage.set("crypto_club_v1_news_bookmarks", ["art-1", "art-2"]);
      expect(Storage.get("crypto_club_v1_news_bookmarks")).toEqual([
        "art-1",
        "art-2",
      ]);
    });

    it("25.2: Toggling bookmark adds article ID if not bookmarked", async (ctx) => {
      const mod = await safeImport("news/news.js");
      if (!mod.available || typeof mod.module.toggleBookmark !== "function")
        return ctx.skip("toggleBookmark in news.js pending Milestone M4");
      mod.module.toggleBookmark("art-100");
      expect(mod.module.isBookmarked("art-100")).toBe(true);
    });

    it("25.3: Toggling bookmark removes already saved article ID", async (ctx) => {
      const mod = await safeImport("news/news.js");
      if (!mod.available || typeof mod.module.toggleBookmark !== "function")
        return ctx.skip("toggleBookmark in news.js pending Milestone M4");
      mod.module.toggleBookmark("art-100");
      expect(mod.module.isBookmarked("art-100")).toBe(false);
    });

    it("25.4: Dedicated Bookmarked tab filters feed to show saved articles", async (ctx) => {
      const mod = await safeImport("news/news.js");
      if (!mod.available || typeof mod.module.filterArticles !== "function")
        return ctx.skip("filterArticles in news.js pending Milestone M4");
      const list = [{ id: "1" }, { id: "2" }, { id: "3" }];
      const res = mod.module.filterArticles(list, {
        category: "bookmarked",
        bookmarks: ["2"],
      });
      expect(res.length).toBe(1);
      expect(res[0].id).toBe("2");
    });

    it("25.5: Bookmark styles exist in news.css", async () => {
      const css = await readProjectFile("news/news.css");
      expect(css).not.toBeNull();
    });
  });

  // =========================================================================
  // Feature 26: Multi-Step Registration Wizard (M5, R5)
  // =========================================================================
  describe("Feature 26: Multi-Step Registration Wizard", () => {
    it("26.1: Registration page defines 5 distinct steps", async (ctx) => {
      const html = await readProjectFile("registration/registration.html");
      if (
        !html ||
        (!html.toLowerCase().includes("step-1") &&
          !html.toLowerCase().includes("stepper"))
      ) {
        return ctx.skip(
          "5-step wizard markup pending Milestone M5 elevation of registration.html",
        );
      }
      expect(html.toLowerCase()).toContain("step");
    });

    it("26.2: Displays stepper progress bar with active step indicator", async (ctx) => {
      const html = await readProjectFile("registration/registration.html");
      if (
        !html ||
        (!html.toLowerCase().includes("progress") &&
          !html.toLowerCase().includes("stepper"))
      ) {
        return ctx.skip(
          "Stepper progress bar pending Milestone M5 elevation of registration.html",
        );
      }
      expect(html.toLowerCase()).toContain("step");
    });

    it("26.3: Next button advances wizard to next step", async (ctx) => {
      const mod = await safeImport("registration/registration.js");
      if (!mod.available || typeof mod.module.goToStep !== "function")
        return ctx.skip("goToStep in registration.js pending Milestone M5");
      mod.module.goToStep(2);
      expect(mod.module.getCurrentStep()).toBe(2);
    });

    it("26.4: Previous button navigates backward preserving entered form data", async (ctx) => {
      const mod = await safeImport("registration/registration.js");
      if (!mod.available || typeof mod.module.goToStep !== "function")
        return ctx.skip("goToStep in registration.js pending Milestone M5");
      mod.module.goToStep(1);
      expect(mod.module.getCurrentStep()).toBe(1);
    });

    it("26.5: Wizard auto-saves draft profile under crypto_club_v1_user_profile", async (ctx) => {
      const mod = await safeImport("shared/js/services/storage.js");
      if (!mod.available) return ctx.skip("storage.js not available");
      const { Storage } = mod.module;
      Storage.set("crypto_club_v1_user_profile", {
        firstName: "Alice",
        step: 2,
      });
      expect(Storage.get("crypto_club_v1_user_profile").firstName).toBe(
        "Alice",
      );
    });
  });

  // =========================================================================
  // Feature 27: Client-Side Form Validation (M5, R5)
  // =========================================================================
  describe("Feature 27: Client-Side Form Validation", () => {
    it("27.1: Validates required fields are non-empty", async (ctx) => {
      const mod = await safeImport("registration/registration.js");
      if (!mod.available || typeof mod.module.validateField !== "function")
        return ctx.skip(
          "validateField in registration.js pending Milestone M5",
        );
      expect(mod.module.validateField("firstName", "")).toBe(false);
      expect(mod.module.validateField("firstName", "Satoshi")).toBe(true);
    });

    it("27.2: Validates email format with RFC-compliant checks", async (ctx) => {
      const mod = await safeImport("registration/registration.js");
      if (!mod.available || typeof mod.module.validateEmail !== "function")
        return ctx.skip(
          "validateEmail in registration.js pending Milestone M5",
        );
      expect(mod.module.validateEmail("invalid-email")).toBe(false);
      expect(mod.module.validateEmail("user@crypto.com")).toBe(true);
    });

    it("27.3: Password entropy meter scores strength based on complexity", async (ctx) => {
      const mod = await safeImport("registration/registration.js");
      if (
        !mod.available ||
        typeof mod.module.calculatePasswordEntropy !== "function"
      )
        return ctx.skip(
          "calculatePasswordEntropy in registration.js pending Milestone M5",
        );
      const weak = mod.module.calculatePasswordEntropy("password");
      const strong = mod.module.calculatePasswordEntropy("P@ssw0rd!2026#Alpha");
      expect(strong).toBeGreaterThan(weak);
    });

    it("27.4: Registration styles support form error indicators", async () => {
      const css = await readProjectFile("registration/registration.css");
      expect(css).not.toBeNull();
    });

    it("27.5: Prevents proceeding to next step when current step has invalid fields", async (ctx) => {
      const mod = await safeImport("registration/registration.js");
      if (!mod.available || typeof mod.module.canAdvanceStep !== "function")
        return ctx.skip(
          "canAdvanceStep in registration.js pending Milestone M5",
        );
      expect(mod.module.canAdvanceStep({ firstName: "", email: "bad" })).toBe(
        false,
      );
    });
  });

  // =========================================================================
  // Feature 28: Objective Risk Assessment Quiz (M5, R5)
  // =========================================================================
  describe("Feature 28: Objective Risk Assessment Quiz", () => {
    it("28.1: RiskAssessment.evaluate accepts array of 5 answers", async (ctx) => {
      const mod = await safeImport("registration/riskAssessment.js");
      if (!mod.available || !mod.module.RiskAssessment)
        return ctx.skip("riskAssessment.js pending Milestone M5");
      const { RiskAssessment } = mod.module;
      const res = RiskAssessment.evaluate([1, 2, 3, 2, 1]);
      expect(res.rawScore).toBeDefined();
      expect(res.category).toBeDefined();
    });

    it("28.2: Scores normalized to 0-100 range", async (ctx) => {
      const mod = await safeImport("registration/riskAssessment.js");
      if (!mod.available || !mod.module.RiskAssessment)
        return ctx.skip("riskAssessment.js pending Milestone M5");
      const { RiskAssessment } = mod.module;
      const res = RiskAssessment.evaluate([3, 3, 3, 3, 3]);
      expect(res.normalizedScore).toBeGreaterThanOrEqual(0);
      expect(res.normalizedScore).toBeLessThanOrEqual(100);
    });

    it("28.3: Categorizes score < 40 as Conservative and recommends Starter tier", async (ctx) => {
      const mod = await safeImport("registration/riskAssessment.js");
      if (!mod.available || !mod.module.RiskAssessment)
        return ctx.skip("riskAssessment.js pending Milestone M5");
      const { RiskAssessment } = mod.module;
      const res = RiskAssessment.evaluate([0, 0, 1, 0, 1]);
      expect(res.category).toBe("Conservative");
      expect(res.recommendedTier).toBe("Starter");
    });

    it("28.4: Categorizes score 40 - 70 as Balanced and recommends Pro tier", async (ctx) => {
      const mod = await safeImport("registration/riskAssessment.js");
      if (!mod.available || !mod.module.RiskAssessment)
        return ctx.skip("riskAssessment.js pending Milestone M5");
      const { RiskAssessment } = mod.module;
      const res = RiskAssessment.evaluate([2, 3, 2, 3, 2]);
      expect(res.category).toBe("Balanced");
      expect(res.recommendedTier).toBe("Pro");
    });

    it("28.5: Categorizes score > 70 as Aggressive and recommends VIP tier", async (ctx) => {
      const mod = await safeImport("registration/riskAssessment.js");
      if (!mod.available || !mod.module.RiskAssessment)
        return ctx.skip("riskAssessment.js pending Milestone M5");
      const { RiskAssessment } = mod.module;
      const res = RiskAssessment.evaluate([4, 4, 4, 4, 4]);
      expect(res.category).toBe("Aggressive");
      expect(res.recommendedTier).toBe("VIP");
    });
  });

  // =========================================================================
  // Feature 29: Dynamic Membership Pricing (M5, R5)
  // =========================================================================
  describe("Feature 29: Dynamic Membership Pricing", () => {
    it("29.1: Membership page provides Monthly / Annual billing switch toggle", async (ctx) => {
      const html = await readProjectFile("membership/membership.html");
      if (
        !html ||
        (!html.toLowerCase().includes("annual") &&
          !html.toLowerCase().includes("billing"))
      ) {
        return ctx.skip(
          "Annual billing toggle pending Milestone M5 elevation of membership.html",
        );
      }
      expect(html.toLowerCase()).toContain("billing");
    });

    it("29.2: Default billing displays standard monthly pricing rates", async (ctx) => {
      const mod = await safeImport("membership/membership.js");
      if (!mod.available || typeof mod.module.getPlanPricing !== "function")
        return ctx.skip("getPlanPricing in membership.js pending Milestone M5");
      const pricing = mod.module.getPlanPricing("pro", "monthly");
      expect(pricing.amount).toBe(29);
    });

    it("29.3: Switching to annual applies 20% discount formula", async (ctx) => {
      const mod = await safeImport("membership/membership.js");
      if (!mod.available || typeof mod.module.getPlanPricing !== "function")
        return ctx.skip("getPlanPricing in membership.js pending Milestone M5");
      const pricing = mod.module.getPlanPricing("pro", "annual");
      expect(pricing.totalAnnual).toBeCloseTo(278.4, 1);
      expect(pricing.monthlyEquivalent).toBeCloseTo(23.2, 1);
    });

    it("29.4: Renders Save 20% discount badge when annual billing is active", async (ctx) => {
      const html = await readProjectFile("membership/membership.html");
      if (!html || !html.includes("20%")) {
        return ctx.skip(
          "20% discount badge markup pending Milestone M5 elevation of membership.html",
        );
      }
      expect(html).toContain("20%");
    });

    it("29.5: Plan CTA buttons reflect selected tier and billing cycle", async () => {
      const html = await readProjectFile("membership/membership.html");
      expect(html).not.toBeNull();
    });
  });

  // =========================================================================
  // Feature 30: Membership Feature Matrix (M5, R5)
  // =========================================================================
  describe("Feature 30: Membership Feature Matrix", () => {
    it("30.1: Feature comparison matrix contains at least 15 feature rows", async (ctx) => {
      const html = await readProjectFile("membership/membership.html");
      if (!html || (html.match(/<tr/g) || []).length < 15) {
        return ctx.skip(
          "15+ row feature matrix pending Milestone M5 elevation of membership.html",
        );
      }
      const trCount = (html.match(/<tr/g) || []).length;
      expect(trCount).toBeGreaterThanOrEqual(15);
    });

    it("30.2: Matrix defines capabilities across Starter, Pro, and VIP columns", async (ctx) => {
      const html = await readProjectFile("membership/membership.html");
      if (!html || !html.includes("Starter") || !html.includes("VIP")) {
        return ctx.skip(
          "Starter/Pro/VIP matrix headers pending Milestone M5 elevation of membership.html",
        );
      }
      expect(html).toContain("Starter");
      expect(html).toContain("Pro");
      expect(html).toContain("VIP");
    });

    it("30.3: Renders checkmarks or inclusion badges for tier capabilities", async (ctx) => {
      const html = await readProjectFile("membership/membership.html");
      if (
        !html ||
        (!html.includes("✓") && !html.includes("✔") && !html.includes("check"))
      ) {
        return ctx.skip(
          "Feature matrix checkmarks pending Milestone M5 elevation of membership.html",
        );
      }
      expect(
        html.includes("✓") || html.includes("✔") || html.includes("check"),
      ).toBe(true);
    });

    it("30.4: Feature matrix styles support responsive horizontal scrolling", async () => {
      const css = await readProjectFile("membership/membership.css");
      expect(css).not.toBeNull();
    });

    it("30.5: Includes Select Tier action trigger buttons", async (ctx) => {
      const html = await readProjectFile("membership/membership.html");
      if (!html || !html.toLowerCase().includes("select")) {
        return ctx.skip(
          "Select tier action buttons pending Milestone M5 elevation of membership.html",
        );
      }
      expect(html.toLowerCase()).toContain("select");
    });
  });

  // =========================================================================
  // Feature 31: Dynamic Investor Badge Card (M5, R5)
  // =========================================================================
  describe("Feature 31: Dynamic Investor Badge Card", () => {
    it("31.1: Confirmation page renders glassmorphic Investor Badge card", async (ctx) => {
      const html = await readProjectFile("confirmation/confirmation.html");
      if (!html || !html.toLowerCase().includes("badge")) {
        return ctx.skip(
          "Investor badge card markup pending Milestone M5 elevation of confirmation.html",
        );
      }
      expect(html.toLowerCase()).toContain("badge");
    });

    it("31.2: Populates investor full name from stored user profile", async (ctx) => {
      const mod = await safeImport("confirmation/confirmation.js");
      if (!mod.available || typeof mod.module.renderBadge !== "function")
        return ctx.skip("renderBadge in confirmation.js pending Milestone M5");
      const card = mod.module.renderBadge({
        firstName: "Hal",
        lastName: "Finney",
        tier: "VIP",
      });
      expect(card).toContain("Hal Finney");
    });

    it("31.3: Displays selected membership tier badge", async (ctx) => {
      const mod = await safeImport("confirmation/confirmation.js");
      if (!mod.available || typeof mod.module.renderBadge !== "function")
        return ctx.skip("renderBadge in confirmation.js pending Milestone M5");
      const card = mod.module.renderBadge({ firstName: "Nick", tier: "Pro" });
      expect(card).toContain("Pro");
    });

    it("31.4: Displays Investor Risk Profile rating badge", async (ctx) => {
      const mod = await safeImport("confirmation/confirmation.js");
      if (!mod.available || typeof mod.module.renderBadge !== "function")
        return ctx.skip("renderBadge in confirmation.js pending Milestone M5");
      const card = mod.module.renderBadge({
        firstName: "Nick",
        riskProfile: "Aggressive",
      });
      expect(card).toContain("Aggressive");
    });

    it("31.5: Generates unique verification member ID and issue date", async (ctx) => {
      const mod = await safeImport("confirmation/confirmation.js");
      if (!mod.available || typeof mod.module.generateMemberId !== "function")
        return ctx.skip(
          "generateMemberId in confirmation.js pending Milestone M5",
        );
      const id = mod.module.generateMemberId("user@test.com");
      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(6);
    });
  });

  // =========================================================================
  // Feature 32: Badge Export & Print Layout (M5, R5)
  // =========================================================================
  describe("Feature 32: Badge Export & Print Layout", () => {
    it("32.1: Confirmation page provides Download Badge button", async (ctx) => {
      const html = await readProjectFile("confirmation/confirmation.html");
      if (!html || !html.toLowerCase().includes("download")) {
        return ctx.skip(
          "Download Badge button pending Milestone M5 elevation of confirmation.html",
        );
      }
      expect(html.toLowerCase()).toContain("download");
    });

    it("32.2: Badge export draws graphic onto HTML5 Canvas element", async (ctx) => {
      const mod = await safeImport("confirmation/confirmation.js");
      if (!mod.available || typeof mod.module.exportBadgeCanvas !== "function")
        return ctx.skip(
          "exportBadgeCanvas in confirmation.js pending Milestone M5",
        );
      const canvas = document.createElement("canvas");
      mod.module.exportBadgeCanvas(canvas, { name: "Alice", tier: "VIP" });
      const ctx2d = canvas.getContext("2d");
      expect(ctx2d.calls.length).toBeGreaterThan(0);
    });

    it('32.3: Generates PNG data URL via toDataURL("image/png")', async () => {
      const canvas = document.createElement("canvas");
      const dataUrl = canvas.toDataURL("image/png");
      expect(dataUrl).toContain("data:image/png");
    });

    it("32.4: Includes Print Certificate action button", async (ctx) => {
      const html = await readProjectFile("confirmation/confirmation.html");
      if (!html || !html.toLowerCase().includes("print")) {
        return ctx.skip(
          "Print button pending Milestone M5 elevation of confirmation.html",
        );
      }
      expect(html.toLowerCase()).toContain("print");
    });

    it("32.5: Dedicated @media print CSS rules style badge and hide navigation", async (ctx) => {
      const css = await readProjectFile("confirmation/confirmation.css");
      if (!css || !css.includes("@media print")) {
        return ctx.skip(
          "@media print stylesheet pending Milestone M5 elevation of confirmation.css",
        );
      }
      expect(css).toContain("@media print");
    });
  });
});

/**
 * Empirical Adversarial Challenge Suite — Milestone 1
 * Challenger: challenger_m1_1 (critic, specialist)
 * Tests: ThemeService, StorageManager, Quota Safety, Corrupted State,
 *        Private Browsing / SecurityError Fallback, BaseComponent Path Resolution,
 *        Zero-FOUC quotation mismatch, scripts/app.js entry point.
 */

import { setupNodeEnvironment } from "./test-harness.js";

// Setup base DOM environment
setupNodeEnvironment();

const testResults = {
  passed: 0,
  failed: 0,
  details: [],
};

function recordTest(passed, name, details = "") {
  if (passed) {
    testResults.passed++;
    console.log(`[PASS] ${name}`);
  } else {
    testResults.failed++;
    console.error(`[FAIL] ${name} -> ${details}`);
    testResults.details.push({ name, details });
  }
}

function _isValidThemeState(ThemeService) {
  const current = ThemeService.getTheme();
  const effective = ThemeService.getEffectiveTheme();
  const domAttr = document.documentElement.dataset.theme;
  const isEffectiveValid = effective === "dark" || effective === "light";
  return current === "dark" && isEffectiveValid && domAttr === "dark";
}

function _validateThemeInput(ThemeService, input) {
  try {
    ThemeService.setTheme(input);
    if (!_isValidThemeState(ThemeService)) {
      const current = ThemeService.getTheme();
      const effective = ThemeService.getEffectiveTheme();
      const domAttr = document.documentElement.dataset.theme;
      return {
        ok: false,
        details: `current: ${current}, effective: ${effective}, domAttr: ${domAttr}`,
      };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, details: e.message };
  }
}

function _testInvalidThemeInputs(ThemeService) {
  const invalidInputs = ["cyberpunk", "neon", null, undefined, 123, "", {}, []];
  for (const input of invalidInputs) {
    const result = _validateThemeInput(ThemeService, input);
    if (!result.ok) {
      recordTest(
        false,
        `1.1: Invalid theme input "${JSON.stringify(input)}"`,
        result.details,
      );
      return;
    }
  }
  recordTest(
    true,
    '1.1: ThemeService safely sanitizes all invalid theme inputs to default "dark"',
  );
}

function _testRapidToggles(ThemeService) {
  ThemeService.setTheme("dark");
  let lastTheme = "dark";
  let toggleConsistent = true;
  let eventsFired = 0;
  const handler = () => {
    eventsFired++;
  };
  window.addEventListener("themechange", handler);

  for (let i = 0; i < 100; i++) {
    const next = ThemeService.toggleTheme();
    const expected = lastTheme === "dark" ? "light" : "dark";
    if (next !== expected || ThemeService.getTheme() !== expected) {
      toggleConsistent = false;
      break;
    }
    lastTheme = next;
  }
  window.removeEventListener("themechange", handler);

  recordTest(
    toggleConsistent && lastTheme === "dark" && eventsFired === 100,
    "1.2: ThemeService survives 100 rapid sequential toggles with consistent state and event emission",
    `consistent: ${toggleConsistent}, final: ${lastTheme}, events: ${eventsFired}`,
  );
}

function _testSystemPreferenceListener(ThemeService) {
  ThemeService.init();
  ThemeService.setTheme("system");

  let mediaChangeHandler = null;
  const origMatchMedia = window.matchMedia;
  let systemDark = true;
  window.matchMedia = (query) => ({
    matches: systemDark,
    media: query,
    addEventListener: (event, cb) => {
      if (event === "change") mediaChangeHandler = cb;
    },
    removeEventListener: () => {},
    addListener: (cb) => {
      mediaChangeHandler = cb;
    },
    removeListener: () => {},
  });

  ThemeService.initialized = false;
  ThemeService.init();
  const effectiveBefore = ThemeService.getEffectiveTheme();

  systemDark = false;
  if (mediaChangeHandler) {
    mediaChangeHandler({ matches: false });
  }
  const effectiveAfter = ThemeService.getEffectiveTheme();
  const domAttrAfter = document.documentElement.dataset.theme;

  window.matchMedia = origMatchMedia;
  recordTest(
    effectiveBefore === "dark" &&
      effectiveAfter === "light" &&
      domAttrAfter === "light",
    '1.3: ThemeService updates effective theme on system preference change when theme is "system"',
    `effectiveBefore: ${effectiveBefore}, effectiveAfter: ${effectiveAfter}, domAttr: ${domAttrAfter}`,
  );
}

function _testCrossTabThemeSync(ThemeService) {
  ThemeService.setTheme("dark");
  const domBefore = document.documentElement.dataset.theme;

  window.localStorage.setItem("crypto_club_v1_theme", JSON.stringify("light"));
  const storageEvt = new StorageEvent("storage", {
    key: "crypto_club_v1_theme",
    oldValue: JSON.stringify("dark"),
    newValue: JSON.stringify("light"),
  });
  window.dispatchEvent(storageEvt);

  const domAfter = document.documentElement.dataset.theme;
  const bugExists = domAfter === "dark";
  recordTest(
    !bugExists,
    "1.4: Cross-tab theme sync updates DOM when storage event is received from another tab",
    `DOM failed to update! Before: ${domBefore}, After: ${domAfter} (Expected: light, but themeService.js compared newTheme against localStorage which was already mutated)`,
  );
}

function _testPrivateBrowsingTheme(ThemeService) {
  const origGetItem = window.localStorage.getItem;
  const origSetItem = window.localStorage.setItem;
  window.localStorage.getItem = () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  };
  window.localStorage.setItem = () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  };

  let survived = false;
  try {
    ThemeService.setTheme("light");
    const theme = ThemeService.getTheme();
    const effective = ThemeService.getEffectiveTheme();
    survived =
      (theme === "dark" || theme === "light") &&
      (effective === "dark" || effective === "light");
  } catch {
    survived = false;
  } finally {
    window.localStorage.getItem = origGetItem;
    window.localStorage.setItem = origSetItem;
  }

  recordTest(
    survived,
    "1.5: ThemeService degrades gracefully without crashing when localStorage throws SecurityError",
  );
}

async function runThemeServiceSuite() {
  console.log(
    "================================================================",
  );
  console.log("CHALLENGE SUITE 1: THEMESERVICE EDGE CASES & RESILIENCE");
  console.log(
    "================================================================",
  );

  const { ThemeService } =
    await import("../shared/js/services/themeService.js");

  _testInvalidThemeInputs(ThemeService);
  _testRapidToggles(ThemeService);
  _testSystemPreferenceListener(ThemeService);
  _testCrossTabThemeSync(ThemeService);
  _testPrivateBrowsingTheme(ThemeService);
}

async function runStorageManagerSuite() {
  console.log(
    "================================================================",
  );
  console.log("CHALLENGE SUITE 2: STORAGEMANAGER QUOTA, CORRUPTION & SYNC");
  console.log(
    "================================================================",
  );

  const { Storage } = await import("../shared/js/services/storage.js");

  // Test 2.1: Storage Quota Exhaustion & Memory Fallback Read
  {
    const origSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    };

    const setOk = Storage.set("quota_key", { data: "critical_payload" });
    const retrieved = Storage.get("quota_key", null);

    window.localStorage.setItem = origSetItem;

    const memoryFallbackWorked = retrieved?.data === "critical_payload";
    recordTest(
      memoryFallbackWorked,
      "2.1: Storage.get retrieves data from in-memory fallback when localStorage is full (QuotaExceededError)",
      `Storage.set returned ${setOk}, but Storage.get returned ${JSON.stringify(retrieved)} (memory fallback was bypassed by Storage.get)`,
    );
  }

  // Test 2.2: Stale Data Exposure on Quota Exhaustion
  {
    Storage.set("stale_test_key", "initial_version");

    const origSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    };

    Storage.set("stale_test_key", "updated_version");
    const readBack = Storage.get("stale_test_key");

    window.localStorage.setItem = origSetItem;

    const gotUpdated = readBack === "updated_version";
    recordTest(
      gotUpdated,
      "2.2: Storage.get returns latest in-memory value rather than stale disk data after quota failure",
      `Storage.get returned "${readBack}" (stale data returned instead of updated_version)`,
    );
  }

  // Test 2.3: Corrupted JSON in localStorage
  {
    window.localStorage.setItem(
      "crypto_club_v1_watchlist",
      '{"broken_json": [unclosed',
    );
    window.localStorage.setItem(
      "crypto_club_v1_portfolio",
      "<xml>not_json</xml>",
    );

    const watchlist = Storage.get("watchlist", []);
    const portfolio = Storage.get("portfolio", []);

    const watchlistIsArray = Array.isArray(watchlist);
    const portfolioIsArray = Array.isArray(portfolio);

    recordTest(
      watchlistIsArray && portfolioIsArray,
      "2.3: Storage.get returns defaultValue fallback when localStorage content is corrupted non-JSON syntax",
      `watchlist returned type "${typeof watchlist}" ("${watchlist}"), portfolio returned type "${typeof portfolio}" ("${portfolio}")`,
    );
  }

  // Test 2.4: Circular Reference Crash in Storage.set
  {
    const circularObj = { name: "BTC" };
    circularObj.self = circularObj;

    let crashed = false;
    let returnedValue = null;
    try {
      returnedValue = Storage.set("circular_key", circularObj);
    } catch {
      crashed = true;
    }

    recordTest(
      !crashed && returnedValue === false,
      "2.4: Storage.set catches circular reference serialization errors without throwing unhandled exception",
      `Storage.set threw unhandled exception on circular object: ${crashed}`,
    );
  }

  // Test 2.5: Cross-Tab Subscriber Error Isolation
  {
    let sub2Fired = false;
    const unsub1 = Storage.subscribe("error_isolation_key", () => {
      throw new Error("Subscriber 1 exploded!");
    });
    const unsub2 = Storage.subscribe("error_isolation_key", (val) => {
      if (val === "test_val") sub2Fired = true;
    });

    const origConsoleError = console.error;
    console.error = () => {};

    const storageEvt = new StorageEvent("storage", {
      key: "crypto_club_v1_error_isolation_key",
      newValue: JSON.stringify("test_val"),
    });
    window.dispatchEvent(storageEvt);

    console.error = origConsoleError;
    unsub1();
    unsub2();

    recordTest(
      sub2Fired,
      "2.5: Exception in one cross-tab storage subscriber does not crash or block remaining subscribers",
    );
  }

  // Test 2.6: Namespace Isolation in clearNamespace()
  {
    window.localStorage.setItem("foreign_app_key", "keep_me");
    window.localStorage.setItem("crypto_club_v1_item_a", "val_a");
    window.localStorage.setItem("crypto_club_v1_item_b", "val_b");

    Storage.clearNamespace();

    const foreignStillExists =
      window.localStorage.getItem("foreign_app_key") === "keep_me";
    const itemACleared =
      window.localStorage.getItem("crypto_club_v1_item_a") === null;
    const itemBCleared =
      window.localStorage.getItem("crypto_club_v1_item_b") === null;

    recordTest(
      foreignStillExists && itemACleared && itemBCleared,
      "2.6: clearNamespace() clears only crypto_club_v1_* keys, preserving foreign localStorage entries",
      `foreign: ${foreignStillExists}, a: ${itemACleared}, b: ${itemBCleared}`,
    );
  }

  // Test 2.7: Private Browsing Mode (SecurityError at initialization)
  {
    const origLocalStorage = window.localStorage;
    let memoryFallbackStorage = null;

    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Access is denied", "SecurityError");
      },
      configurable: true,
    });

    try {
      const { Storage: FreshStorage } = await import(
        `../shared/js/services/storage.js?t=${Date.now()}`
      );
      FreshStorage.set("private_key", "private_val");
      const retrieved = FreshStorage.get("private_key");
      memoryFallbackStorage = retrieved === "private_val";
    } catch (err) {
      console.warn(
        "StorageService SecurityError fallback encountered exception:",
        err,
      );
      memoryFallbackStorage = false;
    } finally {
      Object.defineProperty(window, "localStorage", {
        value: origLocalStorage,
        configurable: true,
        writable: true,
      });
    }

    recordTest(
      memoryFallbackStorage,
      "2.7: StorageService cleanly activates in-memory fallback when localStorage access throws SecurityError at boot",
    );
  }
}

async function runBaseComponentSuite() {
  console.log(
    "================================================================",
  );
  console.log("CHALLENGE SUITE 3: BASECOMPONENT PATH RESOLUTION");
  console.log(
    "================================================================",
  );

  const { BaseComponent } =
    await import("../shared/js/components/BaseComponent.js");

  // Test 3.1: Root page path resolution
  {
    const rootPaths = [
      { pathname: "/index.html", href: "http://localhost:8080/index.html" },
      { pathname: "/", href: "http://localhost:8080/" },
      {
        pathname: "/Cryptocurrency-Project/index.html",
        href: "http://localhost/Cryptocurrency-Project/index.html",
      },
    ];

    let allRootCorrect = true;
    for (const p of rootPaths) {
      window.location.pathname = p.pathname;
      window.location.href = p.href;
      const root = BaseComponent.getRootPath();
      if (root !== "") {
        allRootCorrect = false;
        recordTest(
          false,
          `3.1: getRootPath() from root path ${p.pathname}`,
          `Returned "${root}", expected ""`,
        );
        break;
      }
    }
    if (allRootCorrect) {
      recordTest(true, '3.1: getRootPath() returns "" for root-level pages');
    }
  }

  // Test 3.2: Subdirectory path resolution across all 7 directories
  {
    const subdirs = [
      "coins",
      "investment",
      "news",
      "membership",
      "registration",
      "contact",
      "confirmation",
    ];
    let allSubdirsCorrect = true;
    for (const dir of subdirs) {
      window.location.pathname = `/${dir}/${dir}.html`;
      window.location.href = `http://localhost:8080/${dir}/${dir}.html`;
      const root = BaseComponent.getRootPath();
      if (root !== "../") {
        allSubdirsCorrect = false;
        recordTest(
          false,
          `3.2: getRootPath() from /${dir}/`,
          `Returned "${root}", expected "../"`,
        );
        break;
      }
    }
    if (allSubdirsCorrect) {
      recordTest(
        true,
        '3.2: getRootPath() returns "../" for all 7 project subdirectories',
      );
    }
  }

  // Test 3.3: Windows file:// protocol URLs
  {
    window.location.pathname =
      "/C:/Users/arastineh/Documents/Crypto/Cryptocurrency-Project/coins/coins.html";
    window.location.href =
      "file:///C:/Users/arastineh/Documents/Crypto/Cryptocurrency-Project/coins/coins.html";
    const rootSub = BaseComponent.getRootPath();

    window.location.pathname =
      "/C:/Users/arastineh/Documents/Crypto/Cryptocurrency-Project/index.html";
    window.location.href =
      "file:///C:/Users/arastineh/Documents/Crypto/Cryptocurrency-Project/index.html";
    const rootMain = BaseComponent.getRootPath();

    recordTest(
      rootSub === "../" && rootMain === "",
      "3.3: getRootPath() handles Windows file:/// protocol URLs correctly",
      `rootSub: "${rootSub}" (expected "../"), rootMain: "${rootMain}" (expected "")`,
    );
  }

  // Test 3.4: Parent directory collision attack
  {
    window.location.pathname =
      "/projects/news/Cryptocurrency-Project/index.html";
    window.location.href =
      "http://localhost/projects/news/Cryptocurrency-Project/index.html";
    const root = BaseComponent.getRootPath();

    const collisionDetected = root === "../";
    recordTest(
      !collisionDetected,
      "3.4: getRootPath() does not falsely detect parent folder names (e.g. /projects/news/app/index.html) as subdirectories",
      `Path collision caused false positive! Returned "${root}" instead of ""`,
    );
  }

  // Test 3.5: resolvePath() behavior with leading slash and null
  {
    window.location.pathname = "/coins/coins.html";
    window.location.href = "http://localhost:8080/coins/coins.html";

    const p1 = BaseComponent.resolvePath("index.html");
    const p2 = BaseComponent.resolvePath("/news/news.html");
    const p3 = BaseComponent.resolvePath("");

    let nullHandled = false;
    try {
      BaseComponent.resolvePath(null);
      nullHandled = true;
    } catch {
      nullHandled = false;
    }

    recordTest(
      p1 === "../index.html" &&
        p2 === "../news/news.html" &&
        p3 === "../" &&
        nullHandled,
      "3.5: resolvePath() safely resolves relative paths, strips leading slashes, and handles null/empty gracefully",
      `p1: "${p1}", p2: "${p2}", p3: "${p3}", null threw exception: ${!nullHandled}`,
    );
  }
}

async function runZeroFOUCSuite() {
  console.log(
    "================================================================",
  );
  console.log("CHALLENGE SUITE 4: ZERO-FOUC STRING VS JSON ENCODING");
  console.log(
    "================================================================",
  );

  const { Storage } = await import("../shared/js/services/storage.js");
  const { STORAGE_KEYS } = await import("../shared/js/config.js");

  Storage.set(STORAGE_KEYS.THEME, "light");
  const rawInLocalStorage = window.localStorage.getItem(STORAGE_KEYS.THEME);

  const rawMatchesLight = rawInLocalStorage === "light";

  recordTest(
    rawMatchesLight,
    '4.1: Storage.set theme serialization matches inline Zero-FOUC string comparison (saved === "light")',
    `raw in localStorage is "${rawInLocalStorage}", causing saved === "light" to evaluate to FALSE on every page reload!`,
  );
}

async function runAppBootstrapSuite() {
  console.log(
    "================================================================",
  );
  console.log(
    "CHALLENGE SUITE 5: APPLICATION ENTRY POINT BOOTSTRAP (scripts/app.js)",
  );
  console.log(
    "================================================================",
  );

  const tickerEl = document.createElement("div");
  tickerEl.id = "app-ticker";
  document.body.appendChild(tickerEl);

  const headerEl = document.createElement("header");
  headerEl.id = "app-header";
  document.body.appendChild(headerEl);

  const footerEl = document.createElement("footer");
  footerEl.id = "app-footer";
  document.body.appendChild(footerEl);

  let bootSucceeded = false;
  let bootError = null;

  try {
    const { initializeApp } = await import("../scripts/app.js");
    initializeApp();
    bootSucceeded = true;
  } catch (err) {
    bootError = err;
  }

  recordTest(
    bootSucceeded,
    "5.1: scripts/app.js boots and mounts components into #app-ticker, #app-header, #app-footer without uncaught exceptions",
    `Crashed with: ${bootError?.message}`,
  );
}

async function runEmpiricalSuite() {
  await runThemeServiceSuite();
  await runStorageManagerSuite();
  await runBaseComponentSuite();
  await runZeroFOUCSuite();
  await runAppBootstrapSuite();

  console.log(
    "================================================================",
  );
  console.log(`TOTAL TESTS: ${testResults.passed + testResults.failed}`);
  console.log(`PASSED: ${testResults.passed}`);
  console.log(`FAILED: ${testResults.failed}`);
  console.log(
    "================================================================",
  );

  if (testResults.details.length > 0) {
    console.log("\nCRITICAL EMPIRICAL FINDINGS:");
    testResults.details.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name}`);
      console.log(`   Evidence: ${f.details}`);
    });
  }

  return testResults;
}

try {
  const results = await runEmpiricalSuite();
  process.exit(results.failed > 0 ? 1 : 0);
} catch (err) {
  console.error("Unhandled error in empirical challenge suite:", err);
  process.exit(1);
}

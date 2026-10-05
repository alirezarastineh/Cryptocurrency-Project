/**
 * Adversarial Stress & Resilience Challenge Suite for Milestone 1
 * Cryptocurrency Club FinTech Portal
 */

import fs from "node:fs";
import path from "node:path";
import { setupNodeEnvironment } from "./test-harness.js";

// Initialize Headless DOM Shim
setupNodeEnvironment();

const results = {
  passed: 0,
  failed: 0,
  findings: [],
};

function assert(condition, message, findingDetails = null) {
  if (condition) {
    results.passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    results.failed++;
    console.error(`  [FAIL] ${message}`);
    results.findings.push({
      test: message,
      details: findingDetails || "Assertion failed",
    });
  }
}

async function _challengeDomContainers() {
  console.log("====================================================");
  console.log("CHALLENGE SECTION 1: DOM MOUNT CONTAINERS ACROSS 8 HTML FILES");
  console.log("====================================================");

  const htmlFiles = [
    "index.html",
    "coins/coins.html",
    "investment/investment.html",
    "news/news.html",
    "membership/membership.html",
    "registration/registration.html",
    "contact/contact.html",
    "confirmation/confirmation.html",
  ];

  for (const relPath of htmlFiles) {
    const fullPath = path.resolve(relPath);
    const content = fs.readFileSync(fullPath, "utf8");

    const hasTicker = content.includes('id="app-ticker"');
    const hasHeader = content.includes('id="app-header"');
    const hasFooter = content.includes('id="app-footer"');
    const hasAppScript = content.includes("scripts/app.js");
    const hasZeroFouc =
      content.includes("crypto_club_v1_theme") &&
      content.includes("data-theme");
    const hasTokensCss =
      content.includes("shared/css/tokens.css") ||
      content.includes("tokens.css");
    const hasComponentsCss =
      content.includes("shared/css/components.css") ||
      content.includes("components.css");

    assert(
      hasTicker &&
        hasHeader &&
        hasFooter &&
        hasAppScript &&
        hasZeroFouc &&
        hasTokensCss &&
        hasComponentsCss,
      `All required containers and assets present in ${relPath}`,
      {
        file: relPath,
        hasTicker,
        hasHeader,
        hasFooter,
        hasAppScript,
        hasZeroFouc,
        hasTokensCss,
        hasComponentsCss,
      },
    );
  }
}

async function _challengeAppBootstrap() {
  console.log("\n====================================================");
  console.log("CHALLENGE SECTION 2: APP BOOTSTRAP & MOUNT ROBUSTNESS");
  console.log("====================================================");

  // Test 2.1: Missing Container Handling in component mount()
  const { Header: HeaderClass } =
    await import("../shared/js/components/Header.js");
  const { Footer: FooterClass } =
    await import("../shared/js/components/Footer.js");
  const { Ticker: TickerClass } =
    await import("../shared/js/components/Ticker.js");

  const headerInstance = new HeaderClass();
  const footerInstance = new FooterClass();
  const tickerInstance = new TickerClass();

  let headerWarned = false;
  let footerWarned = false;
  let tickerWarned = false;

  const origWarn = console.warn;
  console.warn = (msg) => {
    if (typeof msg === "string") {
      if (msg.includes("[Header] Target element")) headerWarned = true;
      if (msg.includes("[Footer] Target element")) footerWarned = true;
      if (msg.includes("[Ticker] Target element")) tickerWarned = true;
    }
  };

  try {
    headerInstance.mount("#non-existent-selector-header");
    assert(
      headerWarned,
      "Header.mount gracefully handles missing DOM target without throwing",
    );
  } catch (err) {
    assert(false, "Header.mount threw error on missing target", err.message);
  }

  try {
    footerInstance.mount("#non-existent-selector-footer");
    assert(
      footerWarned,
      "Footer.mount gracefully handles missing DOM target without throwing",
    );
  } catch (err) {
    assert(false, "Footer.mount threw error on missing target", err.message);
  }

  try {
    tickerInstance.mount("#non-existent-selector-ticker");
    assert(
      tickerWarned,
      "Ticker.mount gracefully handles missing DOM target without throwing",
    );
  } catch (err) {
    assert(false, "Ticker.mount threw error on missing target", err.message);
  }

  console.warn = origWarn;

  // Test 2.2: scripts/app.js Execution in DOM
  const containerTicker = document.createElement("div");
  containerTicker.id = "app-ticker";
  document.body.appendChild(containerTicker);

  const containerHeader = document.createElement("header");
  containerHeader.id = "app-header";
  document.body.appendChild(containerHeader);

  const containerFooter = document.createElement("footer");
  containerFooter.id = "app-footer";
  document.body.appendChild(containerFooter);

  let appInitError = null;
  try {
    const appMod = await import("../scripts/app.js");
    appMod.initializeApp();
  } catch (err) {
    appInitError = err;
  }

  assert(
    appInitError === null,
    "scripts/app.js initializeApp() runs without throwing uncaught exceptions",
    appInitError
      ? `${appInitError.name}: ${appInitError.message} at ${appInitError.stack}`
      : null,
  );

  // Test 2.3: Verify Named vs Default exports across Header, Footer, Ticker
  const headerMod = await import("../shared/js/components/Header.js");
  const footerMod = await import("../shared/js/components/Footer.js");
  const tickerMod = await import("../shared/js/components/Ticker.js");

  const headerHasStaticMount = typeof headerMod.Header.mount === "function";
  const footerHasStaticMount = typeof footerMod.Footer.mount === "function";
  const tickerHasStaticMount = typeof tickerMod.Ticker.mount === "function";

  assert(
    headerHasStaticMount && footerHasStaticMount && tickerHasStaticMount,
    "Header, Footer, and Ticker named class exports provide static mount() or instances",
    {
      "Header.mount": typeof headerMod.Header.mount,
      "Footer.mount": typeof footerMod.Footer.mount,
      "Ticker.mount": typeof tickerMod.Ticker.mount,
      note: "app.js imports { Header, Footer, Ticker } and calls Header.mount(), but mount is an instance method on the class prototype.",
    },
  );
}

function _testQuickSearchInit(QuickSearch) {
  const backdropCount1 = document.querySelectorAll(
    "#cc-search-backdrop",
  ).length;
  QuickSearch.init();
  const backdropCount2 = document.querySelectorAll(
    "#cc-search-backdrop",
  ).length;
  assert(
    backdropCount1 === 1 && backdropCount2 === 1,
    "QuickSearch.init() is idempotent and does not duplicate modal DOM",
  );
}

function _testQuickSearchRapidCycles(QuickSearch) {
  let rapidToggleSuccess = true;
  let rapidToggleErr = null;
  try {
    for (let i = 0; i < 50; i++) {
      QuickSearch.open();
      QuickSearch.close();
    }
  } catch (err) {
    rapidToggleSuccess = false;
    rapidToggleErr = err;
  }
  assert(
    rapidToggleSuccess,
    "QuickSearch survives 50 rapid open/close cycles without error",
    rapidToggleErr ? rapidToggleErr.message : null,
  );
}

function _testQuickSearchQueries(QuickSearch, inputEl) {
  const emptyQueries = ["", "   ", "\t", "\n", "   \t  "];
  let emptyQuerySuccess = true;
  for (const eq of emptyQueries) {
    inputEl.value = eq;
    QuickSearch._handleInput();
    if (QuickSearch.filteredItems.length === 0) {
      emptyQuerySuccess = false;
    }
  }
  assert(
    emptyQuerySuccess,
    "Empty/whitespace queries display default all items list without crashing",
  );
}

function _testQuickSearchRegex(QuickSearch, inputEl) {
  const regexAttacks = [
    ".*",
    "(a|b)+",
    String.raw`[\s\S]*`,
    "\\",
    "/",
    "?",
    "*",
    "+",
    "^",
    "$",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "|",
    "([a-zA-Z0-9]+)*$",
  ];

  let regexCrash = false;
  let regexError = null;
  for (const attack of regexAttacks) {
    try {
      inputEl.value = attack;
      QuickSearch._handleInput();
    } catch (err) {
      regexCrash = true;
      regexError = err;
      break;
    }
  }
  assert(
    !regexCrash,
    "QuickSearch handles regex meta-characters without throwing invalid RegExp exceptions",
    regexError ? regexError.message : null,
  );
}

function _testQuickSearchExtreme(QuickSearch, inputEl) {
  let extremeInputOk = true;
  let extremeError = null;
  try {
    inputEl.value = "A".repeat(5000);
    QuickSearch._handleInput();
    inputEl.value = "🚀 Bitcoin ₿ 100K 🔥 \u0000 \uFFFF";
    QuickSearch._handleInput();
  } catch (err) {
    extremeInputOk = false;
    extremeError = err;
  }
  assert(
    extremeInputOk,
    "QuickSearch handles extreme character length (5,000 chars) and Unicode symbols",
    extremeError ? extremeError.message : null,
  );
}

function _testQuickSearchKeyboardNav(QuickSearch, inputEl) {
  inputEl.value = "xyznonexistentstring123456789";
  QuickSearch._handleInput();
  assert(
    QuickSearch.filteredItems.length === 0,
    "No items matched for non-existent query",
  );

  let navCrashWithEmptyResults = false;
  let navError = null;
  try {
    QuickSearch._moveSelection(1);
    QuickSearch._moveSelection(-1);
    QuickSearch._selectCurrent();
  } catch (err) {
    navCrashWithEmptyResults = true;
    navError = err;
  }
  assert(
    !navCrashWithEmptyResults,
    "Keyboard navigation with 0 filtered items does not throw or crash",
    navError ? navError.message : null,
  );

  inputEl.value = "";
  QuickSearch._handleInput();
  const totalItems = QuickSearch.filteredItems.length;
  QuickSearch.selectedIndex = 0;
  QuickSearch._moveSelection(-1);
  const wrapEnd = QuickSearch.selectedIndex === totalItems - 1;
  QuickSearch._moveSelection(1);
  const wrapStart = QuickSearch.selectedIndex === 0;
  assert(
    wrapEnd && wrapStart,
    "Keyboard navigation properly wraps circularly at boundaries",
  );
}

function _testQuickSearchStorm(QuickSearch, inputEl) {
  let stormSuccess = true;
  let stormError = null;
  try {
    for (let i = 0; i < 500; i++) {
      inputEl.value = `query_${i % 10}`;
      QuickSearch._handleInput();
    }
  } catch (err) {
    stormSuccess = false;
    stormError = err;
  }
  assert(
    stormSuccess,
    "QuickSearch survives a storm of 500 rapid keystrokes",
    stormError ? stormError.message : null,
  );
}

async function _challengeQuickSearch() {
  console.log("\n====================================================");
  console.log("CHALLENGE SECTION 3: QUICKSEARCH EDGE CASES & STRESS");
  console.log("====================================================");

  const { QuickSearch } =
    await import("../shared/js/components/QuickSearch.js");
  QuickSearch.init();

  _testQuickSearchInit(QuickSearch);
  _testQuickSearchRapidCycles(QuickSearch);

  QuickSearch.open();
  const inputEl = document.getElementById("cc-search-input");
  _testQuickSearchQueries(QuickSearch, inputEl);
  _testQuickSearchRegex(QuickSearch, inputEl);
  _testQuickSearchExtreme(QuickSearch, inputEl);
  _testQuickSearchKeyboardNav(QuickSearch, inputEl);
  _testQuickSearchStorm(QuickSearch, inputEl);
  QuickSearch.close();
}

function _testToastInit(Toast) {
  const toastContainerCount1 = document.querySelectorAll(
    "#app-toast-container",
  ).length;
  Toast.init();
  const toastContainerCount2 = document.querySelectorAll(
    "#app-toast-container",
  ).length;
  assert(
    toastContainerCount1 === 1 && toastContainerCount2 === 1,
    "Toast.init() is idempotent and does not duplicate container",
  );
}

function _testToastStorm(Toast, toastContainer) {
  toastContainer.innerHTML = "";
  let stormOk = true;
  let toastStormError = null;
  const createdToasts = [];
  try {
    for (let i = 0; i < 100; i++) {
      const type = ["info", "success", "warning", "error"][i % 4];
      const el = Toast.show(`Storm message #${i + 1} (${type})`, type, 10000);
      createdToasts.push(el);
    }
  } catch (err) {
    stormOk = false;
    toastStormError = err;
  }
  assert(
    stormOk && toastContainer.children.length === 100,
    `Concurrent storm of 100 toasts rendered successfully (${toastContainer.children.length} active)`,
    toastStormError ? toastStormError.message : null,
  );
  return createdToasts;
}

function _testToastDismissal(createdToasts) {
  let rapidDismissOk = true;
  let dismissError = null;
  try {
    for (const el of createdToasts) {
      const closeBtn = el.querySelector(".cc-toast-close");
      if (closeBtn) {
        const handlers = closeBtn._listeners?.get("click");
        if (handlers) {
          handlers.forEach((h) => h({ type: "click" }));
        }
      }
    }
  } catch (err) {
    rapidDismissOk = false;
    dismissError = err;
  }
  assert(
    rapidDismissOk,
    "Rapid dismissal of 100 concurrent toasts executed without exception",
    dismissError ? dismissError.message : null,
  );
}

function _testToastExtremeAndXSS(Toast) {
  const xssPayload =
    '<img src=x onerror=alert("XSS")><script>alert(1)</script>';
  const xssToast = Toast.show(xssPayload, "error", 5000);
  const msgEl = xssToast.querySelector(".cc-toast-msg");
  const containsRawHtml =
    msgEl.innerHTML.includes("<script>") || msgEl.innerHTML.includes("<img");
  assert(
    !containsRawHtml,
    "Toast message sanitizes HTML entities against XSS attacks",
    {
      renderedHtml: msgEl.innerHTML,
    },
  );

  const hugeString = "X".repeat(50000);
  let hugeOk = true;
  let hugeError = null;
  try {
    Toast.show(hugeString, "info", 5000);
  } catch (err) {
    hugeOk = false;
    hugeError = err;
  }
  assert(
    hugeOk,
    "Toast survives 50,000-character notification message",
    hugeError ? hugeError.message : null,
  );
}

function _testToastFalsyTypes(Toast) {
  let falsyTypesOk = true;
  let falsyTypesError = null;
  try {
    Toast.show(null);
    Toast.show(undefined);
    Toast.show(123456);
    Toast.show({ foo: "bar" });
    Toast.show("", "success", 0);
  } catch (err) {
    falsyTypesOk = false;
    falsyTypesError = err;
  }
  assert(
    falsyTypesOk,
    "Toast handles null, undefined, numeric, object, and 0 duration safely",
    falsyTypesError ? falsyTypesError.message : null,
  );
}

async function _challengeToast() {
  console.log("\n====================================================");
  console.log("CHALLENGE SECTION 4: TOAST NOTIFICATION CONCURRENT STORMS");
  console.log("====================================================");

  const { Toast } = await import("../shared/js/components/Toast.js");
  Toast.init();

  _testToastInit(Toast);
  const toastContainer = document.getElementById("app-toast-container");
  const createdToasts = _testToastStorm(Toast, toastContainer);
  _testToastDismissal(createdToasts);
  _testToastExtremeAndXSS(Toast);
  _testToastFalsyTypes(Toast);
}

function _printChallengeSummary() {
  console.log("\n====================================================");
  console.log("CHALLENGE SECTION 5: SUMMARY REPORT");
  console.log("====================================================");
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Findings count: ${results.findings.length}`);
  if (results.findings.length > 0) {
    console.log("\nFailure Details:");
    results.findings.forEach((f, i) => {
      console.log(`\nFinding #${i + 1}: ${f.test}`);
      console.log(JSON.stringify(f.details, null, 2));
    });
  }

  return results;
}

async function runChallenges() {
  await _challengeDomContainers();
  await _challengeAppBootstrap();
  await _challengeQuickSearch();
  await _challengeToast();
  return _printChallengeSummary();
}

try {
  await runChallenges();
} catch (err) {
  console.error("Fatal challenge execution error:", err);
  process.exit(1);
}

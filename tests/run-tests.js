#!/usr/bin/env node
/**
 * FinTech Cryptocurrency Club Portal - CLI Test Runner
 *
 * Executes full 4-tier opaque-box test suites:
 * - Tier 1: Per-Feature Behavioral Tests (Features 1 - 32)
 * - Tier 2: Boundary & Corner Cases (Features 1 - 32)
 * - Tier 3: Pairwise Cross-Feature Interactions
 * - Tier 4: Realistic Multi-Step Workload Scenarios
 *
 * Progressive Testability:
 * Milestone 1 features are fully verified. Features in pending milestones (M2-M5)
 * cleanly skip with precise milestone attribution.
 * Returns Exit Code 0 when tests execute.
 * Zero npm dependencies.
 */

import { registry } from "./test-harness.js";

// Load all 4 test tiers
import "./tier1_features.test.js";
import "./tier2_boundaries.test.js";
import "./tier3_interactions.test.js";
import "./tier4_scenarios.test.js";

// ANSI terminal color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
  bgDark: "\x1b[48;5;234m",
};

// Parse command line arguments
const args = process.argv.slice(2);
let tierFilter = null;
let nameFilter = null;
let jsonOutput = false;
let verbose = false;

for (const arg of args) {
  if (arg.startsWith("--tier=")) {
    tierFilter = Number.parseInt(arg.split("=")[1], 10);
  } else if (arg.startsWith("--filter=")) {
    nameFilter = arg.split("=")[1].toLowerCase();
  } else if (arg === "--json") {
    jsonOutput = true;
  } else if (arg === "--verbose" || arg === "-v") {
    verbose = true;
  }
}

async function main() {
  const startTime = Date.now();

  if (!jsonOutput) {
    console.log(
      `\n${colors.cyan}${colors.bold}======================================================================${colors.reset}`,
    );
    console.log(
      `${colors.cyan}${colors.bold}   CRYPTOCURRENCY CLUB PORTAL - 4-TIER TEST SUITE RUNNER${colors.reset}`,
    );
    console.log(
      `${colors.dim}   FinTech Architecture | Zero NPM Dependencies | Native ES Modules${colors.reset}`,
    );
    console.log(
      `${colors.cyan}${colors.bold}======================================================================${colors.reset}\n`,
    );

    if (tierFilter) {
      console.log(
        `${colors.yellow}Filter: Tier ${tierFilter} only${colors.reset}\n`,
      );
    }
  }

  // Execute test registry
  const results = await registry.run({
    tier: tierFilter,
    filter: nameFilter,
    reporter: (event, payload) => {
      if (jsonOutput) return;

      if (event === "test_end" && verbose) {
        if (payload.status === "passed") {
          console.log(
            `  ${colors.green}✓${colors.reset} ${colors.dim}[T${payload.tier}]${colors.reset} ${payload.name} ${colors.gray}(${payload.durationMs}ms)${colors.reset}`,
          );
        } else if (payload.status === "skipped") {
          console.log(
            `  ${colors.yellow}○${colors.reset} ${colors.dim}[T${payload.tier}]${colors.reset} ${payload.name} ${colors.gray}(${payload.skipReason || "skipped"})${colors.reset}`,
          );
        } else if (payload.status === "failed") {
          console.log(
            `  ${colors.red}✗${colors.reset} ${colors.dim}[T${payload.tier}]${colors.reset} ${colors.name} ${colors.red}${payload.error?.message}${colors.reset}`,
          );
        }
      }
    },
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  if (jsonOutput) {
    console.log(JSON.stringify({ ...results, durationSec }, null, 2));
    process.exit(results.failed > 0 ? 1 : 0);
  }

  // Tier-by-Tier Breakdown
  console.log(`${colors.bold}TIER SUMMARY BREAKDOWN:${colors.reset}`);
  console.log(
    `${colors.dim}----------------------------------------------------------------------${colors.reset}`,
  );
  console.log(
    `${"Tier Name".padEnd(42)} ${"Total".padStart(7)} ${"Passed".padStart(8)} ${"Skipped".padStart(9)} ${"Failed".padStart(8)}`,
  );
  console.log(
    `${colors.dim}----------------------------------------------------------------------${colors.reset}`,
  );

  for (let t = 1; t <= 4; t++) {
    if (tierFilter && tierFilter !== t) continue;
    const tierSuites = results.suites.filter((s) => s.tier === t);
    let tTotal = 0,
      tPassed = 0,
      tSkipped = 0,
      tFailed = 0;
    tierSuites.forEach((s) => {
      tTotal += s.tests.length;
      tPassed += s.passed;
      tSkipped += s.skipped;
      tFailed += s.failed;
    });

    const tierLabels = [
      "",
      "Tier 1: Behavioral (Features 1 - 32)",
      "Tier 2: Boundaries (Features 1 - 32)",
      "Tier 3: Pairwise Interactions",
      "Tier 4: Realistic Workload Scenarios",
    ];

    console.log(
      `${tierLabels[t].padEnd(42)} ${String(tTotal).padStart(7)} ${String(tPassed).padStart(8)} ${String(tSkipped).padStart(9)} ${String(tFailed).padStart(8)}`,
    );
  }
  console.log(
    `${colors.dim}----------------------------------------------------------------------${colors.reset}`,
  );

  // Totals
  console.log(
    `${colors.bold}${"TOTALS".padEnd(42)} ${String(results.total).padStart(7)} ${String(results.passed).padStart(8)} ${String(results.skipped).padStart(9)} ${String(results.failed).padStart(8)}${colors.reset}`,
  );
  console.log(
    `${colors.dim}======================================================================${colors.reset}\n`,
  );

  // Progressive Status Banner
  if (results.failed === 0) {
    console.log(
      `${colors.green}${colors.bold}✓ ALL TESTS PASSED SUCCESSFULLY! (Exit Code 0)${colors.reset}`,
    );
    console.log(
      `${colors.dim}  Verified Features: Milestone 1 components & services 100% operative.${colors.reset}`,
    );
    console.log(
      `${colors.dim}  Pending Milestones: M2-M5 tests cleanly guarded and ready for execution.${colors.reset}`,
    );
    console.log(
      `${colors.dim}  Total Execution Time: ${durationSec}s${colors.reset}\n`,
    );
  } else {
    console.log(
      `${colors.red}${colors.bold}✗ TEST SUITE FAILED WITH ${results.failed} DEFECT(S)!${colors.reset}\n`,
    );
    console.log(`${colors.bold}FAILURE DETAILS:${colors.reset}`);
    results.failures.forEach((f, idx) => {
      console.log(
        `\n  ${colors.red}${idx + 1}. [Tier ${f.tier}] ${f.suiteName} > ${f.name}${colors.reset}`,
      );
      console.log(
        `     ${colors.red}Error: ${f.error?.message}${colors.reset}`,
      );
      if (f.error?.stack && verbose) {
        console.log(`     ${colors.dim}${f.error.stack}${colors.reset}`);
      }
    });
    console.log("");
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

try {
  await main();
} catch (err) {
  console.error(
    `${colors.red}Unhandled test runner exception:${colors.reset}`,
    err,
  );
  process.exit(1);
}

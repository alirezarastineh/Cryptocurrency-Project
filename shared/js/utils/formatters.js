/**
 * FinTech Data Formatters & Sanitizers
 */

/**
 * Format a numeric value into a currency string (USD by default).
 * Automatically adjusts decimals for micro-priced tokens (< $1.00).
 *
 * @param {number} value
 * @param {string} currency
 * @param {number|null} maxDecimals
 * @returns {string}
 */
export function formatCurrency(value, currency = "USD", maxDecimals = null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "$0.00";
  }

  const num = Number(value);
  let decimals = 2;
  if (maxDecimals !== null) {
    decimals = maxDecimals;
  } else if (Math.abs(num) < 0.0001 && num !== 0) {
    decimals = 8;
  } else if (Math.abs(num) < 0.01 && num !== 0) {
    decimals = 6;
  } else if (Math.abs(num) < 1 && num !== 0) {
    decimals = 4;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: Math.min(2, decimals),
      maximumFractionDigits: decimals,
    }).format(num);
  } catch {
    // Fallback if currency code is unsupported by the Intl environment
    return `$${num.toFixed(decimals)}`;
  }
}

/**
 * Format a number as a signed or unsigned percentage string.
 *
 * @param {number} value
 * @param {boolean} includeSign
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, includeSign = true, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0.00%";
  }
  const num = Number(value);
  const formatted = Math.abs(num).toFixed(decimals) + "%";
  if (num > 0 && includeSign) {
    return `+${formatted}`;
  } else if (num < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

/**
 * Format a large number with compact unit suffixes (K, M, B, T).
 *
 * @param {number} value
 * @returns {string}
 */
export function formatCompactNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0";
  }
  const num = Number(value);
  try {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    // Fallback if compact notation is unsupported
    if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toLocaleString();
  }
}

/**
 * Format a timestamp or Date object into human-readable relative time.
 * e.g., "Just now", "15m ago", "2h ago", "3d ago".
 *
 * @param {number|Date|string} dateInput
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "";

  let date;
  if (typeof dateInput === "number") {
    const timestampMs = dateInput < 1e11 ? dateInput * 1000 : dateInput;
    date = new Date(timestampMs);
  } else {
    date = new Date(dateInput);
  }

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (Number.isNaN(diffSec)) return "";
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Sanitize string to prevent XSS injection in HTML contexts.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

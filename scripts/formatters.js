export function formatCurrency(num, digits = 2) {
  if (num === null || num === undefined || Number.isNaN(num)) return "$0.00";
  if (num < 0.0001) return `$${Number(num).toFixed(6)}`;
  if (num < 1) return `$${Number(num).toFixed(4)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}

export function formatPercent(num) {
  if (num === null || num === undefined || Number.isNaN(num)) return "0.00%";
  const prefix = num > 0 ? "+" : "";
  return `${prefix}${Number(num).toFixed(2)}%`;
}

export function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return formatCurrency(num, 0);
}

export function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp * 1000;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

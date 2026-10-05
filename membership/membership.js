import { ThemeService } from "../scripts/themeService.js";

document.addEventListener("DOMContentLoaded", () => {
  ThemeService.init();
  document
    .querySelectorAll(".theme-toggle-btn")
    .forEach((b) => b.addEventListener("click", () => ThemeService.toggle()));

  let isYearly = false;
  const toggleBtn = document.querySelector("#billing-toggle");

  toggleBtn?.addEventListener("click", () => {
    isYearly = !isYearly;
    toggleBtn.style.background = isYearly
      ? "var(--accent-cyan)"
      : "var(--bg-card)";
    toggleBtn.style.color = isYearly ? "#000" : "var(--text-primary)";

    document.querySelectorAll(".price-val").forEach((p) => {
      const cost = isYearly ? p.dataset.yearly : p.dataset.monthly;
      if (cost === "0") {
        p.innerHTML = "Free";
      } else {
        p.innerHTML = `$${cost}<span style="font-size:1rem; font-weight:400;">/mo</span>`;
      }
    });
  });
});

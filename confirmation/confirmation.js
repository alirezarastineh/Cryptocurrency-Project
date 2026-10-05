import { ThemeService } from "../scripts/themeService.js";

document.addEventListener("DOMContentLoaded", () => {
  ThemeService.init();
  document
    .querySelectorAll(".theme-toggle-btn")
    .forEach((b) => b.addEventListener("click", () => ThemeService.toggle()));

  // Read from LocalStorage or URL params
  const params = new URLSearchParams(window.location.search);
  const localProfile = JSON.parse(
    localStorage.getItem("crypto_investor_profile") || "{}",
  );

  const name = params.get("name") || localProfile.name || "Alex Mercer";
  const email = params.get("email") || localProfile.email || "alex@domain.com";
  const risk = localProfile.riskProfile || "Balanced Growth";
  const tier = localProfile.tier || "Pro Trader";
  const date = localProfile.date || new Date().toLocaleDateString();

  const nameEl = document.querySelector("#badge-name");
  const emailEl = document.querySelector("#badge-email");
  const riskEl = document.querySelector("#badge-risk");
  const tierEl = document.querySelector("#badge-tier");
  const dateEl = document.querySelector("#badge-date");

  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;
  if (riskEl) riskEl.textContent = risk;
  if (tierEl) tierEl.textContent = tier;
  if (dateEl) dateEl.textContent = date;
});

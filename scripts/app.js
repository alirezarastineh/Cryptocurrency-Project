import { ThemeService } from "./themeService.js";
import { CryptoAPI } from "./api.js";
import { TickerComponent } from "./components/Ticker.js";

document.addEventListener("DOMContentLoaded", async () => {
  ThemeService.init();

  // Setup Theme Toggle
  document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => ThemeService.toggle());
  });

  // Load Running Ticker
  const tickerMount = document.querySelector("#ticker-mount");
  if (tickerMount) {
    const coins = await CryptoAPI.getTopCoins();
    TickerComponent.render(tickerMount, coins);
  }
});

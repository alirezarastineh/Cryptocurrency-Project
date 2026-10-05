import { formatCurrency } from "../scripts/formatters.js";
import { ThemeService } from "../scripts/themeService.js";
import { CryptoAPI } from "../scripts/api.js";
import { TickerComponent } from "../scripts/components/Ticker.js";

document.addEventListener("DOMContentLoaded", async () => {
  ThemeService.init();
  document
    .querySelectorAll(".theme-toggle-btn")
    .forEach((b) => b.addEventListener("click", () => ThemeService.toggle()));

  const coins = await CryptoAPI.getTopCoins();
  const tickerMount = document.querySelector("#ticker-mount");
  if (tickerMount) TickerComponent.render(tickerMount, coins);

  const amountSlider = document.querySelector("#dca-amount");
  const yearsSlider = document.querySelector("#dca-years");
  const rateSlider = document.querySelector("#dca-rate");

  function calculateAndDraw() {
    const monthly = Number(amountSlider.value);
    const years = Number(yearsSlider.value);
    const annualRate = Number(rateSlider.value) / 100;

    document.querySelector("#dca-amount-val").textContent = formatCurrency(
      monthly,
      0,
    );
    document.querySelector("#dca-years-val").textContent =
      `${years} Year${years > 1 ? "s" : ""}`;
    document.querySelector("#dca-rate-val").textContent =
      `${(annualRate * 100).toFixed(0)}%`;

    const months = years * 12;
    const monthlyRate = annualRate / 12;
    let futureValue = 0;
    const dataPoints = [];

    for (let m = 1; m <= months; m++) {
      futureValue = (futureValue + monthly) * (1 + monthlyRate);
      dataPoints.push(futureValue);
    }

    const principal = monthly * months;
    document.querySelector("#dca-total-principal").textContent = formatCurrency(
      principal,
      0,
    );
    document.querySelector("#dca-total-value").textContent = formatCurrency(
      futureValue,
      0,
    );

    drawDCAChart(dataPoints, principal);
  }

  [amountSlider, yearsSlider, rateSlider].forEach((el) =>
    el?.addEventListener("input", calculateAndDraw),
  );
  calculateAndDraw();
});

function drawDCAChart(dataPoints, principal) {
  const canvas = document.querySelector("#dca-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const maxVal = Math.max(...dataPoints, principal * 1.1);

  // Draw Area Curve
  ctx.beginPath();
  dataPoints.forEach((val, idx) => {
    const x = (idx / (dataPoints.length - 1)) * (w - 20) + 10;
    const y = h - (val / maxVal) * (h - 30) - 15;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = "#00d2ff";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Gradient fill
  ctx.lineTo(w - 10, h - 10);
  ctx.lineTo(10, h - 10);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(0, 210, 255, 0.35)");
  grad.addColorStop(1, "rgba(0, 210, 255, 0.0)");
  ctx.fillStyle = grad;
  ctx.fill();
}

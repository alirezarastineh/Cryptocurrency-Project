/**
 * Modular Reusable FinTech Footer Component
 * FinTech Cryptocurrency Club Portal
 */

import { BaseComponent } from "./BaseComponent.js";
import { APP_CONFIG } from "../config.js";

export class Footer extends BaseComponent {
  target = null;

  /**
   * Render and mount Footer component
   * @param {string|HTMLElement} target
   */
  mount(target = "#app-footer") {
    this.target = this.resolveTarget(target);
    if (!this.target) {
      const targetStr =
        typeof target === "string"
          ? target
          : String(target?.tagName || "element");
      console.warn(`[Footer] Target element "${targetStr}" not found.`);
      return;
    }

    this.render();
  }

  /**
   * Render HTML structure
   */
  render() {
    const currentYear = new Date().getFullYear();
    const homeUrl = this.resolvePath("index.html");
    const coinsUrl = this.resolvePath("coins/coins.html");
    const invUrl = this.resolvePath("investment/investment.html");
    const newsUrl = this.resolvePath("news/news.html");
    const memUrl = this.resolvePath("membership/membership.html");
    const regUrl = this.resolvePath("registration/registration.html");
    const contactUrl = this.resolvePath("contact/contact.html");

    this.target.innerHTML = `
      <div class="cc-footer-inner">
        <div class="cc-footer-grid">
          <!-- Column 1: Brand & Status -->
          <div class="cc-footer-brand-col">
            <a href="${homeUrl}" class="cc-brand" aria-label="Cryptocurrency Club">
              <div class="cc-brand-icon">
                <span class="material-symbols-outlined">currency_bitcoin</span>
              </div>
              <div class="cc-brand-name">
                <span class="cc-brand-title">${APP_CONFIG.name}</span>
                <span class="cc-brand-subtitle">FinTech Intelligence</span>
              </div>
            </a>
            <p class="cc-footer-brand-desc">
              Empowering digital asset investors with institutional-grade market terminals, dollar-cost averaging simulations, and actionable sentiment analysis.
            </p>
            <div class="cc-status-indicator" aria-label="Platform Status: Operational">
              <span class="cc-status-dot"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          <!-- Column 2: Market Terminal & Tools -->
          <div>
            <div class="cc-footer-col-title">Intelligence & Tools</div>
            <ul class="cc-footer-links">
              <li><a href="${coinsUrl}">Market Terminal</a></li>
              <li><a href="${invUrl}">DCA Profit Simulator</a></li>
              <li><a href="${invUrl}">Portfolio Tracker</a></li>
              <li><a href="${newsUrl}">Sentiment News Feed</a></li>
            </ul>
          </div>

          <!-- Column 3: Club & Membership -->
          <div>
            <div class="cc-footer-col-title">Club & Membership</div>
            <ul class="cc-footer-links">
              <li><a href="${memUrl}">VIP Membership Tiers</a></li>
              <li><a href="${regUrl}">Investor Onboarding</a></li>
              <li><a href="${regUrl}">Risk Assessment Quiz</a></li>
              <li><a href="${contactUrl}">Support & Office Desk</a></li>
            </ul>
          </div>

          <!-- Column 4: Quick Links & Exchange Charts -->
          <div>
            <div class="cc-footer-col-title">Live Exchange Charts</div>
            <ul class="cc-footer-links">
              <li><a href="https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ABTCUSDTPERP" target="_blank" rel="noopener noreferrer">Bitcoin (BTC) ↗</a></li>
              <li><a href="https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3AETHUSDTPERP" target="_blank" rel="noopener noreferrer">Ethereum (ETH) ↗</a></li>
              <li><a href="https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3ASOLUSDTPERP" target="_blank" rel="noopener noreferrer">Solana (SOL) ↗</a></li>
              <li><a href="https://www.tradingview.com/chart/hVd0XUIW/?symbol=BINANCE%3AXRPUSDTPERP" target="_blank" rel="noopener noreferrer">Ripple (XRP) ↗</a></li>
            </ul>
          </div>
        </div>

        <!-- Compliance & Regulatory Risk Disclaimer -->
        <div class="cc-footer-disclaimer-box" role="note" aria-label="Financial Disclaimer">
          <div class="cc-footer-disclaimer-title">Regulatory & Financial Risk Disclosure:</div>
          Cryptocurrency trading and investment in digital assets involve substantial risk of financial loss and are not suitable for every investor. Valuation of cryptocurrencies is volatile and unpredictable; past performance is never a guarantee of future returns. All metrics, dollar-cost averaging simulations, risk quizzes, and intelligence reports presented on Cryptocurrency Club are solely for educational and research purposes and do not constitute financial, investment, taxation, or legal advice.
        </div>

        <!-- Bottom Bar -->
        <div class="cc-footer-bottom">
          <div>
            &copy; ${currentYear} ${APP_CONFIG.name}. All rights reserved. Built with pure ES Modules & Web Standards.
          </div>
          <div style="display: flex; gap: 16px;">
            <a href="${contactUrl}" style="color: inherit; text-decoration: none;">Security & Audits</a>
            <a href="${contactUrl}" style="color: inherit; text-decoration: none;">Privacy Policy</a>
            <a href="${contactUrl}" style="color: inherit; text-decoration: none;">Terms of Service</a>
          </div>
        </div>
      </div>
    `;
  }
}

export default new Footer();

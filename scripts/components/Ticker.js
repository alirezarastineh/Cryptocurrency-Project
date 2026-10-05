import { formatCurrency, formatPercent } from '../formatters.js';

export class TickerComponent {
  static render(container, coins = []) {
    if (!container || !coins.length) return;
    
    const itemsHtml = coins.slice(0, 15).map(c => `
      <div class="ticker-item" data-symbol="${c.name}">
        <span class="ticker-symbol">${c.name}</span>
        <span class="ticker-price">${formatCurrency(c.current_price)}</span>
        <span class="ticker-change ${c.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
          ${formatPercent(c.price_change_percentage_24h)}
        </span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="ticker-wrap">
        <div class="ticker-move">${itemsHtml}${itemsHtml}</div>
      </div>
    `;
  }
}

/**
 * Global FinTech Toast Notification System
 * Cryptocurrency Club Portal
 */

import { escapeHtml } from "../utils/formatters.js";

class ToastManager {
  container = null;
  counter = 0;

  /**
   * Ensure container element exists in DOM
   * @private
   */
  _ensureContainer() {
    if (!this.container || !document.body.contains(this.container)) {
      let existing = document.getElementById("app-toast-container");
      if (!existing) {
        existing = document.createElement("div");
        existing.id = "app-toast-container";
        existing.setAttribute("aria-live", "polite");
        existing.setAttribute("aria-atomic", "false");
        document.body.appendChild(existing);
      }
      this.container = existing;
    }
    return this.container;
  }

  /**
   * Map notification type to Material Symbols icon name
   * @private
   */
  _getIcon(type) {
    switch (type) {
      case "success":
        return "check_circle";
      case "warning":
        return "warning";
      case "error":
        return "error";
      case "info":
      default:
        return "info";
    }
  }

  /**
   * Show a toast message
   * @param {string} message
   * @param {'info' | 'success' | 'warning' | 'error'} type
   * @param {number} durationMs
   * @returns {HTMLElement} The created toast element
   */
  show(message, type = "info", durationMs = 4000) {
    if (typeof document === "undefined") return null;

    const container = this._ensureContainer();
    const id = `toast-${++this.counter}`;
    const iconName = this._getIcon(type);

    const toastEl = document.createElement("div");
    toastEl.className = `cc-toast-card ${type}`;
    toastEl.id = id;
    toastEl.setAttribute(
      "role",
      type === "error" || type === "warning" ? "alert" : "status",
    );

    toastEl.innerHTML = `
      <span class="material-symbols-outlined cc-toast-icon">${iconName}</span>
      <div class="cc-toast-body">
        <p class="cc-toast-msg">${escapeHtml(message)}</p>
      </div>
      <button type="button" class="cc-toast-close" aria-label="Dismiss notification">
        <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
      </button>
    `;

    const closeBtn = toastEl.querySelector(".cc-toast-close");
    let timer = null;

    const dismiss = () => {
      if (timer) clearTimeout(timer);
      toastEl.classList.add("is-hiding");
      setTimeout(() => {
        toastEl.remove();
      }, 200);
    };

    if (closeBtn) {
      closeBtn.addEventListener("click", dismiss);
    }

    if (durationMs > 0) {
      timer = setTimeout(dismiss, durationMs);
    }

    container.appendChild(toastEl);
    return toastEl;
  }

  info(msg, duration = 4000) {
    return this.show(msg, "info", duration);
  }

  success(msg, duration = 4000) {
    return this.show(msg, "success", duration);
  }

  warning(msg, duration = 4000) {
    return this.show(msg, "warning", duration);
  }

  error(msg, duration = 5000) {
    return this.show(msg, "error", duration);
  }

  init() {
    this._ensureContainer();
  }
}

export const Toast = new ToastManager();
export default Toast;

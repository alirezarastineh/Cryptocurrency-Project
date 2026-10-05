export const ThemeService = {
  THEME_KEY: "crypto_theme_preference",

  init() {
    const saved = localStorage.getItem(this.THEME_KEY);
    const preferred =
      saved ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    this.apply(preferred);

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem(this.THEME_KEY)) {
          this.apply(e.matches ? "dark" : "light");
        }
      });
  },

  apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
      btn.setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      );
      btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    });
  },

  toggle() {
    const current = document.documentElement.dataset.theme || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(this.THEME_KEY, next);
    this.apply(next);
    return next;
  },
};

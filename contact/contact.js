import { ThemeService } from "../scripts/themeService.js";
import { Toast } from "../scripts/components/Toast.js";

document.addEventListener("DOMContentLoaded", () => {
  ThemeService.init();
  document
    .querySelectorAll(".theme-toggle-btn")
    .forEach((b) => b.addEventListener("click", () => ThemeService.toggle()));

  document.querySelector("#contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    Toast.show(
      "Message sent successfully! Our analysts will reply within 24 hours.",
      "success",
    );
    e.target.reset();
  });
});

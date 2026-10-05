import { ThemeService } from "../scripts/themeService.js";

let currentStep = 1;
const totalSteps = 3;

const RISK_PROFILES = {
  1: "Conservative",
  2: "Balanced",
  3: "Aggressive Growth",
};

const STEP_TITLES = {
  1: "Account Profile",
  2: "Risk Assessment",
  3: "Select Tier",
};

document.addEventListener("DOMContentLoaded", () => {
  ThemeService.init();
  document
    .querySelectorAll(".theme-toggle-btn")
    .forEach((b) => b.addEventListener("click", () => ThemeService.toggle()));

  const nextBtn = document.querySelector("#next-btn");
  const prevBtn = document.querySelector("#prev-btn");

  nextBtn?.addEventListener("click", () => {
    if (currentStep === 1) {
      const name = document.querySelector("#reg-name").value.trim();
      const email = document.querySelector("#reg-email").value.trim();
      if (!name || !email.includes("@")) {
        alert("Please enter a valid name and email address.");
        return;
      }
    }

    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    } else {
      // Submit & Save profile
      const riskVal =
        document.querySelector('input[name="risk_q1"]:checked')?.value || "2";
      const riskProfile = RISK_PROFILES[riskVal] || "Balanced";
      const tier =
        document.querySelector('input[name="tier_choice"]:checked')?.value ||
        "Pro";

      const profile = {
        name: document.querySelector("#reg-name").value,
        email: document.querySelector("#reg-email").value,
        experience: document.querySelector("#reg-experience").value,
        riskProfile,
        tier,
        date: new Date().toLocaleDateString(),
      };

      localStorage.setItem("crypto_investor_profile", JSON.stringify(profile));
      window.location.href = "../confirmation/confirmation.html";
    }
  });

  prevBtn?.addEventListener("click", () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });
});

function goToStep(step) {
  document
    .querySelectorAll(".wizard-step")
    .forEach((el) => (el.style.display = "none"));
  document.querySelector("#step-1").style.display =
    step === 1 ? "block" : "none";
  document.querySelector("#step-2").style.display =
    step === 2 ? "block" : "none";
  document.querySelector("#step-3").style.display =
    step === 3 ? "block" : "none";

  currentStep = step;
  const stepTitle = STEP_TITLES[step] || "Account Profile";
  document.querySelector("#step-indicator").textContent =
    `Step ${step} of ${totalSteps}: ${stepTitle}`;
  document.querySelector("#prev-btn").style.display =
    step > 1 ? "inline-flex" : "none";
  document.querySelector("#next-btn").textContent =
    step === totalSteps ? "Complete Registration ✓" : "Continue →";
}

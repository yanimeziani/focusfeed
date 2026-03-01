/**
 * FocusFeed — Frontier step form: psychological triage test.
 * Multi-step check-in; results stored locally; not a substitute for professional care.
 */

const TOTAL_STEPS = 4;
const STORAGE_KEY = "focusfeed_triage_last";

function getStepEl(step: number): HTMLElement | null {
  return document.getElementById(`step-${step}`);
}

function showStep(step: number): void {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const el = getStepEl(i);
    if (el) el.classList.toggle("hidden", i !== step);
  }
  const indicator = document.getElementById("step-indicator");
  if (indicator) indicator.textContent = `Step ${step} of ${TOTAL_STEPS}`;
  const progressBar = document.getElementById("progress-bar") as HTMLElement | null;
  if (progressBar) progressBar.style.width = `${(step / TOTAL_STEPS) * 100}%`;
  const btnBack = document.getElementById("btn-back");
  if (btnBack) btnBack.classList.toggle("hidden", step <= 1);
  const btnNext = document.getElementById("btn-next");
  if (btnNext) {
    btnNext.textContent = step === TOTAL_STEPS ? "Done" : "Next";
    btnNext.setAttribute("aria-label", step === TOTAL_STEPS ? "Finish" : "Next step");
  }
}

function getSelected(name: string): string | null {
  const el = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
  return el?.value ?? null;
}

function collectAnswers(): Record<string, string> {
  return {
    mood: getSelected("mood") ?? "",
    energy: getSelected("energy") ?? "",
    sleep: getSelected("sleep") ?? "",
  };
}

function buildSummary(answers: Record<string, string>): string {
  const parts: string[] = [];
  const moodLabels: Record<string, string> = {
    calm: "You reported feeling calm and steady.",
    ok: "You reported feeling okay, a bit tired.",
    stressed: "You reported feeling stressed or anxious.",
    low: "You reported feeling low or down.",
    overwhelmed: "You reported feeling overwhelmed.",
  };
  const energyLabels: Record<string, string> = {
    good: "Energy has been good.",
    low: "Energy has been lower than usual.",
    "very-low": "Energy has been very low.",
    fluctuating: "Energy has been up and down.",
  };
  const sleepLabels: Record<string, string> = {
    rested: "Rest has been sufficient.",
    "some-trouble": "Some trouble sleeping.",
    poor: "Poor or broken sleep.",
    avoiding: "Difficulty resting or switching off.",
  };
  if (answers.mood) parts.push(moodLabels[answers.mood] ?? answers.mood);
  if (answers.energy) parts.push(energyLabels[answers.energy] ?? answers.energy);
  if (answers.sleep) parts.push(sleepLabels[answers.sleep] ?? answers.sleep);
  if (parts.length) return parts.join(" ");
  return "Thank you for checking in.";
}

let currentStep = 1;

function goNext(): void {
  if (currentStep < TOTAL_STEPS) {
    const stepEl = getStepEl(currentStep);
    const required = stepEl?.querySelector('input[type="radio"]:checked');
    if (!required && currentStep < 4) {
      return; // optional: could require selection
    }
    currentStep++;
    showStep(currentStep);
    if (currentStep === TOTAL_STEPS) {
      const answers = collectAnswers();
      const summaryEl = document.getElementById("triage-summary");
      if (summaryEl) summaryEl.textContent = buildSummary(answers);
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({
          [STORAGE_KEY]: { answers, completedAt: new Date().toISOString() },
        });
      }
    }
  } else {
    window.close();
  }
}

function goBack(): void {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function runTriage(): void {
  showStep(1);
  document.getElementById("btn-next")?.addEventListener("click", goNext);
  document.getElementById("btn-back")?.addEventListener("click", goBack);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runTriage);
} else {
  runTriage();
}

/**
 * FocusFeed popup — status, enable/disable, model (paid), plan, link to options.
 */

type Status = {
  enabled: boolean;
  plan: string;
  model: string;
  usage: number;
  limit: number;
  gatewayConfigured: boolean;
};

async function loadStatus(): Promise<Status> {
  return chrome.runtime.sendMessage({ type: "GET_STATUS" });
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

async function render() {
  const status = await loadStatus();
  const toggle = document.getElementById("toggle") as HTMLInputElement;
  const planEl = document.getElementById("plan");
  const usageEl = document.getElementById("usage");
  const modelEl = document.getElementById("model");
  const settingsLink = document.getElementById("settings-link");
  const upgradeLink = document.getElementById("upgrade-link");

  if (toggle) toggle.checked = status.enabled;
  if (planEl) planEl.textContent = status.plan === "paid" ? "Paid" : "Free";
  if (usageEl) usageEl.textContent = `${formatTokens(status.usage)} / ${formatTokens(status.limit)} tokens today`;
  if (modelEl) {
    modelEl.textContent = status.model === "default" ? "Default model" : status.model;
    modelEl.title = status.plan === "paid" ? "You can choose model in settings" : "Upgrade to choose your model";
  }

  toggle?.addEventListener("change", async () => {
    await chrome.storage.sync.set({ enabled: (toggle as HTMLInputElement).checked });
    await render();
  });

  document.querySelectorAll(".open-options").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  });

  document.getElementById("triage-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("triage.html") });
  });

  if (status.gatewayConfigured === false && document.getElementById("config-warning")) {
    (document.getElementById("config-warning") as HTMLElement).style.display = "block";
  }
  if (upgradeLink && status.plan === "free") {
    (upgradeLink as HTMLElement).style.display = "inline";
  }
}

document.addEventListener("DOMContentLoaded", render);

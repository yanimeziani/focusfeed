/**
 * FocusFeed options — gateway URL, API key, plan (read-only from gateway), model choice (paid).
 * Compliance notice and link to regulations doc.
 */

const DEFAULT_GATEWAY = "https://api.focusfeed.app/v1";

async function load() {
  const r = await chrome.storage.sync.get([
    "gatewayUrl",
    "apiKey",
    "plan",
    "model",
    "enabled",
  ]);
  (document.getElementById("gateway-url") as HTMLInputElement).value =
    r.gatewayUrl ?? DEFAULT_GATEWAY;
  (document.getElementById("api-key") as HTMLInputElement).value = r.apiKey ?? "";
  (document.getElementById("model") as HTMLInputElement).value = r.model ?? "default";
  (document.getElementById("enabled") as HTMLInputElement).checked = r.enabled !== false;
}

function save() {
  const gatewayUrl = (document.getElementById("gateway-url") as HTMLInputElement).value.trim();
  const apiKey = (document.getElementById("api-key") as HTMLInputElement).value.trim();
  const model = (document.getElementById("model") as HTMLInputElement).value.trim() || "default";
  const enabled = (document.getElementById("enabled") as HTMLInputElement).checked;
  chrome.storage.sync.set({
    gatewayUrl: gatewayUrl || DEFAULT_GATEWAY,
    apiKey,
    model,
    enabled,
  });
  const status = document.getElementById("save-status");
  if (status) {
    status.textContent = "Saved.";
    status.setAttribute("aria-live", "polite");
    setTimeout(() => (status.textContent = ""), 2000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  document.getElementById("save")?.addEventListener("click", save);
});

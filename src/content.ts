/**
 * FocusFeed content script — extracts main page content and requests
 * "antivirus for the mind" analysis from the gateway via background.
 */

const MAX_TEXT_LENGTH = 50_000;

function extractMainText(): string {
  const selectors = [
    "article",
    "main",
    "[role='main']",
    ".post",
    ".content",
    ".article-body",
    ".post-content",
    "section",
  ];
  let best: Element | null = null;
  let bestLength = 0;
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const text = (el as HTMLElement).innerText?.trim() ?? "";
      if (text.length > bestLength && text.length < 500_000) {
        best = el;
        bestLength = text.length;
      }
    }
  }
  if (best) return (best as HTMLElement).innerText?.trim().slice(0, MAX_TEXT_LENGTH) ?? "";
  const body = document.body?.innerText?.trim() ?? "";
  return body.slice(0, MAX_TEXT_LENGTH);
}

function showOverlay(result: {
  score: number;
  summary: string;
  flags: string[];
  model: string;
  tokensUsed: number;
}) {
  const id = "focusfeed-overlay";
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.id = id;
  el.className = "focusfeed-overlay";
  const scorePct = Math.round(Math.max(0, Math.min(100, result.score * 100)));
  const scoreClass = scorePct >= 70 ? "focusfeed-ok" : scorePct >= 40 ? "focusfeed-caution" : "focusfeed-warn";
  el.innerHTML = `
    <div class="focusfeed-panel">
      <div class="focusfeed-header">
        <span class="focusfeed-title">FocusFeed — Mind check</span>
        <button type="button" class="focusfeed-close" aria-label="Close">×</button>
      </div>
      <div class="focusfeed-score ${scoreClass}">Score: ${scorePct}/100</div>
      <p class="focusfeed-summary">${escapeHtml(result.summary || "No summary.")}</p>
      ${result.flags.length ? `<ul class="focusfeed-flags">${result.flags.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>` : ""}
      <div class="focusfeed-meta">Model: ${escapeHtml(result.model)} · Tokens: ${result.tokensUsed}</div>
    </div>
  `;
  el.querySelector(".focusfeed-close")?.addEventListener("click", () => el.remove());
  document.body.appendChild(el);
}

function showError(message: string) {
  const id = "focusfeed-overlay";
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.id = id;
  el.className = "focusfeed-overlay";
  el.innerHTML = `
    <div class="focusfeed-panel focusfeed-error">
      <div class="focusfeed-header">
        <span class="focusfeed-title">FocusFeed</span>
        <button type="button" class="focusfeed-close" aria-label="Close">×</button>
      </div>
      <p class="focusfeed-summary">${escapeHtml(message)}</p>
    </div>
  `;
  el.querySelector(".focusfeed-close")?.addEventListener("click", () => el.remove());
  document.body.appendChild(el);
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

async function runAnalysis() {
  const text = extractMainText();
  if (!text || text.length < 100) {
    showError("Not enough readable content on this page to analyze.");
    return;
  }
  const response = await chrome.runtime.sendMessage({
    type: "ANALYZE_CONTENT",
    payload: {
      text,
      url: location.href,
      title: document.title || location.hostname,
    },
  });
  if (response?.error) {
    showError(response.error);
    return;
  }
  showOverlay(response);
}

function injectToolbarButton() {
  if (document.getElementById("focusfeed-toolbar-btn")) return;
  const btn = document.createElement("button");
  btn.id = "focusfeed-toolbar-btn";
  btn.className = "focusfeed-toolbar-btn";
  btn.setAttribute("aria-label", "Analyze this page with FocusFeed");
  btn.innerHTML = "🛡️ FocusFeed";
  btn.addEventListener("click", () => runAnalysis());
  document.body.appendChild(btn);
}

function init() {
  injectToolbarButton();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

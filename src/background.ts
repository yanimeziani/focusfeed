/**
 * FocusFeed — Cloud gateway client, usage limits (free/paid), model routing.
 * Conforms to planetary regulations; all analysis via your configured gateway.
 */

const DEFAULT_GATEWAY = "https://api.focusfeed.app/v1";
const FREE_DAILY_TOKENS = 10_000;
const PAID_DAILY_TOKENS = 500_000;
const STORAGE_KEYS = {
  GATEWAY_URL: "gatewayUrl",
  API_KEY: "apiKey",
  PLAN: "plan",
  MODEL: "model",
  USAGE_DATE: "usageDate",
  USAGE_TOKENS: "usageTokens",
  ENABLED: "enabled",
} as const;

export type Plan = "free" | "paid";
export type AnalysisResult = {
  score: number;
  summary: string;
  flags: string[];
  model: string;
  tokensUsed: number;
};

async function getStored<T>(key: string, fallback: T): Promise<T> {
  const r = await chrome.storage.sync.get(key);
  return (r[key] ?? fallback) as T;
}

async function setStored(key: string, value: unknown): Promise<void> {
  await chrome.storage.sync.set({ [key]: value });
}

function getUsageKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getDailyUsage(): Promise<{ date: string; tokens: number }> {
  const date = getUsageKey();
  const stored = await getStored(STORAGE_KEYS.USAGE_DATE, "");
  const tokens = (await getStored(STORAGE_KEYS.USAGE_TOKENS, 0)) as number;
  if (stored !== date) return { date, tokens: 0 };
  return { date, tokens };
}

async function addUsage(tokens: number): Promise<void> {
  const date = getUsageKey();
  const { date: storedDate, tokens: current } = await getDailyUsage();
  if (storedDate !== date) {
    await setStored(STORAGE_KEYS.USAGE_DATE, date);
    await setStored(STORAGE_KEYS.USAGE_TOKENS, tokens);
  } else {
    await setStored(STORAGE_KEYS.USAGE_TOKENS, current + tokens);
  }
}

async function getLimit(): Promise<number> {
  const plan = (await getStored(STORAGE_KEYS.PLAN, "free")) as Plan;
  return plan === "paid" ? PAID_DAILY_TOKENS : FREE_DAILY_TOKENS;
}

chrome.runtime.onMessage.addListener(
  (
    msg: { type: string; payload?: { text: string; url: string; title: string } },
    _sender,
    sendResponse
  ) => {
    if (msg.type === "ANALYZE_CONTENT") {
      handleAnalyze(msg.payload!)
        .then(sendResponse)
        .catch((e) => sendResponse({ error: String(e) }));
      return true;
    }
    if (msg.type === "GET_STATUS") {
      getStatus().then(sendResponse);
      return true;
    }
    if (msg.type === "OPEN_TRIAGE") {
      chrome.tabs.create({ url: chrome.runtime.getURL("triage.html") });
      sendResponse({ ok: true });
      return true;
    }
    return false;
  }
);

async function getStatus(): Promise<{
  enabled: boolean;
  plan: Plan;
  model: string;
  usage: number;
  limit: number;
  gatewayConfigured: boolean;
}> {
  const [enabled, plan, model, gatewayUrl, apiKey, { tokens }, limit] = await Promise.all([
    getStored(STORAGE_KEYS.ENABLED, true),
    getStored(STORAGE_KEYS.PLAN, "free"),
    getStored(STORAGE_KEYS.MODEL, "default"),
    getStored(STORAGE_KEYS.GATEWAY_URL, DEFAULT_GATEWAY),
    getStored(STORAGE_KEYS.API_KEY, ""),
    getDailyUsage(),
    getLimit(),
  ]);
  return {
    enabled: enabled as boolean,
    plan: plan as Plan,
    model: model as string,
    usage: tokens,
    limit,
    gatewayConfigured: !!(gatewayUrl && apiKey),
  };
}

async function handleAnalyze(payload: {
  text: string;
  url: string;
  title: string;
}): Promise<AnalysisResult | { error: string }> {
  const { text, url, title } = payload;
  const enabled = await getStored(STORAGE_KEYS.ENABLED, true);
  if (!enabled) return { error: "FocusFeed is disabled" };

  const gatewayUrl = (await getStored(STORAGE_KEYS.GATEWAY_URL, DEFAULT_GATEWAY)) as string;
  const apiKey = (await getStored(STORAGE_KEYS.API_KEY, "")) as string;
  if (!apiKey) return { error: "Configure API key in FocusFeed options" };

  const { tokens: usedToday } = await getDailyUsage();
  const limit = await getLimit();
  if (usedToday >= limit) {
    return { error: `Daily limit reached (${limit} tokens). Upgrade for more.` };
  }

  const model = (await getStored(STORAGE_KEYS.MODEL, "default")) as string;
  const res = await fetch(`${gatewayUrl.replace(/\/$/, "")}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Plan": (await getStored(STORAGE_KEYS.PLAN, "free")) as string,
    },
    body: JSON.stringify({
      text: text.slice(0, 50_000),
      url,
      title,
      model: model === "default" ? undefined : model,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { error: `Gateway error: ${res.status} ${err}` };
  }

  const data = (await res.json()) as {
    score?: number;
    summary?: string;
    flags?: string[];
    model?: string;
    tokens_used?: number;
  };
  const tokensUsed = data.tokens_used ?? 0;
  await addUsage(tokensUsed);

  return {
    score: data.score ?? 0,
    summary: data.summary ?? "",
    flags: data.flags ?? [],
    model: data.model ?? "default",
    tokensUsed,
  };
}

export { getStored, setStored, STORAGE_KEYS, getDailyUsage, getLimit, getStatus };

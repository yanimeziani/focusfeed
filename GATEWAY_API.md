# FocusFeed — Cloud Gateway API

The extension calls a **cloud gateway** for “antivirus for the mind” analysis. This document describes the expected API so you can run your own gateway or integrate with a subscription service.

## Base URL

Configured by the user in extension options (e.g. `https://api.focusfeed.app/v1`). All requests use HTTPS.

## Authentication

Requests include:

- **Header**: `Authorization: Bearer <API_KEY>`
- **Header** (optional): `X-Plan: free` or `X-Plan: paid`

The gateway should validate the API key and enforce plan limits (e.g. token caps, model availability).

## Endpoint: Analyze Content

**POST** `{baseUrl}/analyze`

**Request body (JSON):**

```json
{
  "text": "Page content or selected text (max ~50k chars)",
  "url": "https://example.com/page",
  "title": "Page title",
  "model": "default"
}
```

- `text`: Required. Main text to analyze (extension truncates to ~50,000 characters).
- `url`: Optional. Current page URL.
- `title`: Optional. Document title.
- `model`: Optional. User’s chosen model (e.g. `default`, `gpt-4o`, `claude-3-5-sonnet`). Paid plans can allow model choice; free may ignore and use a default.

**Response (200 OK, JSON):**

```json
{
  "score": 0.75,
  "summary": "Brief assessment of content quality, bias, or manipulation risks.",
  "flags": ["Possible emotional manipulation", "Uncited claims"],
  "model": "gpt-4o",
  "tokens_used": 1200
}
```

- **score**: Number in `[0, 1]` (e.g. 0 = low trust/quality, 1 = higher). Extension may display as 0–100.
- **summary**: Short human-readable summary for the overlay.
- **flags**: Optional list of short labels (e.g. bias, manipulation, uncited claims).
- **model**: Model used (for display).
- **tokens_used**: Tokens consumed for this request (for usage/limit tracking).

**Error responses**

- **401**: Invalid or missing API key.
- **402**: Quota exceeded (e.g. daily token limit).
- **429**: Rate limit.
- **4xx/5xx**: Extension shows a generic error; body can be plain text or JSON.

## Plans

- **Free**: Basic token usage per day (e.g. 10k tokens). Model is usually fixed by the gateway (`default`).
- **Paid**: Higher token limits and optional **model choice** (user selects in options; extension sends `model` in the request). Gateway may also offer extra perks (separate from the extension repo).

Plan and limits are enforced entirely by the gateway (e.g. by API key or account). The extension only sends `X-Plan` and uses `tokens_used` to show usage; it does not enforce server-side limits.

## Example Gateway Implementation (Pseudocode)

```text
POST /v1/analyze
  - Check Authorization header → identity + plan
  - Check daily usage for identity < plan limit
  - Optionally map "model" to provider (OpenAI, Anthropic, open source, etc.)
  - Call LLM with prompt like: "Analyze this content for bias, manipulation, quality. Return score 0-1, short summary, and optional flags."
  - Return { score, summary, flags, model, tokens_used }
  - Increment daily usage by tokens_used
```

This allows one gateway to support both open-source and frontier models, with free/paid tiers and planetary regulation–aware handling (e.g. logging, retention, consent) on the server.

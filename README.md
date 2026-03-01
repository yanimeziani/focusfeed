# FocusFeed — Antivirus for the Mind

**Omni browser extension** that analyzes everything you read online with your chosen AI (open source or frontier), via a cloud gateway. Conforms to planetary regulations (GDPR, CCPA, etc.). Works on **Chrome** and **Chrome for Android**.

## What it does

- **Analyzes content** on any page you visit: bias, manipulation, quality, uncited claims — like an antivirus scan for the mind.
- **Your model, your gateway**: Use your preferred LLM (default or a specific model on paid). All analysis goes through your configured cloud gateway.
- **Free & paid plans** (enforced by the gateway):
  - **Free**: Basic daily token usage, default model.
  - **Paid**: More AI usage and **choice of model** (always-on model selection).
- **Regulations**: Built for minimal data, user control, and transparency. See [COMPLIANCE.md](./COMPLIANCE.md).

## Install

### Chrome (desktop & Android)

1. **Build** the extension:
   ```bash
   npm install
   npm run build
   ```
2. **Load unpacked** (Chrome):
   - Open `chrome://extensions`
   - Enable “Developer mode”
   - Click “Load unpacked” and select the **`dist`** folder
3. **Package for store or sideload**:
   ```bash
   npm run package
   ```
   This creates `focusfeed-chrome.zip` from the `dist` folder. You can upload it to the Chrome Web Store or use it for sideloading on Android (e.g. via developer tools).

### Icons

Add your own icons for the extension:

- `icons/icon16.png` (16×16)
- `icons/icon48.png` (48×48)
- `icons/icon128.png` (128×128)

Place them in the `icons/` folder before running `npm run build`. The build copies them into `dist/icons/`.

## Configuration

1. Open the extension **Options** (right‑click the icon → Options, or from the popup).
2. Set your **Gateway URL** (e.g. `https://api.focusfeed.app/v1`) and **API key**.
3. **(Paid)** Set your preferred **model** (e.g. `gpt-4o`, `claude-3-5-sonnet`, or `default`).

The gateway handles authentication, plan limits, and model routing. See [GATEWAY_API.md](./GATEWAY_API.md) for the API contract.

## How to use

- On any page, use the **FocusFeed** floating button (bottom‑right) to run an analysis.
- The extension sends the main page text to your gateway and shows a **score**, **summary**, and **flags** in an overlay.
- Toggle analysis on/off and check usage from the **popup**.

## Project layout

- `src/` — TypeScript source (background, content script, popup, options)
- `dist/` — Built extension (after `npm run build`); load this folder in Chrome
- `manifest.json` — Extension manifest (MV3)
- `COMPLIANCE.md` — Regulations and privacy
- `GATEWAY_API.md` — Cloud gateway API specification

## License

MIT (see [LICENSE](./LICENSE)).

---

*FocusFeed — Antivirus for the mind. Choose your model. Stay in control.*

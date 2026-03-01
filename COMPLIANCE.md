# FocusFeed — Planetary Regulations & Compliance

FocusFeed is designed to conform with major data-protection and consumer regulations across jurisdictions.

## Principles

- **Minimal data**: The extension sends only the text necessary for analysis (page content excerpt) to your configured **cloud gateway**. No browsing history or identifiers are sent by default beyond what the gateway requires for authentication (e.g. API key).
- **User control**: Users configure their own gateway URL and API key. FocusFeed does not operate or mandate a specific backend.
- **Transparency**: This document and the in-extension notices describe what data is used and where it goes.

## Regulations Addressed

### GDPR (EU/EEA/UK)

- **Lawful basis**: Legitimate interest / consent depending on gateway operator. The extension acts as a data processor conduit; the gateway operator is the data controller for analysis.
- **Data minimization**: Only page text (and optional URL/title) is sent for analysis, limited in length (e.g. 50k characters).
- **Rights**: Users can disable the extension or revoke API keys at the gateway to stop processing. No persistent storage of content by the extension beyond what is required for the analysis request.
- **International transfers**: Governed by the gateway and its policies; users choose their gateway.

### CCPA / CPRA (California)

- **Disclosure**: Users are informed that page content is sent to the configured gateway for analysis.
- **No sale**: The extension does not sell personal information. Gateway terms apply separately.
- **Opt-out**: Users can disable analysis or remove the API key to stop data flow.

### Other Jurisdictions

- **General**: Same principles of minimal data, user control, and transparency apply. Gateway operators are responsible for jurisdiction-specific compliance (e.g. data residency, retention).

## Data Flow

1. **On-device**: The extension reads the visible/main text of the current page when the user triggers analysis.
2. **To gateway**: Only that text (and optionally URL/title) is sent in the analysis request to the user-configured gateway over HTTPS.
3. **No FocusFeed cloud**: If you use a third-party gateway, FocusFeed (this extension) does not receive or store that content. If you use a gateway operated by the extension’s publisher, that gateway’s privacy policy applies.

## Subscriptions (Free / Paid)

- Plan and usage limits are enforced by the **gateway** (e.g. via API key or account). The extension sends plan/model preferences; it does not process payments or store payment data.
- Subscription perks and pricing are separate from the open-source extension and are defined by the gateway operator.

## Open Source

This extension’s source code is available for review so that users and regulators can verify behavior. See the repository for the full codebase.

---

*Last updated: 2025. This is an overview; it does not constitute legal advice. Operators of gateways and of the extension in specific jurisdictions should obtain appropriate legal guidance.*

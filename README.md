# MindSync — Decision Lab

A private, browser-only BYOK (Bring Your Own Key) AI thinking workspace. Write a dilemma, dump your context, ask two AI providers for independent analysis, compare the responses, iterate, and save your own decision notes.

## Important privacy/security note

This V1 intentionally has **no backend**. API keys and saved sessions live in the browser's `localStorage` and requests go directly from the browser to the providers over HTTPS.

That means this build is intended for **personal/private use**, not as a public multi-user SaaS. Anyone who can use the same browser profile can potentially access local data, and client-side API keys cannot be treated like server-side secrets.

Do not put a personal API key into a public demo machine/browser profile. If you later turn this into a public product, add a backend/proxy, authentication, rate limiting, provider-key isolation, and a proper database.

## Current provider implementation

- OpenAI: direct REST request to the Chat Completions endpoint.
- Gemini: direct REST request to the `generateContent` endpoint.
- The Gemini REST integration uses the current `x-goog-api-key` header style.
- Model names are configurable in Settings because provider model availability can change.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

The production files are generated in `dist/`.

## GitHub Pages

This project uses a relative Vite base (`./`), so it can be deployed as a static site. Build the project and publish the generated `dist/` directory using your preferred GitHub Pages workflow.

## First use

1. Open Settings.
2. Add your OpenAI API key and/or Gemini API key.
3. Choose available model IDs.
4. Create a topic and brain dump.
5. Run Dual Analysis.
6. Compare responses without treating either model as automatically correct.
7. Save your notes or lock your decision.
8. Use History and Analytics to review your local activity.

## Data

The app stores settings and sessions in localStorage under:

- `mind_sync_state_v1`
- `mind_sync_active_v1`

Use Settings → Export All Sessions to create a JSON backup. Use Wipe Local Data to clear the app's local state.

## Disclaimer

AI outputs can be incomplete, incorrect, or misleading. For high-stakes decisions, independently verify important facts and consult an appropriately qualified person.

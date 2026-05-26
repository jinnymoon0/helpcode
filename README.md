# helpcode

helpcode is a browser extension for Chrome and Safari that appears on LeetCode problems and gives guided hints without revealing full answers.

Download: [https://helpcode-download.vercel.app](https://helpcode-download.vercel.app)

## Product Experience

Users do not need to configure API keys or run local servers.

1. User downloads the extension from your website.
2. User loads the extension in Chrome or Safari.
3. User opens a LeetCode problem page.
4. helpcode injects a floating panel and answers questions with hints.
5. Extension calls your hosted API (`helpcode-api.vercel.app`).

## Stack

- Frontend extension: React + TypeScript + WXT (Manifest V3)
- Safari packaging: Safari Web Extension Converter + Xcode
- API backend: Node.js + Express
- AI provider: Hugging Face Router API
- Hosting: Vercel (download website and API deployment)
- Source control: Git + GitHub

## Repository Layout

```txt
helpcode/
├── frontend/   # extension code
├── server/     # API backend
└── site/       # download website
```

## How The App Works

1. Content script runs on `leetcode.com/problems/*`.
2. It scans problem title/description and renders the helpcode panel.
3. User submits a question.
4. Frontend posts `{ title, description, question }` to your hosted `/api/hint`.
5. Backend calls Hugging Face with a hint-only system prompt.
6. Backend returns concise hints; on failure, it returns a safe fallback hint.

## Production Deploy (No User Setup Required)

### A) Deploy API to Vercel

Deploy `server` as a Vercel Node service and set env vars:

- `HF_TOKEN`: your Hugging Face token
- `PORT`: optional (Vercel usually handles this)

After deploy, your API URL should be:

`https://helpcode-api.vercel.app`

The extension is configured to call:

`https://helpcode-api.vercel.app/api/hint`

### B) Build Chrome Extension Zip

```bash
cd frontend
npm install
npm run build
npm run zip
```

Output zip is in `frontend/.output/`.
Rename/copy it as `site/helpcode-chrome.zip`.

### C) Build Safari Package

Use converter on the built Chrome extension output:

```bash
xcrun safari-web-extension-converter /Users/jinnymoon/Documents/proj/helpcode/frontend/.output/chrome-mv3 --project-location /Users/jinnymoon/Documents/proj/helpcode/safari-project
```

Then in Xcode:

1. Open generated `.xcodeproj`.
2. Set Signing Team for app + extension targets.
3. Build and archive/export your Safari app package.
4. Add downloadable artifact to `site/helpcode-safari.zip`.

### D) Publish Download Website

```bash
cd site
npx vercel --prod
```

Your public download page:
[https://helpcode-download.vercel.app](https://helpcode-download.vercel.app)

## Local Development

For local debugging:

```bash
cd server
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

In dev mode, frontend tries localhost first, then production API.

## Security Notes

- Keep `HF_TOKEN` only on server-side environment variables.
- Never expose tokens in extension code.
- Keep `server/.env` out of git.

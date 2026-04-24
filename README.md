# helpcode

helpcode is a browser extension that appears on LeetCode problem pages and gives hints without revealing full solutions.

## Project Structure

- `frontend/`: WXT + React Chrome extension
- `server/`: Express API that calls Hugging Face

## Development

Run the backend:

```bash
cd server
npm run dev
```

Run the extension:

```bash
cd frontend
npm run dev
```

Build the extension:

```bash
cd frontend
npm run build
```

Create a zip for distribution:

```bash
cd frontend
npm run zip
```

## Environment

Create `server/.env`:

```bash
HF_TOKEN=your_hugging_face_token
PORT=8787
```

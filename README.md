# Frontend Pages Hub

This project now includes a simple local server to persist clone and external links in `links.json`.

## Run locally

1. Open a terminal in `c:\Users\hk639\Dropbox\Web_01\Frontend_pages`
2. Run:

```powershell
node server.js
```

3. Open `http://localhost:3000/` in your browser.

## How it works

- `links.json` stores your saved clone and external links.
- The page loads the list from `/links`.
- Adding, editing, or deleting links saves back to `links.json`.
- If the server is unavailable, the page falls back to browser `localStorage`.

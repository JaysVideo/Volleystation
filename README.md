# MLV Live Stats Dashboard

Live in-game volleyball stats dashboard for Major League Volleyball.
Pulls data from the VolleyStation API and displays a real-time scoreboard + player stat tables,
with one-click XML export for **Ross Xpression** and **Daktronics** scoreboards.

## Files

| File | Purpose |
|---|---|
| `index.html` | The dashboard — host on GitHub Pages |
| `proxy.js` | Local CORS proxy — run on your laptop during games |

## Setup

### 1. GitHub Pages
1. Push this repo to GitHub
2. Settings → Pages → Deploy from branch → main → / (root)
3. Dashboard lives at `https://YOUR-USERNAME.github.io/REPO-NAME/`

### 2. Game Day
```bash
node proxy.js   # run once, leave open all game
```
Then open your GitHub Pages URL, enter token + match ID, click ▶ Start.

Click **⌕ Lookup** if you need to find the Match ID from your Championship ID.
Click **⬇ XML** to open the XML panel — copy or download Xpression/Daktronics files.

## Security
Your API token stays in your browser's sessionStorage only (clears on tab close).
The proxy runs on localhost — your token never leaves your network.

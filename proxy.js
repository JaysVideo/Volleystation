#!/usr/bin/env node
/**
 * VolleyStation CORS Proxy
 * ─────────────────────────────────────────────────────────────────
 * Browsers cannot call the VolleyStation API directly due to CORS.
 * This tiny proxy runs locally and forwards requests on your behalf.
 *
 * Your API token stays on your machine — it never leaves your network.
 *
 * Usage:
 *   node proxy.js            (runs on port 3030)
 *   node proxy.js --port 3031
 *
 * No npm install needed. Uses only Node.js built-ins.
 * ─────────────────────────────────────────────────────────────────
 */

const http  = require("http");
const https = require("https");
const url   = require("url");

const args = process.argv.slice(2);
const PORT = parseInt(args[args.indexOf("--port") + 1] || "3030");

const VS_API = "https://panel.volleystation.com/api";

const server = http.createServer((req, res) => {
  // CORS headers — allow the GitHub Pages origin (and localhost for dev)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const parsed = url.parse(req.url, true);

  // Health check
  if (parsed.pathname === "/health") {
    res.writeHead(200, {"Content-Type":"application/json"});
    res.end(JSON.stringify({status:"ok", proxy:"VolleyStation CORS Proxy"}));
    return;
  }

  // Main proxy endpoint: GET /vs?path=match-stats-summary/12345&token=XXX
  if (parsed.pathname !== "/vs") {
    res.writeHead(404); res.end("Not found"); return;
  }

  const vsPath = parsed.query.path;
  const token  = parsed.query.token;

  if (!vsPath || !token) {
    res.writeHead(400, {"Content-Type":"application/json"});
    res.end(JSON.stringify({error:"Missing path or token parameter"}));
    return;
  }

  const targetUrl = `${VS_API}/${vsPath}`;
  console.log(`[${new Date().toLocaleTimeString()}] → ${targetUrl}`);

  const proxyReq = https.get(targetUrl, {
    headers: {
      "Authorization": `Token ${token}`,
      "Accept":        "application/json",
      "User-Agent":    "MLV-Dashboard-Proxy/1.0",
    }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      "Content-Type": proxyRes.headers["content-type"] || "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (e) => {
    console.error(`[ERROR] ${e.message}`);
    res.writeHead(502, {"Content-Type":"application/json"});
    res.end(JSON.stringify({error: e.message}));
  });

  proxyReq.setTimeout(15000, () => {
    proxyReq.destroy();
    res.writeHead(504, {"Content-Type":"application/json"});
    res.end(JSON.stringify({error: "Upstream timeout"}));
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n✅  VolleyStation CORS Proxy running at http://localhost:${PORT}`);
  console.log(`    Open the dashboard in your browser.`);
  console.log(`    Press Ctrl+C to stop.\n`);
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`\n❌  Port ${PORT} is already in use.`);
    console.error(`    Try: node proxy.js --port 3031\n`);
  } else {
    console.error(e.message);
  }
  process.exit(1);
});

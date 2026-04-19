/**
 * Local CORS proxy for Expo Web → Next.js API during development.
 * Browsers block cross-origin calls unless the API sends CORS headers; this proxy adds them.
 *
 * Usage:
 *   1. Start your API (e.g. Next on http://127.0.0.1:3000).
 *   2. Run: npm run dev:api-proxy
 *   3. Set EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3333 (or PROXY_PORT) in .env.local
 *   4. Restart Expo (env is baked at bundle time).
 *
 * Env: API_UPSTREAM (default http://127.0.0.1:3000), PROXY_PORT (default 3333)
 */
const http = require("node:http");
const httpProxy = require("http-proxy");

const target = process.env.API_UPSTREAM ?? "http://127.0.0.1:3000";
const port = Number(process.env.PROXY_PORT ?? 3333);

const proxy = httpProxy.createProxyServer({
  target,
  changeOrigin: true,
});

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  proxy.web(req, res);
});

proxy.on("error", (_err, req, res) => {
  if (res && !res.headersSent && typeof res.writeHead === "function") {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      "Proxy could not reach API_UPSTREAM. Is Next.js running on " +
        target +
        "?",
    );
  }
});

server.listen(port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(
    `[cors-proxy] http://127.0.0.1:${port}  →  ${target}\n` +
      "Set EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:" +
      port +
      " and restart Expo.",
  );
});

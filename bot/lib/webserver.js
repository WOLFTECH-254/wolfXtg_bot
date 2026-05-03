const http  = require('http');
const state = require('./state');

const PLATFORM_LABELS = {
  pterodactyl: 'Pterodactyl',
  heroku:      'Heroku',
  render:      'Render',
  railway:     'Railway',
  koyeb:       'Koyeb',
  replit:      'Replit',
  docker:      'Docker',
  local:       'Local',
};

function getUptime() {
  const ms = Date.now() - state.get().startTime;
  const s  = Math.floor(ms / 1000);
  const m  = Math.floor(s / 60);
  const h  = Math.floor(m / 60);
  const d  = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function statusJSON() {
  const s = state.get();
  return JSON.stringify({
    username: s.username,
    status:   s.status,
    platform: PLATFORM_LABELS[s.platform] || 'Local',
    cmdCount: s.cmdCount,
    uptime:   getUptime(),
  });
}

function statusHTML() {
  const s        = state.get();
  const platform = PLATFORM_LABELS[s.platform] || 'Local';
  const uptime   = getUptime();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>wolfXtg_bot — Status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --green:      #00ff41;
      --green-dim:  #00cc33;
      --green-dark: #003311;
      --bg:         #000000;
      --card-bg:    #030f03;
      --border:     #00ff41;
    }

    body {
      background: var(--bg);
      color: var(--green);
      font-family: 'Orbitron', monospace;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
    }

    /* scanline overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,255,65,0.03) 2px,
        rgba(0,255,65,0.03) 4px
      );
      pointer-events: none;
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 560px;
    }

    /* ── Header ── */
    .header {
      text-align: center;
      margin-bottom: 36px;
    }

    .header h1 {
      font-size: clamp(1.4rem, 5vw, 2.2rem);
      font-weight: 900;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--green);
      text-shadow:
        0 0 8px  var(--green),
        0 0 20px var(--green),
        0 0 40px var(--green-dim);
    }

    .header .sub {
      margin-top: 6px;
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      color: var(--green-dim);
      text-shadow: 0 0 6px var(--green-dim);
    }

    /* ── Status badge ── */
    .badge-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;
    }

    .badge {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 24px;
      border: 1px solid var(--green);
      border-radius: 2px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--green);
      box-shadow:
        0 0 8px  var(--green),
        inset 0 0 8px rgba(0,255,65,0.05);
    }

    .badge.offline {
      border-color: #ff3333;
      color:        #ff3333;
      box-shadow:   0 0 8px #ff3333, inset 0 0 8px rgba(255,51,51,0.05);
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 8px var(--green), 0 0 16px var(--green);
      animation: pulse 1.6s ease-in-out infinite;
    }

    .badge.offline .dot {
      background: #ff3333;
      box-shadow: 0 0 8px #ff3333;
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--green), 0 0 16px var(--green); }
      50%       { opacity: 0.4; box-shadow: 0 0 4px var(--green); }
    }

    /* ── Card ── */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--green);
      border-radius: 2px;
      padding: 0;
      overflow: hidden;
      box-shadow:
        0 0 16px rgba(0,255,65,0.15),
        inset 0 0 32px rgba(0,255,65,0.03);
    }

    .card-header {
      border-bottom: 1px solid var(--green-dark);
      padding: 10px 20px;
      font-size: 0.6rem;
      letter-spacing: 0.3em;
      color: var(--green-dim);
    }

    .row {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--green-dark);
      gap: 16px;
    }

    .row:last-child { border-bottom: none; }

    .row-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: var(--green-dim);
      text-transform: uppercase;
      width: 90px;
      flex-shrink: 0;
    }

    .row-value {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--green);
      text-shadow: 0 0 8px var(--green);
      word-break: break-all;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 28px;
      text-align: center;
      font-size: 0.55rem;
      letter-spacing: 0.25em;
      color: #003311;
    }

    .footer span {
      color: var(--green-dim);
      text-shadow: 0 0 6px var(--green-dim);
    }

    /* ── Corner decorations ── */
    .corners {
      position: relative;
    }
    .corners::before, .corners::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      border-color: var(--green);
      border-style: solid;
    }
    .corners::before { top: -4px; left: -4px; border-width: 2px 0 0 2px; }
    .corners::after  { top: -4px; right: -4px; border-width: 2px 2px 0 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>wolfXtg_bot</h1>
      <p class="sub">TELEGRAM BOT STATUS MONITOR</p>
    </div>

    <div class="badge-wrap">
      <div class="badge" id="badge">
        <div class="dot" id="dot"></div>
        <span id="statusText">${s.status}</span>
      </div>
    </div>

    <div class="corners card">
      <div class="card-header">// SYSTEM METRICS</div>

      <div class="row">
        <span class="row-label">Bot</span>
        <span class="row-value" id="username">@${s.username}</span>
      </div>
      <div class="row">
        <span class="row-label">Platform</span>
        <span class="row-value" id="platform">${platform}</span>
      </div>
      <div class="row">
        <span class="row-label">Commands</span>
        <span class="row-value" id="cmdCount">${s.cmdCount}</span>
      </div>
      <div class="row">
        <span class="row-label">Uptime</span>
        <span class="row-value" id="uptime">${uptime}</span>
      </div>
    </div>

    <div class="footer">
      AUTO-REFRESH EVERY 10s &nbsp;|&nbsp; <span id="lastUpdate">--:--:--</span>
    </div>
  </div>

  <script>
    function tick() {
      const now = new Date();
      document.getElementById('lastUpdate').textContent =
        now.toTimeString().slice(0, 8);
    }

    async function refresh() {
      try {
        const res  = await fetch('/api/status');
        const data = await res.json();

        document.getElementById('username').textContent  = '@' + data.username;
        document.getElementById('platform').textContent  = data.platform;
        document.getElementById('cmdCount').textContent  = data.cmdCount;
        document.getElementById('uptime').textContent    = data.uptime;

        const badge = document.getElementById('badge');
        const dot   = document.getElementById('dot');
        const txt   = document.getElementById('statusText');

        txt.textContent = data.status;
        if (data.status === 'ONLINE') {
          badge.classList.remove('offline');
          dot.style.background = 'var(--green)';
        } else {
          badge.classList.add('offline');
        }
      } catch {
        document.getElementById('badge').classList.add('offline');
        document.getElementById('statusText').textContent = 'UNREACHABLE';
      }
      tick();
    }

    tick();
    refresh();
    setInterval(refresh, 10000);
  </script>
</body>
</html>`;
}

function startWebServer() {
  const port = parseInt(process.env.WEB_PORT || process.env.PORT || '3000', 10);

  const server = http.createServer((req, res) => {
    if (req.url === '/api/status') {
      res.writeHead(200, {
        'Content-Type':  'application/json',
        'Cache-Control': 'no-cache',
      });
      return res.end(statusJSON());
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(statusHTML());
  });

  server.listen(port);
  return server;
}

module.exports = { startWebServer };

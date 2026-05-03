const fs = require('fs');
const path = require('path');

const ENV_PATH = path.resolve(__dirname, '../../.env');

// ── Source 1: .env file (Pterodactyl, VPS, local) ──────────
require('dotenv').config({ path: ENV_PATH });

// ── Source 2: app.json value fields (Heroku) ───────────────
if (!process.env.TELEGRAM_BOT_TOKEN) {
  try {
    const appJsonPath = path.resolve(__dirname, '../../app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

    if (appJson.env && typeof appJson.env === 'object') {
      for (const [key, conf] of Object.entries(appJson.env)) {
        if (!process.env[key] && conf.value && conf.value.trim()) {
          process.env[key] = conf.value.trim();
        }
      }
    }
  } catch {
    // app.json not present or not readable — skip silently
  }
}

// ── Source 3: process.env (Render, Railway, Docker, etc.) ──
// Already in process.env from platform injection — nothing to do.

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

module.exports = { BOT_TOKEN };

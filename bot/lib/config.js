const fs = require('fs');
const path = require('path');

const ENV_PATH = path.resolve(__dirname, '../../.env');

// ── Auto-create .env if missing ────────────────────────────
// On first run (fresh clone or new Pterodactyl install),
// write a ready-to-fill template so the user doesn't have
// to create the file manually.
if (!fs.existsSync(ENV_PATH)) {
  const template = [
    '# ─────────────────────────────────────────────────────────────',
    '#  wolfXtg Bot — Configuration',
    '# ─────────────────────────────────────────────────────────────',
    '#',
    '#  1. Paste your bot token below  (get it from @BotFather)',
    '#  2. Save this file',
    '#  3. Start the bot',
    '# ─────────────────────────────────────────────────────────────',
    '',
    'TELEGRAM_BOT_TOKEN=',
    '',
    '# Optional: Tenor GIF API key (built-in key used if left blank)',
    '# Free key at: https://developers.google.com/tenor/guides/quickstart',
    'TENOR_API_KEY=',
    '',
  ].join('\n');

  try {
    fs.writeFileSync(ENV_PATH, template, 'utf8');
    console.log('');
    console.log('\x1b[1;32m┌──────────────────────────────────────────────┐\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m  \x1b[1mFirst run detected — .env file created!\x1b[0m       \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m                                              \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m  Open \x1b[33m.env\x1b[0m and paste your bot token:           \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m  \x1b[90mTELEGRAM_BOT_TOKEN=your_token_here\x1b[0m        \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m                                              \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m  Then start the bot again.                    \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m└──────────────────────────────────────────────┘\x1b[0m');
    console.log('');
  } catch (e) {
    console.log('\x1b[31m[ERROR]\x1b[0m Could not create .env — ' + e.message);
  }
}

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

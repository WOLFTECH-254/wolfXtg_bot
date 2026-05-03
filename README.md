<div align="center">

<img src="https://i.ibb.co/GvPX7vdk/Chat-GPT-Image-May-3-2026-01-15-12-PM.png" alt="wolfXtg Bot" width="200"/>

# wolfXtg Bot

**A powerful Telegram automation bot with group management, media downloads, WhatsApp pairing, and more.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-blue?style=flat-square&logo=telegram)](https://t.me/wolfXtg_bot)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## Features

- **48 commands** across 5 categories
- Group management — ban, kick, mute, warn, promote, demote
- Media downloads — YouTube MP3, MP4, lyrics, GIFs, trending
- WhatsApp session pairing via pairing code
- Anti-link, anti-leave, bad word filters
- Admin-only mode gate
- Auto platform detection (Pterodactyl, Heroku, Render, Railway, Docker, local)

---

## Commands

### 🎵 Music & Media
| Command | Description |
|---|---|
| `/play <song>` | Search and send MP3 audio directly in chat |
| `/video <name>` | Search and send MP4 video directly in chat |
| `/dl <name>` | Get both MP3 and MP4 download links |
| `/song <name>` | Browse YouTube Music results |
| `/lyrics <song>` | Fetch full song lyrics |
| `/trending` | Show today's trending music chart |
| `/gif <query>` | Search and send an animated GIF |

### 👥 Group Management
| Command | Description |
|---|---|
| `/add` | Generate a group invite link |
| `/promote @user` | Promote a user to admin |
| `/promoteall` | Promote all members to admin |
| `/demote @user` | Remove admin from a user |
| `/demoteall` | Remove admin from all users |
| `/kick @user` | Remove a user from the group |
| `/kickall` | Remove all non-admin members |
| `/ban @user` | Ban a user from the group |
| `/unban @user` | Unban a user |
| `/clearbanlist` | Clear all banned users |
| `/mute @user` | Mute a user |
| `/unmute @user` | Unmute a user |
| `/warn @user` | Issue a warning to a user |
| `/resetwarn @user` | Reset a user's warnings |
| `/setwarn <number>` | Set max warnings before action |
| `/warnings @user` | Check a user's warning count |

### ⚙️ Group Settings
| Command | Description |
|---|---|
| `/setgroupname <name>` | Change the group title |
| `/setgpp <url>` | Set group photo from an image URL |
| `/setdesc <text>` | Set or clear the group description |
| `/welcome <message>` | Set a welcome message (use `{name}` for user) |
| `/goodbye <message>` | Set a goodbye message |
| `/joinapproval on/off` | Toggle join request approval |
| `/onlyadmins on/off` | Restrict messaging to admins only |
| `/mode admins/public` | Toggle admin-only bot command mode |
| `/gctime` | Show group info and creation time |
| `/rules <text>` | Set group rules |
| `/leave` | Make the bot leave the group |
| `/creategroup` | Create a new group |

### 🚫 Filters
| Command | Description |
|---|---|
| `/antilink on/off` | Block links posted in the group |
| `/antileave on/off` | Notify when a member leaves |
| `/addbadword <word>` | Add a word to the bad word filter |
| `/removebadword <word>` | Remove a word from the filter |
| `/listbadword` | List all filtered words |

### 🔹 Basic Commands
| Command | Description |
|---|---|
| `/start` | Start the bot |
| `/menu` | Show the full interactive menu |
| `/help` | Show help categories |
| `/ping` | Check if the bot is online |
| `/info` | Show bot information |
| `/id` | Get your user or group ID |
| `/echo <text>` | Repeat a message |

### 📱 WhatsApp
| Command | Description |
|---|---|
| `/pair <phone>` | Generate a WhatsApp pairing code (include country code, no +) |

---

## Setup

### 1. Get a Bot Token

Talk to [@BotFather](https://t.me/BotFather) on Telegram, create a new bot, and copy the token.

### 2. Add Your Token

Open the `.env` file in the project root and paste your token:

```env
TELEGRAM_BOT_TOKEN=your_token_here
```

### 3. Install & Run

```bash
npm install
node bot/index.js
```

---

## Deployment

### 🦕 Pterodactyl
1. Import `deploy/pterodactyl-egg.json` via **Admin → Nests → Import Egg**
2. Create a server using the egg
3. Set your bot token in the **Bot Token** variable
4. Install → Start

### 🟣 Heroku
1. Click **Deploy to Heroku** or push to your Heroku remote
2. Open `app.json` and paste your token in the `value` field:
   ```json
   "TELEGRAM_BOT_TOKEN": { "value": "your_token_here" }
   ```
3. Deploy — the worker dyno starts automatically

### 🟦 Render
1. Connect your GitHub repo on [render.com](https://render.com)
2. Add `TELEGRAM_BOT_TOKEN` under **Environment Variables**
3. Deploy

### 🚂 Railway
1. Import your repo on [railway.app](https://railway.app)
2. Add `TELEGRAM_BOT_TOKEN` under **Variables**
3. Deploy

### 🐳 Docker
```bash
docker build -t wolfxtg-bot .
docker run -e TELEGRAM_BOT_TOKEN=your_token_here wolfxtg-bot
```

### 💻 VPS / Local
```bash
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
npm install
# Edit .env and add your token
node bot/index.js
```

For persistent VPS deployment, copy the systemd service file:
```bash
cp deploy/wolfxtg.service /etc/systemd/system/
systemctl enable wolfxtg
systemctl start wolfxtg
```

---

## Configuration

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ Yes | Your bot token from @BotFather |
| `TENOR_API_KEY` | ❌ Optional | Tenor API key for GIF search (built-in key used if blank) |

---

## Notes

- The bot must be added as an **admin** in a group to use management commands
- Commands that change group info (`/setgroupname`, `/setgpp`, `/setdesc`) require the bot to have the **Change group info** admin permission
- Bot data (group settings, warns, filters) is stored in `bot/data/store.json` — back this up if you want to preserve settings across reinstalls

---

<div align="center">

Made with ❤️ by **wolfXtg**

</div>

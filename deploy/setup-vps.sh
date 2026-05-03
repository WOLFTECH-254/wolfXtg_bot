#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  wolfXtg Bot — VPS Auto-Setup Script
#  Supports: Ubuntu 20.04 / 22.04 / Debian 11+
#
#  Usage:
#    chmod +x setup-vps.sh
#    ./setup-vps.sh
# ─────────────────────────────────────────────────────────────

set -e

GREEN='\033[1;32m'
GRAY='\033[0;90m'
RED='\033[0;31m'
NC='\033[0m'

log()   { echo -e "${GREEN}┌─[ wolfXtg ]${NC} $1"; }
info()  { echo -e "${GRAY}│  $1${NC}"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
done_() { echo -e "${GREEN}└─ $1${NC}"; }

echo ""
log "wolfXtg Bot — VPS Setup"
info "Starting installation..."
echo ""

# ── Node.js ────────────────────────────────────────────────
log "Installing Node.js 20..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  done_ "Node.js $(node -v) installed"
else
  info "Node.js $(node -v) already installed — skipping"
fi

# ── pnpm ───────────────────────────────────────────────────
log "Installing pnpm..."
if ! command -v pnpm &>/dev/null; then
  npm install -g pnpm
  done_ "pnpm $(pnpm -v) installed"
else
  info "pnpm $(pnpm -v) already installed — skipping"
fi

# ── PM2 ────────────────────────────────────────────────────
log "Installing PM2..."
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
  done_ "PM2 installed"
else
  info "PM2 already installed — skipping"
fi

# ── Repository ─────────────────────────────────────────────
INSTALL_DIR="$HOME/wolfxtg-bot"
log "Setting up bot directory at $INSTALL_DIR..."

if [ -d "$INSTALL_DIR/.git" ]; then
  info "Existing installation found — pulling latest..."
  cd "$INSTALL_DIR" && git pull
else
  read -rp "  Enter your GitHub repo URL (or press Enter to skip): " REPO_URL
  if [ -n "$REPO_URL" ]; then
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  else
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    info "Skipped clone — copy your bot files to $INSTALL_DIR manually."
  fi
fi

done_ "Directory ready"

# ── Dependencies ───────────────────────────────────────────
log "Installing bot dependencies..."
cd "$INSTALL_DIR"
pnpm install --filter @workspace/telegram-bot --prod
mkdir -p bot/data
done_ "Dependencies installed"

# ── Environment ────────────────────────────────────────────
log "Configuring environment..."
if [ ! -f "$INSTALL_DIR/.env" ]; then
  read -rp "  Enter your TELEGRAM_BOT_TOKEN: " BOT_TOKEN
  echo "TELEGRAM_BOT_TOKEN=$BOT_TOKEN" > "$INSTALL_DIR/.env"
  done_ ".env file created"
else
  info ".env already exists — skipping"
fi

# ── PM2 startup ────────────────────────────────────────────
log "Starting bot with PM2..."
cd "$INSTALL_DIR"
pm2 start ecosystem.config.js
pm2 save

log "Setting PM2 to start on reboot..."
pm2 startup | tail -1 | bash || info "Run the pm2 startup command above manually if needed."

echo ""
echo -e "${GREEN}┌─[ wolfXtg Bot ]─────────────────────────────"
echo -e "│  ✅  Bot is now running via PM2"
echo -e "│"
echo -e "│  pm2 logs wolfxtg-bot     ← live logs"
echo -e "│  pm2 restart wolfxtg-bot  ← restart"
echo -e "│  pm2 stop wolfxtg-bot     ← stop"
echo -e "└─────────────────────────────────────────────${NC}"
echo ""

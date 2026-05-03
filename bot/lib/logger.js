const G  = '\x1b[32m';   // green
const GB = '\x1b[1;32m'; // green bold
const DG = '\x1b[2;32m'; // green dim
const R  = '\x1b[0m';    // reset
const RD = '\x1b[31m';   // red
const YL = '\x1b[33m';   // yellow
const GR = '\x1b[90m';   // gray

const BRAND = 'wolfXtg_bot';
const W = 34; // inner width (between the two │)

function time() {
  return new Date().toTimeString().slice(0, 8);
}

function strip(s) {
  return String(s).replace(/\x1b\[[0-9;]*m/g, '');
}

function rpad(s, len) {
  const vis = strip(s).length;
  return s + ' '.repeat(Math.max(0, len - vis));
}

function topLine() {
  return `${GB}┌─[ ${BRAND} ]${'─'.repeat(W - BRAND.length - 4)}${R}`;
}

function midLine(label, value) {
  const inner = `  ${GB}${label}${R}  ${G}${value}${R}`;
  return `${GB}│${R}${inner}`;
}

function sepLine() {
  return `${GB}│${'─'.repeat(W)}${R}`;
}

function botLine() {
  return `${GB}└${'─'.repeat(W)}${R}`;
}

const PLATFORM_LABELS = {
  pterodactyl: '🦕 Pterodactyl',
  heroku:      '🟣 Heroku',
  render:      '🟦 Render',
  railway:     '🚂 Railway',
  koyeb:       '🌐 Koyeb',
  replit:      '♻️  Replit',
  docker:      '🐳 Docker',
  local:       '💻 Local',
};

const logger = {
  banner: (username, cmdCount, platform) => {
    const tag       = `@${username}`;
    const sub       = `${cmdCount} commands`;
    const platLabel = PLATFORM_LABELS[platform] || '💻 Local';
    console.log('');
    console.log(topLine());
    console.log(midLine('BOT ', BRAND));
    console.log(midLine('STAT', 'ONLINE'));
    console.log(midLine('USER', tag));
    console.log(midLine('CMDS', sub));
    console.log(midLine('HOST', platLabel));
    console.log(botLine());
    console.log('');
  },

  cmd: (username, command, chatTitle) => {
    const where = chatTitle ? ` ${DG}in${R} ${G}${chatTitle}${R}` : '';
    const user  = username ? ` ${DG}by${R} ${G}@${username}${R}` : '';
    console.log(`${GB}→${R} ${GB}/${command}${R}${user}${where} ${GR}${time()}${R}`);
  },

  error: (msg) => {
    console.log(`${RD}[ERROR]${R} ${GR}${time()}${R} ${msg}`);
  },

  warn: (msg) => {
    console.log(`${YL}[WARN]${R}  ${GR}${time()}${R} ${msg}`);
  },

  info: (msg) => {
    console.log(`${DG}[wolfXtg_bot]${R} ${GR}${time()}${R} ${msg}`);
  },

  success: (msg) => {
    console.log(`${G}[wolfXtg_bot]${R} ${GR}${time()}${R} ${msg}`);
  },
};

module.exports = logger;

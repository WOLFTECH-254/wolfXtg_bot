const G  = '\x1b[32m';   // green
const GB = '\x1b[1;32m'; // green bold
const DG = '\x1b[2;32m'; // green dim
const R  = '\x1b[0m';    // reset
const RD = '\x1b[31m';   // red
const YL = '\x1b[33m';   // yellow
const GR = '\x1b[90m';   // gray

const BRAND = 'wolfXtg_bot';
const W = 44; // inner width (between the two │)

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
  return `${GB}┌─[ ${BRAND} ]${'─'.repeat(W - BRAND.length - 4)}┐${R}`;
}

function midLine(label, value) {
  const inner = `  ${GB}${label}${R}  ${G}${value}${R}`;
  const visLen = 2 + strip(label).length + 2 + strip(String(value)).length;
  const pad = ' '.repeat(Math.max(0, W - visLen));
  return `${GB}│${R}${inner}${pad}${GB}│${R}`;
}

function sepLine() {
  return `${GB}│${'─'.repeat(W)}│${R}`;
}

function botLine() {
  return `${GB}└${'─'.repeat(W)}┘${R}`;
}

const logger = {
  banner: (username, cmdCount) => {
    const tag = `@${username}`;
    const sub = `${cmdCount} commands loaded`;
    console.log('');
    console.log(topLine());
    console.log(midLine('🐺', BRAND));
    console.log(midLine('✅', 'BOT IS ONLINE'));
    console.log(midLine('👤', tag));
    console.log(midLine('📦', sub));
    console.log(botLine());
    console.log('');
  },

  cmd: (username, command, chatTitle) => {
    const ts = time();
    console.log(topLine());
    console.log(midLine('CMD ', `/${command}`));
    console.log(midLine('USER', `@${username}`));
    console.log(midLine('CHAT', chatTitle || 'Private'));
    console.log(midLine('TIME', ts));
    console.log(botLine());
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

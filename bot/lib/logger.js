const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} ${msg}`),
  cmd: (user, command) => console.log(`${colors.green}[CMD]${colors.reset} ${colors.gray}${timestamp()}${colors.reset} @${user} → ${command}`),
};

module.exports = logger;

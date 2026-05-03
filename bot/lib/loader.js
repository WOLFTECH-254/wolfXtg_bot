const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Auto-loads all command files from the commands/ directory and its
 * sub-folders. Each file must export a { command, handler } object or
 * an array of those objects.
 *
 * Example export:
 *   module.exports = { command: 'start', handler: (bot, msg) => { ... } };
 */
function loadCommands(bot, commandsDir) {
  let total = 0;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const exports = require(fullPath);
          const items = Array.isArray(exports) ? exports : [exports];

          for (const item of items) {
            if (!item.command || typeof item.handler !== 'function') {
              logger.warn(`Skipping ${fullPath} — missing command or handler`);
              continue;
            }

            bot.onText(new RegExp(`^\\/${item.command}(?:@\\w+)?(?:\\s|$)`, 'i'), (msg, match) => {
              item.handler(bot, msg, match);
            });

            logger.success(`Loaded /${item.command} from ${path.relative(commandsDir, fullPath)}`);
            total++;
          }
        } catch (err) {
          logger.error(`Failed to load ${fullPath}: ${err.message}`);
        }
      }
    }
  }

  walk(commandsDir);
  logger.info(`Total commands loaded: ${total}`);
}

module.exports = { loadCommands };

const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const store = require('./store');
const { isAdmin } = require('./helpers');

const ADMIN_EXEMPT = new Set(['mode', 'start', 'help', 'menu', 'ping', 'info', 'id', 'echo']);

/**
 * Auto-loads all command files from the commands/ directory and its
 * sub-folders. Each file must export a { command, handler } object or
 * an array of those objects.
 *
 * Global mode gate: if a group has adminmode ON, only admins can trigger
 * commands (except commands in ADMIN_EXEMPT which always work).
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

            bot.onText(new RegExp(`^\\/${item.command}(?:@\\w+)?(?:\\s|$)`, 'i'), async (msg, match) => {
              const chatId = msg.chat.id;
              const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

              if (isGroup && !ADMIN_EXEMPT.has(item.command)) {
                const adminMode = store.getChat(chatId, 'adminmode', false);
                if (adminMode) {
                  const senderIsAdmin = await isAdmin(bot, chatId, msg.from.id).catch(() => false);
                  if (!senderIsAdmin) return;
                }
              }

              item.handler(bot, msg, match);
            });

            total++;
          }
        } catch (err) {
          logger.error(`Failed to load ${fullPath}: ${err.message}`);
        }
      }
    }
  }

  walk(commandsDir);
  return total;
}

module.exports = { loadCommands };

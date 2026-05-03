require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const logger = require('./lib/logger');
const { loadCommands } = require('./lib/loader');
const menus = require('./lib/menus');
const { getSenderName } = require('./lib/helpers');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN is not set. Please add it to your environment secrets.');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

logger.info('Starting bot...');

const commandsDir = path.join(__dirname, 'commands');
loadCommands(bot, commandsDir);

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id).catch(() => {});

  if (data.startsWith('menu:')) {
    const key = data.replace('menu:', '');

    if (key === 'start') {
      const name = getSenderName({ from: query.from });
      const menu = menus.start(name);
      return bot.editMessageText(menu.text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: menu.keyboard,
      }).catch(() => {});
    }

    const menu = menus[key];
    if (menu) {
      return bot.editMessageText(menu.text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: menu.keyboard,
      }).catch(() => {});
    }
  }

  if (data.startsWith('cmd:')) {
    const cmd = data.replace('cmd:', '');
    const hint = menus.cmdHints[cmd];
    if (hint) {
      return bot.editMessageText(hint, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '⬅️ Back to Home', callback_data: 'menu:start' },
          ]],
        },
      }).catch(() => {});
    }
  }

  logger.warn(`Unhandled callback: ${data}`);
});

bot.on('polling_error', (err) => {
  logger.error(`Polling error: ${err.message}`);
});

bot.on('error', (err) => {
  logger.error(`Bot error: ${err.message}`);
});

bot.getMe().then((me) => {
  logger.success(`Bot is running as @${me.username} (ID: ${me.id})`);
}).catch((err) => {
  logger.error(`Failed to get bot info: ${err.message}`);
});

process.on('SIGINT', () => {
  logger.warn('Shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.warn('Shutting down...');
  bot.stopPolling();
  process.exit(0);
});

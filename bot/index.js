require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const logger = require('./lib/logger');
const { loadCommands } = require('./lib/loader');
const menus = require('./lib/menus');
const store = require('./lib/store');
const { getSenderName, isAdmin } = require('./lib/helpers');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN is not set.');
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
        chat_id: chatId, message_id: messageId,
        parse_mode: 'Markdown', reply_markup: menu.keyboard,
      }).catch(() => {});
    }

    const menu = menus[key];
    if (menu) {
      return bot.editMessageText(menu.text, {
        chat_id: chatId, message_id: messageId,
        parse_mode: 'Markdown', reply_markup: menu.keyboard,
      }).catch(() => {});
    }
  }

  if (data.startsWith('cmd:')) {
    const cmd = data.replace('cmd:', '');
    const hint = menus.cmdHints[cmd];
    if (hint) {
      return bot.editMessageText(hint, {
        chat_id: chatId, message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'menu:start' }]] },
      }).catch(() => {});
    }
  }

  if (data.startsWith('copycode:')) {
    const code = data.replace('copycode:', '');
    await bot.answerCallbackQuery(query.id, { text: `Code copied: ${code}`, show_alert: true }).catch(() => {});
    return bot.sendMessage(chatId, `\`${code}\``, { parse_mode: 'Markdown' }).catch(() => {});
  }

  if (data.startsWith('repairme:')) {
    const phone = data.replace('repairme:', '');
    const { runPair } = require('./commands/pair/pair');
    await bot.answerCallbackQuery(query.id, { text: '🔄 Requesting new code...' }).catch(() => {});
    return runPair(bot, chatId, phone, messageId);
  }
});

bot.on('message', async (msg) => {
  if (!msg.text || !msg.chat || msg.from?.is_bot) return;

  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  const senderIsAdmin = await isAdmin(bot, chatId, msg.from.id).catch(() => false);
  if (senderIsAdmin) return;

  const antilink = store.getChat(chatId, 'antilink', false);
  if (antilink) {
    const linkPattern = /(https?:\/\/|t\.me\/|telegram\.me\/|bit\.ly\/)/i;
    if (linkPattern.test(msg.text)) {
      try {
        await bot.deleteMessage(chatId, msg.message_id);
        const warn = await bot.sendMessage(chatId,
          `🔗 *Anti-Link:* Links are not allowed in this group, ${getSenderName(msg)}.`,
          { parse_mode: 'Markdown' });
        setTimeout(() => bot.deleteMessage(chatId, warn.message_id).catch(() => {}), 5000);
      } catch {}
      return;
    }
  }

  const badwords = store.getChat(chatId, 'badwords', []);
  if (badwords.length > 0) {
    const found = badwords.find(w => text.includes(w));
    if (found) {
      try {
        await bot.deleteMessage(chatId, msg.message_id);
        const warn = await bot.sendMessage(chatId,
          `🚫 *Bad word detected*, ${getSenderName(msg)}. Message removed.`,
          { parse_mode: 'Markdown' });
        setTimeout(() => bot.deleteMessage(chatId, warn.message_id).catch(() => {}), 5000);
      } catch {}
      return;
    }
  }
});

bot.on('chat_member', async (update) => {
  const chatId = update.chat.id;
  const member = update.new_chat_member;
  const old = update.old_chat_member;

  const joined = old?.status === 'left' && member?.status === 'member';
  const left = old?.status === 'member' && member?.status === 'left';

  if (joined) {
    const welcomeMsg = store.getChat(chatId, 'welcome', null);
    if (welcomeMsg) {
      const user = member.user;
      const name = user.username ? `@${user.username}` : user.first_name;
      const text = welcomeMsg.replace('{name}', name);
      bot.sendMessage(chatId, text, { parse_mode: 'Markdown' }).catch(() => {});
    }
  }

  if (left) {
    const goodbyeMsg = store.getChat(chatId, 'goodbye', null);
    if (goodbyeMsg) {
      const user = member.user;
      const name = user.username ? `@${user.username}` : user.first_name;
      const text = goodbyeMsg.replace('{name}', name);
      bot.sendMessage(chatId, text, { parse_mode: 'Markdown' }).catch(() => {});
    }

    const antileave = store.getChat(chatId, 'antileave', false);
    if (antileave) {
      try {
        const link = await bot.exportChatInviteLink(chatId);
        bot.sendMessage(chatId,
          `👋 *${member.user.first_name}* just left.\n🔗 [Re-invite them](${link})`,
          { parse_mode: 'Markdown' }).catch(() => {});
      } catch {}
    }
  }
});

bot.on('polling_error', (err) => logger.error(`Polling error: ${err.message}`));
bot.on('error', (err) => logger.error(`Bot error: ${err.message}`));

bot.getMe().then((me) => {
  logger.success(`Bot is running as @${me.username} (ID: ${me.id})`);
}).catch((err) => logger.error(`Failed to get bot info: ${err.message}`));

process.on('SIGINT', () => { logger.warn('Shutting down...'); bot.stopPolling(); process.exit(0); });
process.on('SIGTERM', () => { logger.warn('Shutting down...'); bot.stopPolling(); process.exit(0); });

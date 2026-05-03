const { safeReply, isGroup, isAdmin, getSenderName } = require('../../lib/helpers');
const store = require('../../lib/store');

const DEFAULT_MAX = 3;

function getWarnData(chatId, userId) {
  return store.getUser(chatId, userId, 'warns', { count: 0, reasons: [] });
}

function setWarnData(chatId, userId, data) {
  store.setUser(chatId, userId, 'warns', data);
}

function getMaxWarns(chatId) {
  return store.getChat(chatId, 'maxwarns', DEFAULT_MAX);
}

async function getTarget(bot, msg) {
  if (msg.reply_to_message) return msg.reply_to_message.from;
  const parts = msg.text.split(' ');
  const mention = parts[1];
  if (mention && mention.startsWith('@')) {
    try {
      const m = await bot.getChatMember(msg.chat.id, mention.replace('@', ''));
      return m.user;
    } catch { return null; }
  }
  return null;
}

const warn = {
  command: 'warn',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user to warn.');

    const parts = msg.text.split(' ');
    const reason = parts.slice(2).join(' ') || 'No reason given';
    const chatId = msg.chat.id;
    const max = getMaxWarns(chatId);

    const data = getWarnData(chatId, target.id);
    data.count += 1;
    data.reasons.push(reason);
    setWarnData(chatId, target.id, data);

    const name = target.username ? `@${target.username}` : target.first_name;

    if (data.count >= max) {
      await safeReply(bot, chatId,
        `⚠️ *${name}* has been warned by ${getSenderName(msg)}\n` +
        `📝 Reason: ${reason}\n` +
        `🔢 Warns: *${data.count}/${max}* — Auto-banning!`);
      try {
        await bot.banChatMember(chatId, target.id);
        setWarnData(chatId, target.id, { count: 0, reasons: [] });
      } catch {}
    } else {
      await safeReply(bot, chatId,
        `⚠️ *${name}* has been warned by ${getSenderName(msg)}\n` +
        `📝 Reason: ${reason}\n` +
        `🔢 Warns: *${data.count}/${max}*`);
    }
  },
};

const resetwarn = {
  command: 'resetwarn',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user.');

    setWarnData(msg.chat.id, target.id, { count: 0, reasons: [] });
    const name = target.username ? `@${target.username}` : target.first_name;
    await safeReply(bot, msg.chat.id, `✅ Warnings for *${name}* have been reset.`);
  },
};

const setwarn = {
  command: 'setwarn',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const parts = msg.text.split(' ');
    const num = parseInt(parts[1]);
    if (!num || num < 1 || num > 20)
      return safeReply(bot, msg.chat.id, '⚠️ Usage: `/setwarn <1-20>`');

    store.setChat(msg.chat.id, 'maxwarns', num);
    await safeReply(bot, msg.chat.id, `✅ Max warnings set to *${num}*.`);
  },
};

const warnings = {
  command: 'warnings',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');

    const target = await getTarget(bot, msg);
    const userId = target ? target.id : msg.from.id;
    const userName = target
      ? (target.username ? `@${target.username}` : target.first_name)
      : getSenderName(msg);

    const data = getWarnData(msg.chat.id, userId);
    const max = getMaxWarns(msg.chat.id);

    let text = `📋 *Warnings for ${userName}*\n`;
    text += `🔢 Count: *${data.count}/${max}*\n\n`;

    if (data.reasons.length > 0) {
      data.reasons.forEach((r, i) => {
        text += `${i + 1}. ${r}\n`;
      });
    } else {
      text += '_No warnings recorded._';
    }

    await safeReply(bot, msg.chat.id, text);
  },
};

module.exports = [warn, resetwarn, setwarn, warnings];

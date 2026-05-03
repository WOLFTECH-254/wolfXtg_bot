const { safeReply, isGroup, isAdmin, getSenderName } = require('../../lib/helpers');
const { buildBox } = require('../../lib/box');
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

function userName(user) {
  return user.username ? `@${user.username}` : user.first_name;
}

const warn = {
  command: 'warn',
  handler: async (bot, msg) => {
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['Groups only.']));
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']));

    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ WARN', ['Reply to or mention a user to warn.']));

    const parts = msg.text.split(' ');
    const reason = (msg.reply_to_message ? parts.slice(1) : parts.slice(2)).join(' ') || 'No reason given';
    const chatId = msg.chat.id;
    const max = getMaxWarns(chatId);

    const data = getWarnData(chatId, target.id);
    data.count += 1;
    data.reasons.push(reason);
    setWarnData(chatId, target.id, data);

    const name = userName(target);

    if (data.count >= max) {
      await safeReply(bot, chatId, buildBox('⚠️ WARNED — AUTO BAN', [
        `User:   ${name}`,
        `By:     ${getSenderName(msg)}`,
        `Reason: ${reason}`,
        `Warns:  ${data.count}/${max}  MAX REACHED`,
        null,
        'User has been auto-banned.',
      ]));
      try {
        await bot.banChatMember(chatId, target.id);
        setWarnData(chatId, target.id, { count: 0, reasons: [] });
      } catch {}
    } else {
      await safeReply(bot, chatId, buildBox('⚠️ WARNED', [
        `User:   ${name}`,
        `By:     ${getSenderName(msg)}`,
        `Reason: ${reason}`,
        `Warns:  ${data.count}/${max}`,
      ]));
    }
  },
};

const resetwarn = {
  command: 'resetwarn',
  handler: async (bot, msg) => {
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['Groups only.']));
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']));

    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ RESETWARN', ['Reply to or mention a user.']));

    setWarnData(msg.chat.id, target.id, { count: 0, reasons: [] });
    await safeReply(bot, msg.chat.id, buildBox('✅ WARNS CLEARED', [
      `User:   ${userName(target)}`,
      `By:     ${getSenderName(msg)}`,
      null,
      'All warnings have been reset.',
    ]));
  },
};

const setwarn = {
  command: 'setwarn',
  handler: async (bot, msg) => {
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['Groups only.']));
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']));

    const parts = msg.text.split(' ');
    const num = parseInt(parts[1]);
    if (!num || num < 1 || num > 20)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ SETWARN', [
        'Usage: /setwarn <1-20>',
        null,
        'Example: /setwarn 3',
      ]));

    store.setChat(msg.chat.id, 'maxwarns', num);
    await safeReply(bot, msg.chat.id, buildBox('✅ WARN LIMIT SET', [
      `Max warns: ${num}`,
      null,
      'Members will be auto-banned',
      `after ${num} warnings.`,
    ]));
  },
};

const warnings = {
  command: 'warnings',
  handler: async (bot, msg) => {
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['Groups only.']));

    const target = await getTarget(bot, msg);
    const userId = target ? target.id : msg.from.id;
    const name = target ? userName(target) : getSenderName(msg);

    const data = getWarnData(msg.chat.id, userId);
    const max = getMaxWarns(msg.chat.id);

    const rows = [
      `User:   ${name}`,
      `Warns:  ${data.count}/${max}`,
      null,
    ];

    if (data.reasons.length > 0) {
      rows.push('Reasons:');
      data.reasons.forEach((r, i) => rows.push(`  ${i + 1}. ${r}`));
    } else {
      rows.push('No warnings recorded.');
    }

    await safeReply(bot, msg.chat.id, buildBox('📋 WARNINGS', rows));
  },
};

module.exports = [warn, resetwarn, setwarn, warnings];

const { safeReply, isGroup, isAdmin } = require('../../lib/helpers');
const store = require('../../lib/store');

function toggle(chatId, ns, label) {
  const current = store.getChat(chatId, ns, false);
  const next = !current;
  store.setChat(chatId, ns, next);
  return next;
}

const antileave = {
  command: 'antileave',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const on = toggle(msg.chat.id, 'antileave', 'Anti-Leave');
    await safeReply(bot, msg.chat.id,
      `${on ? '✅' : '❌'} *Anti-Leave* is now *${on ? 'ON' : 'OFF'}*.\n` +
      (on ? '_Members who leave will be notified and re-invited if possible._' : ''));
  },
};

const antilink = {
  command: 'antilink',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const on = toggle(msg.chat.id, 'antilink', 'Anti-Link');
    await safeReply(bot, msg.chat.id,
      `${on ? '✅' : '❌'} *Anti-Link* is now *${on ? 'ON' : 'OFF'}*.\n` +
      (on ? '_Messages containing links will be auto-deleted._' : ''));
  },
};

const addbadword = {
  command: 'addbadword',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const parts = msg.text.split(' ');
    const word = parts[1] && parts[1].toLowerCase();
    if (!word) return safeReply(bot, msg.chat.id, '⚠️ Usage: `/addbadword <word>`');

    const list = store.getChat(msg.chat.id, 'badwords', []);
    if (list.includes(word))
      return safeReply(bot, msg.chat.id, `ℹ️ *${word}* is already in the bad words list.`);

    list.push(word);
    store.setChat(msg.chat.id, 'badwords', list);
    await safeReply(bot, msg.chat.id, `✅ Added *${word}* to the bad words list.\n_Total: ${list.length} word(s)_`);
  },
};

const removebadword = {
  command: 'removebadword',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const parts = msg.text.split(' ');
    const word = parts[1] && parts[1].toLowerCase();
    if (!word) return safeReply(bot, msg.chat.id, '⚠️ Usage: `/removebadword <word>`');

    let list = store.getChat(msg.chat.id, 'badwords', []);
    if (!list.includes(word))
      return safeReply(bot, msg.chat.id, `ℹ️ *${word}* is not in the list.`);

    list = list.filter(w => w !== word);
    store.setChat(msg.chat.id, 'badwords', list);
    await safeReply(bot, msg.chat.id, `✅ Removed *${word}* from bad words.\n_Total: ${list.length} word(s)_`);
  },
};

const listbadword = {
  command: 'listbadword',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');

    const list = store.getChat(msg.chat.id, 'badwords', []);
    if (list.length === 0)
      return safeReply(bot, msg.chat.id, 'ℹ️ No bad words set for this group.');

    const text = `🚫 *Bad Words List* (${list.length})\n\n` +
      list.map((w, i) => `${i + 1}. \`${w}\``).join('\n');
    await safeReply(bot, msg.chat.id, text);
  },
};

module.exports = [antileave, antilink, addbadword, removebadword, listbadword];

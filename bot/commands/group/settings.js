const { safeReply, isGroup, isAdmin } = require('../../lib/helpers');
const store = require('../../lib/store');

const gctime = {
  command: 'gctime',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    try {
      const chat = await bot.getChat(msg.chat.id);
      if (!chat.linked_chat_id && !chat.date) {
        return safeReply(bot, msg.chat.id,
          `ℹ️ *${chat.title}*\n\nGroup ID: \`${chat.id}\`\n` +
          `Type: ${chat.type}\n` +
          `Members: ${chat.member_count || 'N/A'}`);
      }
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  },
};

const welcome = {
  command: 'welcome',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const parts = msg.text.split(' ');
    parts.shift();
    const text = parts.join(' ').trim();

    if (!text) {
      const current = store.getChat(msg.chat.id, 'welcome', null);
      if (!current) return safeReply(bot, msg.chat.id,
        `ℹ️ No welcome message set.\n\nUsage: \`/welcome <message>\`\n\nUse \`{name}\` to insert the user's name.`);
      return safeReply(bot, msg.chat.id, `📋 *Current welcome message:*\n\n${current}`);
    }

    store.setChat(msg.chat.id, 'welcome', text);
    await safeReply(bot, msg.chat.id,
      `✅ Welcome message set!\n\nPreview:\n${text.replace('{name}', 'New Member')}`);
  },
};

const goodbye = {
  command: 'goodbye',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const parts = msg.text.split(' ');
    parts.shift();
    const text = parts.join(' ').trim();

    if (!text) {
      const current = store.getChat(msg.chat.id, 'goodbye', null);
      if (!current) return safeReply(bot, msg.chat.id,
        `ℹ️ No goodbye message set.\n\nUsage: \`/goodbye <message>\`\n\nUse \`{name}\` to insert the user's name.`);
      return safeReply(bot, msg.chat.id, `📋 *Current goodbye message:*\n\n${current}`);
    }

    store.setChat(msg.chat.id, 'goodbye', text);
    await safeReply(bot, msg.chat.id,
      `✅ Goodbye message set!\n\nPreview:\n${text.replace('{name}', 'Leaving Member')}`);
  },
};

const joinapproval = {
  command: 'joinapproval',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const current = store.getChat(msg.chat.id, 'joinapproval', false);
    const next = !current;
    store.setChat(msg.chat.id, 'joinapproval', next);

    await safeReply(bot, msg.chat.id,
      `${next ? '✅' : '❌'} *Join Approval* is now *${next ? 'ON' : 'OFF'}*.\n` +
      (next ? '_New join requests will need admin approval._' : ''));
  },
};

const onlyadmins = {
  command: 'onlyadmins',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');

    const current = store.getChat(msg.chat.id, 'onlyadmins', false);
    const next = !current;
    store.setChat(msg.chat.id, 'onlyadmins', next);

    try {
      if (next) {
        await bot.setChatPermissions(msg.chat.id, {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_polls: false,
          can_send_other_messages: false,
        });
      } else {
        await bot.setChatPermissions(msg.chat.id, {
          can_send_messages: true,
          can_send_media_messages: true,
          can_send_polls: true,
          can_send_other_messages: true,
          can_add_web_page_previews: true,
        });
      }
      await safeReply(bot, msg.chat.id,
        `${next ? '🔒' : '🔓'} *Only Admins* mode is now *${next ? 'ON' : 'OFF'}*.\n` +
        (next ? '_Only admins can send messages._' : '_All members can send messages._'));
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  },
};

module.exports = [gctime, welcome, goodbye, joinapproval, onlyadmins];

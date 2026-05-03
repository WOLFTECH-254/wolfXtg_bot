const { safeReply, isGroup, isAdmin, getSenderName } = require('../../lib/helpers');

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

function adminOnly(fn) {
  return async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ Groups only.');
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, '🚫 Admins only.');
    return fn(bot, msg);
  };
}

const add = {
  command: 'add',
  handler: adminOnly(async (bot, msg) => {
    try {
      const link = await bot.exportChatInviteLink(msg.chat.id);
      await safeReply(bot, msg.chat.id,
        `🔗 *Invite Link*\n\nShare this link to add members:\n${link}`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

const promote = {
  command: 'promote',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user.');
    try {
      await bot.promoteChatMember(msg.chat.id, target.id, {
        can_manage_chat: true,
        can_delete_messages: true,
        can_manage_video_chats: true,
        can_restrict_members: true,
        can_promote_members: false,
        can_change_info: true,
        can_invite_users: true,
        can_pin_messages: true,
      });
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `⬆️ *${name}* has been promoted to admin by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

const promoteall = {
  command: 'promoteall',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id,
      `⚠️ *Are you sure?*\n\nThis will promote ALL members to admin.\n\nReply \`/promoteall confirm\` to proceed.`);
  }),
};

const demote = {
  command: 'demote',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user.');
    try {
      await bot.promoteChatMember(msg.chat.id, target.id, {
        can_manage_chat: false,
        can_delete_messages: false,
        can_manage_video_chats: false,
        can_restrict_members: false,
        can_promote_members: false,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false,
      });
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `⬇️ *${name}* has been demoted by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

const demoteall = {
  command: 'demoteall',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id,
      `⚠️ *Are you sure?*\n\nThis will demote ALL admins.\n\nReply \`/demoteall confirm\` to proceed.`);
  }),
};

const kick = {
  command: 'kick',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user.');
    try {
      await bot.banChatMember(msg.chat.id, target.id);
      await bot.unbanChatMember(msg.chat.id, target.id);
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `👢 *${name}* was kicked by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

const kickall = {
  command: 'kickall',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id,
      `⚠️ *Danger!*\n\nThis will kick ALL non-admin members.\n\nReply \`/kickall confirm\` to proceed.`);
  }),
};

const ban = {
  command: 'ban',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user.');
    try {
      await bot.banChatMember(msg.chat.id, target.id);
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `🔨 *${name}* has been banned by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

const unban = {
  command: 'unban',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user.');
    try {
      await bot.unbanChatMember(msg.chat.id, target.id, { only_if_banned: true });
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `✅ *${name}* has been unbanned by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

const clearbanlist = {
  command: 'clearbanlist',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id,
      `ℹ️ Telegram does not expose a built-in ban list API.\n\nTo unban someone, use:\n\`/unban @username\``);
  }),
};

const leave = {
  command: 'leave',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id, '👋 Goodbye! Leaving this group...');
    try {
      await bot.leaveChat(msg.chat.id);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

const creategroup = {
  command: 'creategroup',
  handler: async (bot, msg) => {
    await safeReply(bot, msg.chat.id,
      `ℹ️ Bots cannot create Telegram groups directly.\n\nCreate a group manually in Telegram, then add me and make me an admin.`);
  },
};

const mute = {
  command: 'mute',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user.');
    try {
      await bot.restrictChatMember(msg.chat.id, target.id, {
        permissions: { can_send_messages: false, can_send_media_messages: false, can_send_polls: false, can_send_other_messages: false },
      });
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `🔇 *${name}* has been muted by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

const unmute = {
  command: 'unmute',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to or mention a user.');
    try {
      await bot.restrictChatMember(msg.chat.id, target.id, {
        permissions: { can_send_messages: true, can_send_media_messages: true, can_send_polls: true, can_send_other_messages: true, can_add_web_page_previews: true },
      });
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `🔊 *${name}* has been unmuted by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ ${err.message}`);
    }
  }),
};

module.exports = [add, promote, promoteall, demote, demoteall, kick, kickall, ban, unban, clearbanlist, mute, unmute, leave, creategroup];

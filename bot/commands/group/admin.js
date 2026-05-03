const { safeReply, isGroup, isAdmin, getSenderName } = require('../../lib/helpers');
const { buildBox } = require('../../lib/box');

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
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['This command works in groups only.']));
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']));
    return fn(bot, msg);
  };
}

function userName(user) {
  return user.username ? `@${user.username}` : user.first_name;
}

const add = {
  command: 'add',
  handler: adminOnly(async (bot, msg) => {
    try {
      const link = await bot.exportChatInviteLink(msg.chat.id);
      await safeReply(bot, msg.chat.id, buildBox('🔗 INVITE LINK', [
        'Share this link to add members:',
        null,
        link,
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

const promote = {
  command: 'promote',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ PROMOTE', ['Reply to or mention a user.']));
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
      await safeReply(bot, msg.chat.id, buildBox('⬆️ PROMOTED', [
        `User:   ${userName(target)}`,
        `By:     ${getSenderName(msg)}`,
        null,
        'Now has admin permissions.',
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

const promoteall = {
  command: 'promoteall',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id, buildBox('⚠️ PROMOTEALL', [
      'This will promote ALL members.',
      null,
      'Run /promoteall confirm to proceed.',
    ]));
  }),
};

const demote = {
  command: 'demote',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ DEMOTE', ['Reply to or mention a user.']));
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
      await safeReply(bot, msg.chat.id, buildBox('⬇️ DEMOTED', [
        `User:   ${userName(target)}`,
        `By:     ${getSenderName(msg)}`,
        null,
        'Admin rights removed.',
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

const demoteall = {
  command: 'demoteall',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id, buildBox('⚠️ DEMOTEALL', [
      'This will demote ALL admins.',
      null,
      'Run /demoteall confirm to proceed.',
    ]));
  }),
};

const kick = {
  command: 'kick',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ KICK', ['Reply to or mention a user.']));
    try {
      await bot.banChatMember(msg.chat.id, target.id);
      await bot.unbanChatMember(msg.chat.id, target.id);
      await safeReply(bot, msg.chat.id, buildBox('👢 KICKED', [
        `User:   ${userName(target)}`,
        `By:     ${getSenderName(msg)}`,
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

const kickall = {
  command: 'kickall',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id, buildBox('⚠️ KICKALL', [
      'DANGER: Kicks ALL non-admin members.',
      null,
      'Run /kickall confirm to proceed.',
    ]));
  }),
};

const ban = {
  command: 'ban',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ BAN', ['Reply to or mention a user.']));
    try {
      await bot.banChatMember(msg.chat.id, target.id);
      await safeReply(bot, msg.chat.id, buildBox('🔨 BANNED', [
        `User:   ${userName(target)}`,
        `By:     ${getSenderName(msg)}`,
        null,
        'User cannot rejoin until unbanned.',
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

const unban = {
  command: 'unban',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ UNBAN', ['Reply to or mention a user.']));
    try {
      await bot.unbanChatMember(msg.chat.id, target.id, { only_if_banned: true });
      await safeReply(bot, msg.chat.id, buildBox('✅ UNBANNED', [
        `User:   ${userName(target)}`,
        `By:     ${getSenderName(msg)}`,
        null,
        'User can now rejoin the group.',
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

const clearbanlist = {
  command: 'clearbanlist',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id, buildBox('ℹ️ BAN LIST', [
      'Telegram does not expose a ban list.',
      null,
      'To unban someone use:',
      '/unban @username',
    ]));
  }),
};

const leave = {
  command: 'leave',
  handler: adminOnly(async (bot, msg) => {
    await safeReply(bot, msg.chat.id, buildBox('👋 LEAVING', [
      'Bot is leaving this group...',
    ]));
    try {
      await bot.leaveChat(msg.chat.id);
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

const creategroup = {
  command: 'creategroup',
  handler: async (bot, msg) => {
    await safeReply(bot, msg.chat.id, buildBox('ℹ️ CREATE GROUP', [
      'Bots cannot create groups directly.',
      null,
      'Create a group in Telegram,',
      'then add me and make me admin.',
    ]));
  },
};

const mute = {
  command: 'mute',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ MUTE', ['Reply to or mention a user.']));
    try {
      await bot.restrictChatMember(msg.chat.id, target.id, {
        permissions: {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_polls: false,
          can_send_other_messages: false,
        },
      });
      await safeReply(bot, msg.chat.id, buildBox('🔇 MUTED', [
        `User:   ${userName(target)}`,
        `By:     ${getSenderName(msg)}`,
        null,
        'User cannot send messages.',
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

const unmute = {
  command: 'unmute',
  handler: adminOnly(async (bot, msg) => {
    const target = await getTarget(bot, msg);
    if (!target)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ UNMUTE', ['Reply to or mention a user.']));
    try {
      await bot.restrictChatMember(msg.chat.id, target.id, {
        permissions: {
          can_send_messages: true,
          can_send_media_messages: true,
          can_send_polls: true,
          can_send_other_messages: true,
          can_add_web_page_previews: true,
        },
      });
      await safeReply(bot, msg.chat.id, buildBox('🔊 UNMUTED', [
        `User:   ${userName(target)}`,
        `By:     ${getSenderName(msg)}`,
        null,
        'User can send messages again.',
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

module.exports = [add, promote, promoteall, demote, demoteall, kick, kickall, ban, unban, clearbanlist, mute, unmute, leave, creategroup];

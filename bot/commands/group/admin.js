const { safeReply, isGroup, isAdmin, getSenderName } = require('../../lib/helpers');

async function getTargetUser(bot, msg) {
  if (msg.reply_to_message) {
    return msg.reply_to_message.from;
  }

  const parts = msg.text.split(' ');
  const mention = parts[1];
  if (mention && mention.startsWith('@')) {
    try {
      const member = await bot.getChatMember(msg.chat.id, mention.replace('@', ''));
      return member.user;
    } catch {
      return null;
    }
  }
  return null;
}

const warn = {
  command: 'warn',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ This command only works in groups.');

    const adminCheck = await isAdmin(bot, msg.chat.id, msg.from.id);
    if (!adminCheck) return safeReply(bot, msg.chat.id, '🚫 Only admins can use this command.');

    const target = await getTargetUser(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to a user or mention them to warn.');

    const name = target.username ? `@${target.username}` : target.first_name;
    await safeReply(bot, msg.chat.id, `⚠️ *${name}* has been warned by ${getSenderName(msg)}.\nPlease follow the group rules.`);
  },
};

const kick = {
  command: 'kick',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ This command only works in groups.');

    const adminCheck = await isAdmin(bot, msg.chat.id, msg.from.id);
    if (!adminCheck) return safeReply(bot, msg.chat.id, '🚫 Only admins can use this command.');

    const target = await getTargetUser(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to a user or mention them to kick.');

    try {
      await bot.banChatMember(msg.chat.id, target.id);
      await bot.unbanChatMember(msg.chat.id, target.id);
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `👢 *${name}* has been kicked by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ Failed to kick: ${err.message}`);
    }
  },
};

const mute = {
  command: 'mute',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ This command only works in groups.');

    const adminCheck = await isAdmin(bot, msg.chat.id, msg.from.id);
    if (!adminCheck) return safeReply(bot, msg.chat.id, '🚫 Only admins can use this command.');

    const target = await getTargetUser(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to a user or mention them to mute.');

    try {
      await bot.restrictChatMember(msg.chat.id, target.id, {
        permissions: {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_polls: false,
          can_send_other_messages: false,
        },
      });
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `🔇 *${name}* has been muted by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ Failed to mute: ${err.message}`);
    }
  },
};

const unmute = {
  command: 'unmute',
  handler: async (bot, msg) => {
    if (!isGroup(msg)) return safeReply(bot, msg.chat.id, '⚠️ This command only works in groups.');

    const adminCheck = await isAdmin(bot, msg.chat.id, msg.from.id);
    if (!adminCheck) return safeReply(bot, msg.chat.id, '🚫 Only admins can use this command.');

    const target = await getTargetUser(bot, msg);
    if (!target) return safeReply(bot, msg.chat.id, '⚠️ Reply to a user or mention them to unmute.');

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
      const name = target.username ? `@${target.username}` : target.first_name;
      await safeReply(bot, msg.chat.id, `🔊 *${name}* has been unmuted by ${getSenderName(msg)}.`);
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ Failed to unmute: ${err.message}`);
    }
  },
};

module.exports = [warn, kick, mute, unmute];

const { safeReply } = require('../../lib/helpers');

module.exports = [
  {
    command: 'info',
    handler: async (bot, msg) => {
      const user = msg.from;
      const chat = msg.chat;

      const text = `👤 *User Info*\n\n` +
        `• *Name:* ${user.first_name}${user.last_name ? ' ' + user.last_name : ''}\n` +
        `• *Username:* ${user.username ? '@' + user.username : 'N/A'}\n` +
        `• *User ID:* \`${user.id}\`\n` +
        `• *Language:* ${user.language_code || 'N/A'}\n` +
        `• *Bot:* ${user.is_bot ? 'Yes' : 'No'}\n\n` +
        `💬 *Chat Info*\n\n` +
        `• *Chat ID:* \`${chat.id}\`\n` +
        `• *Type:* ${chat.type}\n` +
        `• *Title:* ${chat.title || chat.first_name || 'Private'}`;

      await safeReply(bot, msg.chat.id, text);
    },
  },
  {
    command: 'id',
    handler: async (bot, msg) => {
      const text = `🆔 *IDs*\n\n` +
        `• *Your ID:* \`${msg.from.id}\`\n` +
        `• *Chat ID:* \`${msg.chat.id}\`\n` +
        `• *Message ID:* \`${msg.message_id}\``;

      await safeReply(bot, msg.chat.id, text);
    },
  },
  {
    command: 'echo',
    handler: async (bot, msg) => {
      const parts = msg.text.split(' ');
      parts.shift();
      const text = parts.join(' ');

      if (!text) {
        return safeReply(bot, msg.chat.id, '⚠️ Usage: `/echo <your text>`');
      }

      await safeReply(bot, msg.chat.id, `🔁 ${text}`);
    },
  },
];

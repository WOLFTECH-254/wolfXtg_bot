const { safeReply } = require('../../lib/helpers');
const { buildBox } = require('../../lib/box');

module.exports = [
  {
    command: 'info',
    handler: async (bot, msg) => {
      const u = msg.from;
      const c = msg.chat;

      const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
      const username = u.username ? `@${u.username}` : 'none';
      const chatTitle = c.title || c.first_name || 'Private';

      await safeReply(bot, msg.chat.id, buildBox('👤 INFO', [
        `Name:     ${name}`,
        `Username: ${username}`,
        `User ID:  ${u.id}`,
        `Language: ${u.language_code || 'N/A'}`,
        null,
        `Chat:     ${chatTitle}`,
        `Chat ID:  ${c.id}`,
        `Type:     ${c.type}`,
      ]));
    },
  },
  {
    command: 'id',
    handler: async (bot, msg) => {
      await safeReply(bot, msg.chat.id, buildBox('🆔 IDs', [
        `Your ID:    ${msg.from.id}`,
        `Chat ID:    ${msg.chat.id}`,
        `Message ID: ${msg.message_id}`,
      ]));
    },
  },
  {
    command: 'echo',
    handler: async (bot, msg) => {
      const parts = msg.text.split(' ');
      parts.shift();
      const text = parts.join(' ').trim();
      if (!text)
        return safeReply(bot, msg.chat.id, buildBox('⚠️ ECHO', ['Usage: /echo <your text>']));
      await safeReply(bot, msg.chat.id, `🔁 ${text}`);
    },
  },
];

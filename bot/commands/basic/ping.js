const { safeReply } = require('../../lib/helpers');

module.exports = {
  command: 'ping',
  handler: async (bot, msg) => {
    const start = Date.now();
    const sent = await safeReply(bot, msg.chat.id, '🏓 Pinging...');
    const latency = Date.now() - start;

    if (sent) {
      await bot.editMessageText(
        `🏓 *Pong!*\n⚡ Latency: \`${latency}ms\``,
        {
          chat_id: msg.chat.id,
          message_id: sent.message_id,
          parse_mode: 'Markdown',
        }
      );
    }
  },
};

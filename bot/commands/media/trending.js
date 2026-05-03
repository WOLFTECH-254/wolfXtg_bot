const { safeReply } = require('../../lib/helpers');
const api = require('../../lib/api');

const trending = {
  command: 'trending',
  handler: async (bot, msg) => {
    const status = await safeReply(bot, msg.chat.id, '📈 Fetching trending music...');

    try {
      const data = await api.trending();

      if (!data.success || !data.items || data.items.length === 0) {
        return bot.editMessageText('❌ Could not fetch trending music right now.', {
          chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
        });
      }

      let text = `📈 *Trending Music* 🌍\n\n`;
      data.items.slice(0, 8).forEach((item, i) => {
        text += `*${i + 1}.* ${item.title}\n`;
        text += `   🎤 ${item.channelTitle}\n`;
        text += `   ▶️ \`/play ${item.title}\`\n\n`;
      });
      text += `_Use /play <song name> to download any track._`;

      await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: status.message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    } catch (err) {
      await bot.editMessageText(`❌ Failed: ${err.message}`, {
        chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
      }).catch(() => {});
    }
  },
};

module.exports = trending;

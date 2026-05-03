const { safeReply } = require('../../lib/helpers');
const axios = require('axios');

module.exports = {
  command: 'gif',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const query = parts.join(' ').trim();

    if (!query) {
      return safeReply(bot, msg.chat.id, '🎞 Usage: `/gif <search term>`');
    }

    try {
      const res = await axios.get('https://api.tenor.com/v2/search', {
        params: {
          q: query,
          key: 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ',
          limit: 1,
          media_filter: 'gif',
        },
        timeout: 8000,
      });

      const results = res.data.results;
      if (!results || results.length === 0) {
        return safeReply(bot, msg.chat.id, `❌ No GIFs found for *${query}*.`);
      }

      const gifUrl = results[0].media_formats?.gif?.url || results[0].url;
      await bot.sendAnimation(msg.chat.id, gifUrl, {
        caption: `🎞 *${query}*`,
        parse_mode: 'Markdown',
      });
    } catch (err) {
      await safeReply(bot, msg.chat.id, `❌ Failed to fetch GIF: ${err.message}`);
    }
  },
};

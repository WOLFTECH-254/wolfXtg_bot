const { safeReply } = require('../../lib/helpers');
const axios = require('axios');

const song = {
  command: 'song',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const query = parts.join(' ').trim();

    if (!query) {
      return safeReply(bot, msg.chat.id, '🎵 Usage: `/song <song name>`');
    }

    const searching = await safeReply(bot, msg.chat.id, `🔍 Searching for *${query}*...`);

    try {
      const res = await axios.get('https://itunes.apple.com/search', {
        params: { term: query, media: 'music', limit: 5 },
        timeout: 8000,
      });

      const results = res.data.results;
      if (!results || results.length === 0) {
        return bot.editMessageText(`❌ No results found for *${query}*.`, {
          chat_id: msg.chat.id,
          message_id: searching.message_id,
          parse_mode: 'Markdown',
        });
      }

      let text = `🎵 *Song Results for "${query}"*\n\n`;
      results.forEach((track, i) => {
        text += `*${i + 1}.* ${track.trackName}\n`;
        text += `   🎤 ${track.artistName}\n`;
        text += `   💿 ${track.collectionName || 'Single'}\n`;
        text += `   ⏱ ${Math.floor(track.trackTimeMillis / 60000)}:${String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}\n`;
        if (track.previewUrl) text += `   [▶️ Preview](${track.previewUrl})\n`;
        text += '\n';
      });

      await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: searching.message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    } catch (err) {
      await bot.editMessageText(`❌ Search failed: ${err.message}`, {
        chat_id: msg.chat.id,
        message_id: searching.message_id,
        parse_mode: 'Markdown',
      });
    }
  },
};

const lyrics = {
  command: 'lyrics',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const query = parts.join(' ').trim();

    if (!query) {
      return safeReply(bot, msg.chat.id, '🎶 Usage: `/lyrics <song name>`');
    }

    const searching = await safeReply(bot, msg.chat.id, `🔍 Searching lyrics for *${query}*...`);

    try {
      const res = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`, {
        timeout: 8000,
      });

      const data = res.data.data;
      if (!data || data.length === 0) {
        return bot.editMessageText(`❌ No lyrics found for *${query}*.`, {
          chat_id: msg.chat.id,
          message_id: searching.message_id,
          parse_mode: 'Markdown',
        });
      }

      const track = data[0];
      const lyricsRes = await axios.get(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist.name)}/${encodeURIComponent(track.title)}`,
        { timeout: 8000 }
      );

      let lyricsText = lyricsRes.data.lyrics || 'No lyrics available.';
      if (lyricsText.length > 3500) lyricsText = lyricsText.slice(0, 3500) + '\n\n_...truncated_';

      const text = `🎶 *${track.title}* — ${track.artist.name}\n\n${lyricsText}`;

      await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: searching.message_id,
        parse_mode: 'Markdown',
      });
    } catch (err) {
      await bot.editMessageText(`❌ Could not fetch lyrics: ${err.message}`, {
        chat_id: msg.chat.id,
        message_id: searching.message_id,
        parse_mode: 'Markdown',
      });
    }
  },
};

module.exports = [song, lyrics];

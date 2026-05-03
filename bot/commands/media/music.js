const { safeReply } = require('../../lib/helpers');
const api = require('../../lib/api');

const play = {
  command: 'play',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const query = parts.join(' ').trim();

    if (!query) return safeReply(bot, msg.chat.id, '🎵 Usage: `/play <song name>`');

    const status = await safeReply(bot, msg.chat.id, `🔍 Finding *${query}*...`);

    try {
      const data = await api.downloadMp3(query);

      if (!data.success || !data.downloadUrl) {
        return bot.editMessageText(`❌ Could not find *${query}*.`, {
          chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
        });
      }

      await bot.editMessageText(
        `⬇️ Downloading *${data.title}* (${data.quality})...`,
        { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }
      );

      const axios = require('axios');
      const fileRes = await axios.get(data.downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const buffer = Buffer.from(fileRes.data);

      await bot.sendAudio(msg.chat.id, buffer, {
        title: data.title,
        caption: `🎵 *${data.title}*\n📦 Quality: ${data.quality}`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '⬇️ Download MP3', url: data.downloadUrl },
            { text: '▶️ YouTube', url: data.youtubeUrl },
          ]],
        },
      }, { filename: `${data.title}.mp3`, contentType: 'audio/mpeg' });

      await bot.deleteMessage(msg.chat.id, status.message_id).catch(() => {});
    } catch (err) {
      await bot.editMessageText(`❌ Failed: ${err.message}`, {
        chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
      }).catch(() => {});
    }
  },
};

const song = {
  command: 'song',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const query = parts.join(' ').trim();

    if (!query) return safeReply(bot, msg.chat.id, '🎵 Usage: `/song <song name>`');

    const status = await safeReply(bot, msg.chat.id, `🔍 Searching *${query}*...`);

    try {
      const data = await api.search(query);

      if (!data.success || !data.items || data.items.length === 0) {
        return bot.editMessageText(`❌ No results for *${query}*.`, {
          chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
        });
      }

      let text = `🎵 *Results for "${query}"*\n\n`;
      data.items.slice(0, 6).forEach((item, i) => {
        text += `*${i + 1}.* ${item.title}\n`;
        text += `   🎤 ${item.channelTitle}\n`;
        text += `   🔗 [YouTube](https://youtu.be/${item.id})\n`;
        text += `   ▶️ Use: \`/play ${item.title}\`\n\n`;
      });
      text += `_Tip: Use /play <song name> to download the audio._`;

      await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: status.message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    } catch (err) {
      await bot.editMessageText(`❌ Search failed: ${err.message}`, {
        chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
      }).catch(() => {});
    }
  },
};

const lyrics = {
  command: 'lyrics',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const query = parts.join(' ').trim();

    if (!query) return safeReply(bot, msg.chat.id, '🎶 Usage: `/lyrics <song name>`');

    const status = await safeReply(bot, msg.chat.id, `🔍 Fetching lyrics for *${query}*...`);

    try {
      const data = await api.lyrics(query);

      if (!data.success || !data.lyrics) {
        return bot.editMessageText(`❌ No lyrics found for *${query}*.`, {
          chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
        });
      }

      const mins = Math.floor(data.duration / 60);
      const secs = String(data.duration % 60).padStart(2, '0');

      let header = `🎶 *${data.title}*\n`;
      header += `🎤 ${data.author}`;
      if (data.album) header += ` — ${data.album}`;
      header += `\n⏱ ${mins}:${secs}\n\n`;

      let lyricsText = data.lyrics;
      if (lyricsText.length > 3800) lyricsText = lyricsText.slice(0, 3800) + '\n\n_...truncated_';

      const full = header + lyricsText;

      await bot.editMessageText(full, {
        chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
      });
    } catch (err) {
      await bot.editMessageText(`❌ Failed: ${err.message}`, {
        chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
      }).catch(() => {});
    }
  },
};

module.exports = [play, song, lyrics];

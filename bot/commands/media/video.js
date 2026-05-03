const { safeReply } = require('../../lib/helpers');
const api = require('../../lib/api');

const video = {
  command: 'video',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const query = parts.join(' ').trim();

    if (!query) return safeReply(bot, msg.chat.id, '🎬 Usage: `/video <song or video name>`');

    const status = await safeReply(bot, msg.chat.id, `🔍 Finding *${query}*...`);

    try {
      const data = await api.downloadMp4(query);

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
        timeout: 120000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const buffer = Buffer.from(fileRes.data);

      await bot.sendVideo(msg.chat.id, buffer, {
        caption: `🎬 *${data.title}*\n📦 Quality: ${data.quality}`,
        parse_mode: 'Markdown',
        supports_streaming: true,
        reply_markup: {
          inline_keyboard: [[
            { text: '⬇️ Download MP4', url: data.downloadUrl },
            { text: '▶️ YouTube', url: data.youtubeUrl },
          ]],
        },
      }, { filename: `${data.title}.mp4`, contentType: 'video/mp4' });

      await bot.deleteMessage(msg.chat.id, status.message_id).catch(() => {});
    } catch (err) {
      await bot.editMessageText(`❌ Failed: ${err.message}`, {
        chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
      }).catch(() => {});
    }
  },
};

const dl = {
  command: 'dl',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const query = parts.join(' ').trim();

    if (!query) return safeReply(bot, msg.chat.id, '⬇️ Usage: `/dl <song name>`\n\nSends both MP3 and MP4 download links.');

    const status = await safeReply(bot, msg.chat.id, `🔍 Looking up *${query}*...`);

    try {
      const data = await api.downloadBoth(query);

      if (!data.success) {
        return bot.editMessageText(`❌ Could not find *${query}*.`, {
          chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
        });
      }

      const mp3 = data.mp3 || {};
      const mp4 = data.mp4 || {};

      const text =
        `🎵 *${data.title}*\n\n` +
        `${mp3.success ? `🎵 MP3 — ${mp3.quality || '320kbps'}\n` : ''}` +
        `${mp4.success ? `🎬 MP4 — ${mp4.quality || '720p'}\n` : ''}`;

      const buttons = [];
      if (mp3.success && mp3.downloadUrl) {
        buttons.push({ text: '⬇️ Download MP3', url: mp3.downloadUrl });
      }
      if (mp4.success && mp4.downloadUrl) {
        buttons.push({ text: '⬇️ Download MP4', url: mp4.downloadUrl });
      }

      const keyboard = { inline_keyboard: [] };
      if (buttons.length > 0) keyboard.inline_keyboard.push(buttons);
      keyboard.inline_keyboard.push([{ text: '▶️ Watch on YouTube', url: data.youtubeUrl }]);

      await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: status.message_id,
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } catch (err) {
      await bot.editMessageText(`❌ Failed: ${err.message}`, {
        chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
      }).catch(() => {});
    }
  },
};

module.exports = [video, dl];

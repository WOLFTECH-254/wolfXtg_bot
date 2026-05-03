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
        caption: `🎬 *${data.title}*\n📦 Quality: ${data.quality}\n🔗 [YouTube](${data.youtubeUrl})`,
        parse_mode: 'Markdown',
        supports_streaming: true,
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

      let text = `🎵 *${data.title}*\n`;
      text += `🖼 [Thumbnail](${data.thumbnail})\n\n`;

      if (mp3.success && mp3.downloadUrl) {
        text += `🎵 *MP3* — ${mp3.quality || '320kbps'}\n`;
        text += `[⬇️ Download Audio](${mp3.downloadUrl})\n\n`;
      }

      if (mp4.success && mp4.downloadUrl) {
        text += `🎬 *MP4* — ${mp4.quality || '720p'}\n`;
        text += `[⬇️ Download Video](${mp4.downloadUrl})\n\n`;
      }

      text += `🔗 [Watch on YouTube](${data.youtubeUrl})`;

      await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: status.message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      });
    } catch (err) {
      await bot.editMessageText(`❌ Failed: ${err.message}`, {
        chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown',
      }).catch(() => {});
    }
  },
};

module.exports = [video, dl];

const { safeReply } = require('../../lib/helpers');

module.exports = {
  command: 'help',
  handler: async (bot, msg) => {
    const text = `📖 *Command Reference*\n\n` +
      `*🔹 Basic*\n` +
      `\`/start\` — Welcome message\n` +
      `\`/help\` — This menu\n` +
      `\`/ping\` — Latency check\n` +
      `\`/info\` — Your profile info\n` +
      `\`/id\` — Get chat & user IDs\n` +
      `\`/echo <text>\` — Echo your text back\n\n` +
      `*🔹 Group Tools* _(admin only)_\n` +
      `\`/rules\` — Show group rules\n` +
      `\`/warn @user\` — Warn a member\n` +
      `\`/kick @user\` — Remove a member\n` +
      `\`/mute @user\` — Mute a member\n` +
      `\`/unmute @user\` — Unmute a member\n\n` +
      `*🔹 Music & Media*\n` +
      `\`/song <name>\` — Search YouTube Music\n` +
      `\`/play <name>\` — Download & send MP3 audio\n` +
      `\`/video <name>\` — Download & send MP4 video\n` +
      `\`/dl <name>\` — Get both MP3 + MP4 links\n` +
      `\`/lyrics <name>\` — Get full song lyrics\n` +
      `\`/trending\` — Show trending music chart\n` +
      `\`/gif <query>\` — Search & send a GIF\n\n` +
      `_Tip: Reply to a user with an admin command to target them._`;

    await safeReply(bot, msg.chat.id, text);
  },
};

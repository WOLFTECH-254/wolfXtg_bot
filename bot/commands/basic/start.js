const { safeReply, getSenderName } = require('../../lib/helpers');

module.exports = {
  command: 'start',
  handler: async (bot, msg) => {
    const name = getSenderName(msg);
    const text = `👋 *Welcome, ${name}!*\n\n` +
      `I'm your automation bot. Here's what I can do:\n\n` +
      `*🔹 Basic*\n` +
      `  /start — Welcome message\n` +
      `  /help — All commands\n` +
      `  /ping — Latency check\n` +
      `  /info — Your account info\n` +
      `  /id — Chat & user IDs\n` +
      `  /echo \\<text\\> — Repeat your message\n\n` +
      `*🔹 Group Tools* _(admin only)_\n` +
      `  /rules — Show group rules\n` +
      `  /warn — Warn a user\n` +
      `  /kick — Kick a user\n` +
      `  /mute — Mute a user\n` +
      `  /unmute — Unmute a user\n\n` +
      `*🔹 Music & Media*\n` +
      `  /song \\<name\\> — Search for a song\n` +
      `  /play \\<name\\> — Download & send MP3\n` +
      `  /video \\<name\\> — Download & send MP4\n` +
      `  /dl \\<name\\> — Get MP3 + MP4 links\n` +
      `  /lyrics \\<name\\> — Get song lyrics\n` +
      `  /trending — Trending music chart\n` +
      `  /gif \\<query\\> — Search for a GIF\n\n` +
      `Use /help for more details.`;

    await safeReply(bot, msg.chat.id, text);
  },
};

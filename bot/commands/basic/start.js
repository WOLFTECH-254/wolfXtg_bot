const { safeReply, getSenderName } = require('../../lib/helpers');

module.exports = {
  command: 'start',
  handler: async (bot, msg) => {
    const name = getSenderName(msg);
    const text = `👋 *Welcome, ${name}!*\n\n` +
      `I'm your automation bot. Here's what I can do:\n\n` +
      `*Basic*\n` +
      `  /start — Show this welcome message\n` +
      `  /help — List all commands\n` +
      `  /ping — Check if I'm alive\n` +
      `  /info — Your account info\n` +
      `  /echo \\<text\\> — Repeat your message\n\n` +
      `*Group Tools*\n` +
      `  /rules — Show group rules\n` +
      `  /warn — Warn a user (admin)\n` +
      `  /kick — Kick a user (admin)\n` +
      `  /mute — Mute a user (admin)\n\n` +
      `*Media & Music*\n` +
      `  /song \\<name\\> — Search for a song\n` +
      `  /lyrics \\<name\\> — Get song lyrics\n` +
      `  /gif \\<query\\> — Search for a GIF\n\n` +
      `Use /help for more details.`;

    await safeReply(bot, msg.chat.id, text);
  },
};

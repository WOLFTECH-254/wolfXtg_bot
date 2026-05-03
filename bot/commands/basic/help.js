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
      `\`/echo <text>\` — Echo your text back\n` +
      `\`/id\` — Get chat & user IDs\n\n` +
      `*🔹 Group Tools* _(admin only)_\n` +
      `\`/rules\` — Show group rules\n` +
      `\`/warn @user\` — Warn a member\n` +
      `\`/kick @user\` — Remove a member\n` +
      `\`/mute @user\` — Mute a member\n\n` +
      `*🔹 Media & Music*\n` +
      `\`/song <name>\` — Search a song\n` +
      `\`/lyrics <name>\` — Get song lyrics\n` +
      `\`/gif <query>\` — Search a GIF\n\n` +
      `_Tip: Reply to a user with a command to target them._`;

    await safeReply(bot, msg.chat.id, text);
  },
};

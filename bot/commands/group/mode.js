const { safeReply, isGroup, isAdmin } = require('../../lib/helpers');
const { buildBox } = require('../../lib/box');
const store = require('../../lib/store');

module.exports = {
  command: 'mode',
  handler: async (bot, msg) => {
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['Groups only.']));
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']));

    const parts = msg.text.split(' ');
    const arg = parts[1]?.toLowerCase();

    const current = store.getChat(msg.chat.id, 'adminmode', false);
    let on;

    if (arg === 'on') on = true;
    else if (arg === 'off') on = false;
    else on = !current;

    store.setChat(msg.chat.id, 'adminmode', on);

    await safeReply(bot, msg.chat.id, buildBox(
      on ? '🔒 ADMIN MODE — ON' : '🔓 PUBLIC MODE — ON',
      on
        ? [
            'Bot now responds to admins only.',
            null,
            'Regular members commands are',
            'silently ignored.',
            null,
            'Use /mode off to open to everyone.',
          ]
        : [
            'Bot now responds to everyone.',
            null,
            'All members can use commands.',
            null,
            'Use /mode on to lock to admins.',
          ]
    ));
  },
};

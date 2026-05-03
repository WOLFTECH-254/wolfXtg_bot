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

    if (!arg) {
      return safeReply(bot, msg.chat.id, buildBox('⚙️ BOT MODE', [
        `Current: ${current ? '🔒 Admins only' : '🔓 Public'}`,
        null,
        'To change:',
        '  /mode admins  — lock to admins',
        '  /mode public  — open to everyone',
      ]));
    }

    if (arg !== 'admins' && arg !== 'public') {
      return safeReply(bot, msg.chat.id, buildBox('⚠️ MODE', [
        'Invalid option.',
        null,
        'Usage:',
        '  /mode admins  — admins only',
        '  /mode public  — everyone',
      ]));
    }

    const on = arg === 'admins';

    if (on === current) {
      return safeReply(bot, msg.chat.id, buildBox('ℹ️ MODE', [
        `Already set to ${on ? 'admins only' : 'public'}.`,
      ]));
    }

    store.setChat(msg.chat.id, 'adminmode', on);

    await safeReply(bot, msg.chat.id, buildBox(
      on ? '🔒 ADMIN MODE' : '🔓 PUBLIC MODE',
      on
        ? [
            'Bot now responds to admins only.',
            null,
            'Regular members are silently',
            'ignored when using commands.',
            null,
            'To revert: /mode public',
          ]
        : [
            'Bot now responds to everyone.',
            null,
            'All members can use commands.',
            null,
            'To restrict: /mode admins',
          ]
    ));
  },
};

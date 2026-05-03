const { safeReply, isGroup, isAdmin } = require('../../lib/helpers');
const { buildBox } = require('../../lib/box');
const store = require('../../lib/store');

function adminOnly(fn) {
  return async (bot, msg) => {
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['Groups only.']));
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']));
    return fn(bot, msg);
  };
}

const gctime = {
  command: 'gctime',
  handler: async (bot, msg) => {
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['Groups only.']));
    try {
      const chat = await bot.getChat(msg.chat.id);
      await safeReply(bot, msg.chat.id, buildBox('ℹ️ GROUP INFO', [
        `Name:    ${chat.title}`,
        `ID:      ${chat.id}`,
        `Type:    ${chat.type}`,
        `Members: ${chat.member_count || 'N/A'}`,
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  },
};

const welcome = {
  command: 'welcome',
  handler: adminOnly(async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const text = parts.join(' ').trim();

    if (!text) {
      const current = store.getChat(msg.chat.id, 'welcome', null);
      if (!current)
        return safeReply(bot, msg.chat.id, buildBox('👋 WELCOME', [
          'No welcome message set.',
          null,
          'Usage: /welcome <message>',
          'Use {name} for the user name.',
        ]));
      return safeReply(bot, msg.chat.id, buildBox('👋 WELCOME MESSAGE', [
        'Current message:',
        null,
        ...current.split('\n'),
      ]));
    }

    store.setChat(msg.chat.id, 'welcome', text);
    const preview = text.replace('{name}', 'New Member');
    await safeReply(bot, msg.chat.id, buildBox('✅ WELCOME SET', [
      'Preview:',
      null,
      ...preview.split('\n'),
    ]));
  }),
};

const goodbye = {
  command: 'goodbye',
  handler: adminOnly(async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const text = parts.join(' ').trim();

    if (!text) {
      const current = store.getChat(msg.chat.id, 'goodbye', null);
      if (!current)
        return safeReply(bot, msg.chat.id, buildBox('🚪 GOODBYE', [
          'No goodbye message set.',
          null,
          'Usage: /goodbye <message>',
          'Use {name} for the user name.',
        ]));
      return safeReply(bot, msg.chat.id, buildBox('🚪 GOODBYE MESSAGE', [
        'Current message:',
        null,
        ...current.split('\n'),
      ]));
    }

    store.setChat(msg.chat.id, 'goodbye', text);
    const preview = text.replace('{name}', 'Leaving Member');
    await safeReply(bot, msg.chat.id, buildBox('✅ GOODBYE SET', [
      'Preview:',
      null,
      ...preview.split('\n'),
    ]));
  }),
};

const joinapproval = {
  command: 'joinapproval',
  handler: adminOnly(async (bot, msg) => {
    const current = store.getChat(msg.chat.id, 'joinapproval', false);
    const on = !current;
    store.setChat(msg.chat.id, 'joinapproval', on);
    await safeReply(bot, msg.chat.id, buildBox('🔐 JOIN APPROVAL', [
      `Status: ${on ? 'ON' : 'OFF'}`,
      null,
      on
        ? 'New join requests will need'
        : 'Join approval is now disabled.',
      on ? 'admin approval.' : '',
    ].filter(r => r !== '')));
  }),
};

const onlyadmins = {
  command: 'onlyadmins',
  handler: adminOnly(async (bot, msg) => {
    const current = store.getChat(msg.chat.id, 'onlyadmins', false);
    const on = !current;
    store.setChat(msg.chat.id, 'onlyadmins', on);
    try {
      if (on) {
        await bot.setChatPermissions(msg.chat.id, {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_polls: false,
          can_send_other_messages: false,
        });
      } else {
        await bot.setChatPermissions(msg.chat.id, {
          can_send_messages: true,
          can_send_media_messages: true,
          can_send_polls: true,
          can_send_other_messages: true,
          can_add_web_page_previews: true,
        });
      }
      await safeReply(bot, msg.chat.id, buildBox(`${on ? '🔒' : '🔓'} ONLY ADMINS`, [
        `Status: ${on ? 'ON' : 'OFF'}`,
        null,
        on
          ? 'Only admins can send messages.'
          : 'All members can send messages.',
      ]));
    } catch (err) {
      await safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [err.message]));
    }
  }),
};

module.exports = [gctime, welcome, goodbye, joinapproval, onlyadmins];

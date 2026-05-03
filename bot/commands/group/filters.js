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

const antileave = {
  command: 'antileave',
  handler: adminOnly(async (bot, msg) => {
    const current = store.getChat(msg.chat.id, 'antileave', false);
    const on = !current;
    store.setChat(msg.chat.id, 'antileave', on);
    await safeReply(bot, msg.chat.id, buildBox('👋 ANTI-LEAVE', [
      `Status: ${on ? 'ON' : 'OFF'}`,
      null,
      on
        ? 'Members who leave will get a'
        : 'Anti-leave is now disabled.',
      on ? 're-invite link posted.' : '',
    ].filter(r => r !== '')));
  }),
};

const antilink = {
  command: 'antilink',
  handler: adminOnly(async (bot, msg) => {
    const parts = msg.text.split(' ');
    const arg = parts[1]?.toLowerCase();

    let on;
    if (arg === 'on') on = true;
    else if (arg === 'off') on = false;
    else {
      const current = store.getChat(msg.chat.id, 'antilink', false);
      on = !current;
    }

    store.setChat(msg.chat.id, 'antilink', on);
    await safeReply(bot, msg.chat.id, buildBox('🔗 ANTI-LINK', [
      `Status: ${on ? 'ON' : 'OFF'}`,
      null,
      on
        ? 'Links in text, captions & media'
        : 'Anti-link is now disabled.',
      on ? 'will be auto-deleted.' : '',
    ].filter(r => r !== '')));
  }),
};

const addbadword = {
  command: 'addbadword',
  handler: adminOnly(async (bot, msg) => {
    const parts = msg.text.split(' ');
    const word = parts[1]?.toLowerCase();
    if (!word)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ADDBADWORD', [
        'Usage: /addbadword <word>',
      ]));

    const list = store.getChat(msg.chat.id, 'badwords', []);
    if (list.includes(word))
      return safeReply(bot, msg.chat.id, buildBox('ℹ️ ADDBADWORD', [
        `"${word}" is already in the list.`,
      ]));

    list.push(word);
    store.setChat(msg.chat.id, 'badwords', list);
    await safeReply(bot, msg.chat.id, buildBox('✅ BAD WORD ADDED', [
      `Word:  ${word}`,
      `Total: ${list.length} word(s)`,
    ]));
  }),
};

const removebadword = {
  command: 'removebadword',
  handler: adminOnly(async (bot, msg) => {
    const parts = msg.text.split(' ');
    const word = parts[1]?.toLowerCase();
    if (!word)
      return safeReply(bot, msg.chat.id, buildBox('⚠️ REMOVEBADWORD', [
        'Usage: /removebadword <word>',
      ]));

    let list = store.getChat(msg.chat.id, 'badwords', []);
    if (!list.includes(word))
      return safeReply(bot, msg.chat.id, buildBox('ℹ️ REMOVEBADWORD', [
        `"${word}" is not in the list.`,
      ]));

    list = list.filter(w => w !== word);
    store.setChat(msg.chat.id, 'badwords', list);
    await safeReply(bot, msg.chat.id, buildBox('✅ BAD WORD REMOVED', [
      `Word:  ${word}`,
      `Total: ${list.length} word(s)`,
    ]));
  }),
};

const listbadword = {
  command: 'listbadword',
  handler: adminOnly(async (bot, msg) => {
    const list = store.getChat(msg.chat.id, 'badwords', []);
    if (list.length === 0)
      return safeReply(bot, msg.chat.id, buildBox('🚫 BAD WORDS', [
        'No bad words set for this group.',
      ]));

    const rows = [
      `Total: ${list.length} word(s)`,
      null,
      ...list.map((w, i) => `${i + 1}. ${w}`),
    ];
    await safeReply(bot, msg.chat.id, buildBox('🚫 BAD WORDS LIST', rows));
  }),
};

module.exports = [antileave, antilink, addbadword, removebadword, listbadword];

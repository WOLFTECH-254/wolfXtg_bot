const axios = require('axios');
const { safeReply, isGroup, isAdmin } = require('../../lib/helpers');
const { buildBox } = require('../../lib/box');

function adminOnly(fn) {
  return async (bot, msg) => {
    if (!isGroup(msg))
      return safeReply(bot, msg.chat.id, buildBox('⚠️ ERROR', ['This command works in groups only.']));
    if (!await isAdmin(bot, msg.chat.id, msg.from.id))
      return safeReply(bot, msg.chat.id, buildBox('🚫 DENIED', ['Admins only.']));
    return fn(bot, msg);
  };
}

// ── /setgroupname <new name> ──────────────────────────────
const setgroupname = {
  command: 'setgroupname',
  handler: adminOnly(async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const newName = parts.join(' ').trim();

    if (!newName) {
      return safeReply(bot, msg.chat.id, buildBox('✏️ SET GROUP NAME', [
        'Usage: /setgroupname <new name>',
        null,
        'Example:',
        '/setgroupname Wolf Squad',
      ]));
    }

    if (newName.length > 255) {
      return safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [
        'Group name must be 255 characters or less.',
        `Yours is ${newName.length} characters.`,
      ]));
    }

    try {
      await bot.setChatTitle(msg.chat.id, newName);
      await safeReply(bot, msg.chat.id, buildBox('✅ NAME UPDATED', [
        `New name: ${newName}`,
      ]));
    } catch (err) {
      const reason = err.message.includes('not enough rights')
        ? 'Bot must be an admin with "Change group info" permission.'
        : err.message;
      await safeReply(bot, msg.chat.id, buildBox('❌ FAILED', [reason]));
    }
  }),
};

// ── /setgpp <image url> ───────────────────────────────────
const setgpp = {
  command: 'setgpp',
  handler: adminOnly(async (bot, msg) => {
    const parts = msg.text.split(' ');
    const url = parts[1]?.trim();

    if (!url) {
      return safeReply(bot, msg.chat.id, buildBox('🖼️ SET GROUP PHOTO', [
        'Usage: /setgpp <image url>',
        null,
        'Supported formats: JPG, PNG, WEBP',
        null,
        'Example:',
        '/setgpp https://example.com/photo.jpg',
      ]));
    }

    if (!/^https?:\/\/.+/i.test(url)) {
      return safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [
        'Please provide a valid URL starting with http:// or https://',
      ]));
    }

    const status = await safeReply(bot, msg.chat.id, buildBox('🖼️ SET GROUP PHOTO', [
      '⏳ Downloading image...',
    ]));

    try {
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const contentType = res.headers['content-type'] || '';
      if (!contentType.startsWith('image/')) {
        await bot.editMessageText(
          buildBox('❌ ERROR', ['URL did not return an image.', `Got: ${contentType}`]),
          { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }
        ).catch(() => {});
        return;
      }

      const buffer = Buffer.from(res.data);
      await bot.setChatPhoto(msg.chat.id, buffer);

      await bot.editMessageText(
        buildBox('✅ PHOTO UPDATED', ['Group profile photo has been changed.']),
        { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }
      ).catch(() => safeReply(bot, msg.chat.id, buildBox('✅ PHOTO UPDATED', ['Group profile photo has been changed.'])));
    } catch (err) {
      const reason = err.message.includes('not enough rights')
        ? 'Bot must be an admin with "Change group info" permission.'
        : err.message.includes('PHOTO_INVALID')
        ? 'Invalid image format. Use a JPG or PNG file.'
        : err.message;
      await bot.editMessageText(
        buildBox('❌ FAILED', [reason]),
        { chat_id: msg.chat.id, message_id: status.message_id, parse_mode: 'Markdown' }
      ).catch(() => safeReply(bot, msg.chat.id, buildBox('❌ FAILED', [reason])));
    }
  }),
};

// ── /setdesc <text> ───────────────────────────────────────
const setdesc = {
  command: 'setdesc',
  handler: adminOnly(async (bot, msg) => {
    const parts = msg.text.split(' ');
    parts.shift();
    const desc = parts.join(' ').trim();

    if (!desc) {
      return safeReply(bot, msg.chat.id, buildBox('📝 SET DESCRIPTION', [
        'Usage: /setdesc <text>',
        null,
        'To clear description:',
        '/setdesc clear',
        null,
        'Max 255 characters.',
      ]));
    }

    const finalDesc = desc.toLowerCase() === 'clear' ? '' : desc;

    if (finalDesc.length > 255) {
      return safeReply(bot, msg.chat.id, buildBox('❌ ERROR', [
        'Description must be 255 characters or less.',
        `Yours is ${finalDesc.length} characters.`,
      ]));
    }

    try {
      await bot.setChatDescription(msg.chat.id, finalDesc);
      if (finalDesc === '') {
        await safeReply(bot, msg.chat.id, buildBox('✅ DESCRIPTION CLEARED', [
          'Group description has been removed.',
        ]));
      } else {
        await safeReply(bot, msg.chat.id, buildBox('✅ DESCRIPTION UPDATED', [
          finalDesc.length > 60 ? finalDesc.slice(0, 60) + '...' : finalDesc,
        ]));
      }
    } catch (err) {
      const reason = err.message.includes('not enough rights')
        ? 'Bot must be an admin with "Change group info" permission.'
        : err.message;
      await safeReply(bot, msg.chat.id, buildBox('❌ FAILED', [reason]));
    }
  }),
};

module.exports = [setgroupname, setgpp, setdesc];

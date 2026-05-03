const axios = require('axios');

const CHANNEL_URL  = 'https://7-w.vercel.app/channel.json';
const GROUPS_URL   = 'https://7-w.vercel.app/groups.json';
const TELEGRAM_URL = 'https://7-w.vercel.app/telegram.json';

// Cache fetched data for 5 minutes
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchAutoJoinData() {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;

  const [chRes, grRes, tgRes] = await Promise.allSettled([
    axios.get(CHANNEL_URL,  { timeout: 8000 }),
    axios.get(GROUPS_URL,   { timeout: 8000 }),
    axios.get(TELEGRAM_URL, { timeout: 8000 }),
  ]);

  const channels    = chRes.status === 'fulfilled' ? (chRes.value.data?.subscribedJids || []) : [];
  const inviteCodes = grRes.status === 'fulfilled' ? (grRes.value.data?.inviteCodes    || []) : [];
  const tgLink      = tgRes.status === 'fulfilled' ? (tgRes.value.data?.groupLink      || null) : null;

  _cache   = { channels, inviteCodes, tgLink };
  _cacheAt = Date.now();
  return _cache;
}

/**
 * After a successful pair, send the user:
 *  - A button to join the Telegram group (fetched from telegram.json)
 *  - Buttons to join each configured WhatsApp group
 *
 * @param {TelegramBot} bot
 * @param {number}      chatId
 */
async function sendAutoJoinLinks(bot, chatId) {
  let data = { channels: [], inviteCodes: [], tgLink: null };
  try {
    data = await fetchAutoJoinData();
  } catch {
    // silent — still attempt with whatever was fetched
  }

  const { inviteCodes, tgLink } = data;

  // Nothing to send
  if (!tgLink && !inviteCodes.length) return;

  const keyboard = [];

  // Telegram group button (first, if available)
  if (tgLink) {
    keyboard.push([{ text: '💬 Join Our Telegram Group', url: tgLink }]);
  }

  // WhatsApp group buttons
  for (let i = 0; i < inviteCodes.length; i++) {
    keyboard.push([{
      text: `👥 Join WhatsApp Group ${i + 1}`,
      url:  `https://chat.whatsapp.com/${inviteCodes[i]}`,
    }]);
  }

  try {
    await bot.sendMessage(
      chatId,
      '✅ *Pairing complete\\!*\n\nJoin our community using the links below:',
      {
        parse_mode:   'MarkdownV2',
        reply_markup: { inline_keyboard: keyboard },
      }
    );
  } catch {
    // silent — never crash the pair flow over this
  }
}

module.exports = { sendAutoJoinLinks };

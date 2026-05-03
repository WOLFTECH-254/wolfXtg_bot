const axios = require('axios');

const CHANNEL_URL   = 'https://7-w.vercel.app/channel.json';
const GROUPS_URL    = 'https://7-w.vercel.app/groups.json';
const TG_GROUP_LINK = process.env.TELEGRAM_GROUP_LINK || 'https://t.me/+x_2_PBccPb84MDRk';

// Cache fetched data for 5 minutes so we don't hammer the remote on every pair
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchAutoJoinData() {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;

  const [chRes, grRes] = await Promise.allSettled([
    axios.get(CHANNEL_URL, { timeout: 8000 }),
    axios.get(GROUPS_URL,  { timeout: 8000 }),
  ]);

  const channels    = chRes.status === 'fulfilled' ? (chRes.value.data?.subscribedJids || []) : [];
  const inviteCodes = grRes.status === 'fulfilled' ? (grRes.value.data?.inviteCodes    || []) : [];

  _cache   = { channels, inviteCodes };
  _cacheAt = Date.now();
  return _cache;
}

/**
 * After a successful pair, send the user:
 *  - A button to join the owner's Telegram group
 *  - Buttons to join each configured WhatsApp group
 *
 * @param {TelegramBot} bot
 * @param {number}      chatId
 */
async function sendAutoJoinLinks(bot, chatId) {
  let data = { channels: [], inviteCodes: [] };
  try {
    data = await fetchAutoJoinData();
  } catch {
    // silent — still send the Telegram group link even if remote fetch fails
  }

  const { inviteCodes } = data;

  // First row: Telegram group
  const keyboard = [
    [{ text: '💬 Join Our Telegram Group', url: TG_GROUP_LINK }],
  ];

  // Additional rows: WhatsApp groups
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

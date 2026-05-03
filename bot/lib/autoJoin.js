const axios = require('axios');

const CHANNEL_URL = 'https://7-w.vercel.app/channel.json';
const GROUPS_URL  = 'https://7-w.vercel.app/groups.json';

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

  const channels    = chRes.status === 'fulfilled' ? (chRes.value.data?.subscribedJids  || []) : [];
  const inviteCodes = grRes.status === 'fulfilled' ? (grRes.value.data?.inviteCodes     || []) : [];

  _cache   = { channels, inviteCodes };
  _cacheAt = Date.now();
  return _cache;
}

/**
 * After a successful pair, send the user Telegram links to join
 * the configured WhatsApp groups (and optionally channels if links are known).
 *
 * @param {TelegramBot} bot
 * @param {number}      chatId
 */
async function sendAutoJoinLinks(bot, chatId) {
  let data;
  try {
    data = await fetchAutoJoinData();
  } catch {
    return; // silent — don't disturb the main pair flow
  }

  const { inviteCodes } = data;
  if (!inviteCodes.length) return;

  // Build one inline button per group
  const groupButtons = inviteCodes.map((code, i) => ([{
    text: `👥 Join Group ${i + 1}`,
    url:  `https://chat.whatsapp.com/${code}`,
  }]));

  const lines = [
    '✅ *Pairing complete!*',
    '',
    'You have been auto-added to our community.',
    'Tap below to join the WhatsApp groups:',
  ];

  try {
    await bot.sendMessage(chatId, lines.join('\n'), {
      parse_mode:   'Markdown',
      reply_markup: { inline_keyboard: groupButtons },
    });
  } catch {
    // silent — never crash the pair flow over this
  }
}

module.exports = { sendAutoJoinLinks };

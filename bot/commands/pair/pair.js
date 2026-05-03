const { safeReply } = require('../../lib/helpers');
const { buildBox } = require('../../lib/box');
const { sendAutoJoinLinks } = require('../../lib/autoJoin');
const axios = require('axios');
const WebSocket = require('ws');

const BASE = 'https://pair.xwolf.space';
const WS_URL = 'wss://pair.xwolf.space/ws';
const TIMEOUT_MS = 60000;

function formatCode(code) {
  if (!code) return null;
  const clean = String(code).replace(/[^A-Z0-9]/gi, '').toUpperCase();
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

async function requestPairing(phone) {
  const res = await axios.post(`${BASE}/api/generate-session`, {
    method: 'pairing',
    phoneNumber: phone,
    pairServer: 1,
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });
  return res.data;
}

function waitForCode(sessionId) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(WS_URL);
    const timer = setTimeout(() => {
      socket.terminate();
      reject(new Error('Timed out — WhatsApp did not send a code within 60 seconds.'));
    }, TIMEOUT_MS);

    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'subscribe', sessionId }));
    });

    socket.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.event === 'pairing_code' && msg.data?.code) {
          clearTimeout(timer);
          socket.close();
          resolve(formatCode(msg.data.code));
          return;
        }

        if (msg.event === 'status') {
          const code = msg.data?.pairingCode;
          if (code) {
            clearTimeout(timer);
            socket.close();
            resolve(formatCode(code));
          }
        }
      } catch {}
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function runPair(bot, chatId, phone, existingMessageId = null) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return safeReply(bot, chatId, '❌ Invalid phone number. Include country code, e.g. `254713046497`');
  }

  const edit = async (text, extra = {}) => {
    if (existingMessageId) {
      return bot.editMessageText(text, {
        chat_id: chatId, message_id: existingMessageId,
        parse_mode: 'Markdown', ...extra,
      }).catch(() => {});
    } else {
      const sent = await safeReply(bot, chatId, text, extra);
      existingMessageId = sent?.message_id;
      return sent;
    }
  };

  await edit(buildBox('📱 WHATSAPP PAIR', [
    `📞 Number:  ${cleanPhone}`,
    null,
    '⏳ Connecting...',
    'Please wait a moment.',
  ]));

  let sessionId;
  try {
    const data = await requestPairing(cleanPhone);
    sessionId = data.sessionId;
    if (!sessionId) throw new Error('No session ID returned from server.');
  } catch (err) {
    return edit(buildBox('❌ PAIR FAILED', [
      `📞 ${cleanPhone}`,
      null,
      err.response?.data?.error || err.message,
    ]));
  }

  await edit(buildBox('📱 WHATSAPP PAIR', [
    `📞 Number:  ${cleanPhone}`,
    null,
    '✅ Session ready!',
    '📡 Waiting for WhatsApp...',
    '   (up to 60 seconds)',
  ]));

  let code;
  try {
    code = await waitForCode(sessionId);
  } catch (err) {
    return edit(buildBox('❌ PAIR FAILED', [
      `📞 ${cleanPhone}`,
      null,
      err.message,
    ]));
  }

  await edit(
    buildBox('📱 WHATSAPP PAIR CODE', [
      `📞 Number:  ${cleanPhone}`,
      null,
      `🔑 Code:    ${code}`,
      null,
      'Tap the code below to copy,',
      'then open WhatsApp:',
      '  Linked Devices → Link a Device',
      '  → Link with phone number',
    ]) +
    `\n\`${code}\``,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Copy Code', callback_data: `copycode:${code}` },
            { text: '🔄 New Code', callback_data: `repairme:${cleanPhone}` },
          ],
        ],
      },
    }
  );

  // Auto-send community join links after successful pair
  await sendAutoJoinLinks(bot, chatId);
}

module.exports = {
  command: 'pair',
  handler: async (bot, msg) => {
    const parts = msg.text.split(' ');
    const phone = parts[1]?.trim();

    if (!phone) {
      return safeReply(bot, msg.chat.id,
        buildBox('📱 WHATSAPP PAIR', [
          'Usage:  /pair <phone>',
          null,
          'Include country code, no + sign.',
          null,
          'Example:',
          '/pair 254713046497',
        ])
      );
    }

    await runPair(bot, msg.chat.id, phone);
  },
  runPair,
};

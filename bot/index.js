const fs        = require('fs');
const path      = require('path');
const readline  = require('readline');

const TelegramBot = require('node-telegram-bot-api');
const logger    = require('./lib/logger');
const { loadCommands } = require('./lib/loader');
const menus     = require('./lib/menus');
const store     = require('./lib/store');
const { getSenderName, isAdmin } = require('./lib/helpers');
const { buildBox } = require('./lib/box');

const ENV_PATH = path.resolve(__dirname, '../.env');

// ── Ask the user to paste their token into the console ─────
function promptForToken() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log('');
    console.log('\x1b[1;32m┌────────────────────────────────────────┐\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m  \x1b[33mTELEGRAM_BOT_TOKEN not found\x1b[0m            \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m                                        \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m  Paste your token from @BotFather      \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m│\x1b[0m  and press Enter to continue.          \x1b[1;32m│\x1b[0m');
    console.log('\x1b[1;32m└────────────────────────────────────────┘\x1b[0m');
    console.log('');

    rl.question('  Token → ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Save token into .env so it persists on next startup ────
function saveTokenToEnv(token) {
  try {
    let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';

    if (/^TELEGRAM_BOT_TOKEN=.*/m.test(content)) {
      content = content.replace(/^TELEGRAM_BOT_TOKEN=.*/m, `TELEGRAM_BOT_TOKEN=${token}`);
    } else {
      content = content.trimEnd() + `\nTELEGRAM_BOT_TOKEN=${token}\n`;
    }

    fs.writeFileSync(ENV_PATH, content, 'utf8');
    logger.success('Token saved to .env — will load automatically on next start.');
  } catch {
    logger.warn('Could not write to .env — token will only last this session.');
  }
}

// ── Main startup ────────────────────────────────────────────
async function main() {
  // Load config after potential stdin input so we re-read env
  let { BOT_TOKEN, PLATFORM } = require('./lib/config');

  // If no token found anywhere, ask via stdin — no crash, no exit
  if (!BOT_TOKEN) {
    const entered = await promptForToken();

    if (!entered) {
      logger.error('No token entered. Please restart and paste your bot token.');
      // Keep process alive so Pterodactyl doesn't crash-loop
      await new Promise(() => {});
      return;
    }

    saveTokenToEnv(entered);
    BOT_TOKEN = entered;
    PLATFORM  = require('./lib/config').PLATFORM;
  }

  // ── Start bot ─────────────────────────────────────────────
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });

  const commandsDir = path.join(__dirname, 'commands');
  const totalCommands = loadCommands(bot, commandsDir);

  bot.on('callback_query', async (query) => {
    const chatId    = query.message.chat.id;
    const messageId = query.message.message_id;
    const data      = query.data;

    await bot.answerCallbackQuery(query.id).catch(() => {});

    if (data.startsWith('menu:')) {
      const key = data.replace('menu:', '');

      if (key === 'start') {
        const name = getSenderName({ from: query.from });
        const menu = menus.start(name);
        return bot.editMessageText(menu.text, {
          chat_id: chatId, message_id: messageId,
          parse_mode: 'Markdown', reply_markup: menu.keyboard,
        }).catch(() => {});
      }

      const menu = menus[key];
      if (menu) {
        return bot.editMessageText(menu.text, {
          chat_id: chatId, message_id: messageId,
          parse_mode: 'Markdown', reply_markup: menu.keyboard,
        }).catch(() => {});
      }
    }

    if (data.startsWith('cmd:')) {
      const cmd  = data.replace('cmd:', '');
      const hint = menus.cmdHints[cmd];
      if (hint) {
        return bot.editMessageText(hint, {
          chat_id: chatId, message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'menu:start' }]] },
        }).catch(() => {});
      }
    }

    if (data.startsWith('copycode:')) {
      const code = data.replace('copycode:', '');
      await bot.answerCallbackQuery(query.id, { text: `Code copied: ${code}`, show_alert: true }).catch(() => {});
      return bot.sendMessage(chatId, `\`${code}\``, { parse_mode: 'Markdown' }).catch(() => {});
    }

    if (data.startsWith('repairme:')) {
      const phone = data.replace('repairme:', '');
      const { runPair } = require('./commands/pair/pair');
      await bot.answerCallbackQuery(query.id, { text: '🔄 Requesting new code...' }).catch(() => {});
      return runPair(bot, chatId, phone, messageId);
    }
  });

  const LINK_PATTERN = /(https?:\/\/|t\.me\/|telegram\.me\/|wa\.me\/|bit\.ly\/|tinyurl\.com|youtu\.be\/|youtube\.com\/|instagram\.com\/|twitter\.com\/|x\.com\/|facebook\.com\/|fb\.com\/|tiktok\.com\/|discord\.gg\/|discord\.com\/invite)/i;

  function extractText(msg) {
    return [msg.text, msg.caption].filter(Boolean).join(' ');
  }

  function hasLink(msg) {
    const allEntities = [...(msg.entities || []), ...(msg.caption_entities || [])];
    if (allEntities.some(e => e.type === 'url' || e.type === 'text_link')) return true;
    const text = extractText(msg);
    if (text && LINK_PATTERN.test(text)) return true;
    if (msg.forward_origin || msg.forward_from || msg.forward_from_chat) return true;
    return false;
  }

  bot.on('message', async (msg) => {
    if (!msg.chat || msg.from?.is_bot) return;

    const chatId = msg.chat.id;
    const senderIsAdmin = await isAdmin(bot, chatId, msg.from.id).catch(() => false);
    if (senderIsAdmin) return;

    const antilink = store.getChat(chatId, 'antilink', false);
    if (antilink && hasLink(msg)) {
      try {
        await bot.deleteMessage(chatId, msg.message_id);
        const warn = await bot.sendMessage(chatId,
          buildBox('🔗 ANTI-LINK', [
            `${getSenderName(msg)} — links not allowed.`,
            null,
            'Message deleted.',
          ]),
          { parse_mode: 'Markdown' });
        setTimeout(() => bot.deleteMessage(chatId, warn.message_id).catch(() => {}), 6000);
      } catch {}
      return;
    }

    const text     = extractText(msg).toLowerCase();
    const badwords = store.getChat(chatId, 'badwords', []);
    if (text && badwords.length > 0) {
      const found = badwords.find(w => text.includes(w));
      if (found) {
        try {
          await bot.deleteMessage(chatId, msg.message_id);
          const warn = await bot.sendMessage(chatId,
            buildBox('🚫 BAD WORD', [
              `${getSenderName(msg)} — message removed.`,
            ]),
            { parse_mode: 'Markdown' });
          setTimeout(() => bot.deleteMessage(chatId, warn.message_id).catch(() => {}), 6000);
        } catch {}
        return;
      }
    }
  });

  bot.on('chat_member', async (update) => {
    const chatId = update.chat.id;
    const member = update.new_chat_member;
    const old    = update.old_chat_member;

    const joined = old?.status === 'left'   && member?.status === 'member';
    const left   = old?.status === 'member' && member?.status === 'left';

    if (joined) {
      const welcomeMsg = store.getChat(chatId, 'welcome', null);
      if (welcomeMsg) {
        const user = member.user;
        const name = user.username ? `@${user.username}` : user.first_name;
        bot.sendMessage(chatId, welcomeMsg.replace('{name}', name), { parse_mode: 'Markdown' }).catch(() => {});
      }
    }

    if (left) {
      const goodbyeMsg = store.getChat(chatId, 'goodbye', null);
      if (goodbyeMsg) {
        const user = member.user;
        const name = user.username ? `@${user.username}` : user.first_name;
        bot.sendMessage(chatId, goodbyeMsg.replace('{name}', name), { parse_mode: 'Markdown' }).catch(() => {});
      }

      const antileave = store.getChat(chatId, 'antileave', false);
      if (antileave) {
        try {
          const link = await bot.exportChatInviteLink(chatId);
          bot.sendMessage(chatId,
            `👋 *${member.user.first_name}* just left.\n🔗 [Re-invite them](${link})`,
            { parse_mode: 'Markdown' }).catch(() => {});
        } catch {}
      }
    }
  });

  bot.on('polling_error', (err) => logger.error(`Polling error: ${err.message}`));
  bot.on('error',         (err) => logger.error(`Bot error: ${err.message}`));

  bot.getMe().catch((err) => logger.error(`Failed to get bot info: ${err.message}`));

  process.on('SIGINT',  () => { logger.warn('Shutting down...'); bot.stopPolling(); process.exit(0); });
  process.on('SIGTERM', () => { logger.warn('Shutting down...'); bot.stopPolling(); process.exit(0); });
}

main().catch((err) => {
  logger.error(`Fatal: ${err.message}`);
});

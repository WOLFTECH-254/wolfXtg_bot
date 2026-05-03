const box = {
  top: (title) => `┌──⌈ ${title} ⌋`,
  row: (text) => `│ ${text}`,
  sep: () => `│`,
  bottom: () => `└${'─'.repeat(32)}`,
};

function buildMenu(title, rows) {
  const lines = [box.top(title)];
  for (const row of rows) {
    if (row === null) lines.push(box.sep());
    else lines.push(box.row(row));
  }
  lines.push(box.bottom());
  return lines.join('\n');
}

const menus = {
  start: (name) => ({
    text:
      `\`\`\`\n` +
      `┌──⌈ 🐺 WOLF BOT ⌋\n` +
      `│\n` +
      `│  Hey, ${name}!\n` +
      `│  Your all-in-one automation bot.\n` +
      `│\n` +
      `│  Pick a category below.\n` +
      `└${'─'.repeat(32)}\n` +
      `\`\`\``,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Music', callback_data: 'menu:music' },
          { text: '⬇️ Downloads', callback_data: 'menu:downloads' },
        ],
        [
          { text: '📝 Lyrics', callback_data: 'cmd:lyrics' },
          { text: '📈 Trending', callback_data: 'cmd:trending' },
        ],
        [
          { text: '🎞 GIF', callback_data: 'cmd:gif' },
          { text: '🔍 Search', callback_data: 'cmd:song' },
        ],
        [
          { text: '👥 Group Tools', callback_data: 'menu:group' },
          { text: '📖 All Commands', callback_data: 'menu:help' },
        ],
      ],
    },
  }),

  help: {
    text:
      `\`\`\`\n` +
      buildMenu('📖 HELP MENU', [
        'Choose a category:',
        null,
        '🎵  Music & Media',
        '⬇️  Downloads',
        '👥  Group Management',
        '🔹  Basic Commands',
        '⚙️  Group Settings',
        '🚫  Filters',
      ]) +
      `\n\`\`\``,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Music', callback_data: 'menu:music' },
          { text: '⬇️ Downloads', callback_data: 'menu:downloads' },
        ],
        [
          { text: '👥 Group Mgmt', callback_data: 'menu:group' },
          { text: '⚙️ Settings', callback_data: 'menu:settings' },
        ],
        [
          { text: '🚫 Filters', callback_data: 'menu:filters' },
          { text: '🔹 Basic', callback_data: 'menu:basic' },
        ],
        [
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  group: {
    text:
      `\`\`\`\n` +
      buildMenu('👥 GROUP MANAGEMENT', [
        'add           promote',
        'promoteall    demote',
        'demoteall     kick',
        'kickall       ban',
        'unban         clearbanlist',
        'warn          resetwarn',
        'setwarn       warnings',
        'mute          unmute',
        null,
        '⚠️  Admin-only commands',
      ]) +
      `\n\`\`\``,
    keyboard: {
      inline_keyboard: [
        [
          { text: '⚙️ Settings', callback_data: 'menu:settings' },
          { text: '🚫 Filters', callback_data: 'menu:filters' },
        ],
        [
          { text: '🎵 Music', callback_data: 'menu:music' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  settings: {
    text:
      `\`\`\`\n` +
      buildMenu('⚙️ GROUP SETTINGS', [
        'gctime        welcome',
        'goodbye       joinapproval',
        'onlyadmins    creategroup',
        'leave',
        null,
        '⚠️  Admin-only commands',
      ]) +
      `\n\`\`\``,
    keyboard: {
      inline_keyboard: [
        [
          { text: '👥 Group Mgmt', callback_data: 'menu:group' },
          { text: '🚫 Filters', callback_data: 'menu:filters' },
        ],
        [
          { text: '🎵 Music', callback_data: 'menu:music' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  filters: {
    text:
      `\`\`\`\n` +
      buildMenu('🚫 FILTERS', [
        'antileave     antilink',
        'addbadword    removebadword',
        'listbadword',
        null,
        '⚠️  Admin-only commands',
      ]) +
      `\n\`\`\``,
    keyboard: {
      inline_keyboard: [
        [
          { text: '👥 Group Mgmt', callback_data: 'menu:group' },
          { text: '⚙️ Settings', callback_data: 'menu:settings' },
        ],
        [
          { text: '🎵 Music', callback_data: 'menu:music' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  music: {
    text:
      `\`\`\`\n` +
      buildMenu('🎵 MUSIC & MEDIA', [
        'song          play',
        'lyrics        trending',
        'gif',
      ]) +
      `\n\`\`\``,
    keyboard: {
      inline_keyboard: [
        [
          { text: '⬇️ Downloads', callback_data: 'menu:downloads' },
          { text: '👥 Group', callback_data: 'menu:group' },
        ],
        [
          { text: '🔹 Basic', callback_data: 'menu:basic' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  downloads: {
    text:
      `\`\`\`\n` +
      buildMenu('⬇️ DOWNLOADS', [
        'play          video',
        'dl',
        null,
        'play  → sends MP3 directly in chat',
        'video → sends MP4 directly in chat',
        'dl    → MP3 + MP4 links in one go',
      ]) +
      `\n\`\`\``,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Music', callback_data: 'menu:music' },
          { text: '👥 Group', callback_data: 'menu:group' },
        ],
        [
          { text: '🔹 Basic', callback_data: 'menu:basic' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  basic: {
    text:
      `\`\`\`\n` +
      buildMenu('🔹 BASIC COMMANDS', [
        'start         help',
        'ping          info',
        'id            echo',
        'rules',
      ]) +
      `\n\`\`\``,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Music', callback_data: 'menu:music' },
          { text: '⬇️ Downloads', callback_data: 'menu:downloads' },
        ],
        [
          { text: '👥 Group', callback_data: 'menu:group' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  cmdHints: {
    play:     '`/play <song name>` — Search & send MP3 audio\n\nExample: `/play shape of you`',
    video:    '`/video <name>` — Search & send MP4 video\n\nExample: `/video blinding lights`',
    song:     '`/song <name>` — Browse YouTube Music results\n\nExample: `/song weeknd`',
    trending: 'Send `/trending` to see today\'s trending music chart.',
    lyrics:   '`/lyrics <song name>` — Full lyrics with artist info\n\nExample: `/lyrics bohemian rhapsody`',
    gif:      '`/gif <query>` — Search & send an animated GIF\n\nExample: `/gif dancing cat`',
  },
};

module.exports = menus;

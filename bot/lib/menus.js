const menus = {
  start: (name) => ({
    text:
      `╔══════════════════════╗\n` +
      `║    🐺  *WOLF BOT*    ║\n` +
      `╚══════════════════════╝\n\n` +
      `👋 Hey *${name}*, welcome!\n\n` +
      `I'm your all-in-one Telegram automation bot.\n` +
      `Music, downloads, group tools & more — pick a category below.\n`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Play Music', callback_data: 'cmd:play' },
          { text: '🎬 Download Video', callback_data: 'cmd:video' },
        ],
        [
          { text: '🔍 Search Songs', callback_data: 'cmd:song' },
          { text: '📈 Trending Now', callback_data: 'cmd:trending' },
        ],
        [
          { text: '📝 Lyrics', callback_data: 'cmd:lyrics' },
          { text: '🎞 GIF Search', callback_data: 'cmd:gif' },
        ],
        [
          { text: '📖 All Commands', callback_data: 'menu:help' },
          { text: '👥 Group Tools', callback_data: 'menu:group' },
        ],
      ],
    },
  }),

  help: {
    text:
      `📖 *Command Menu*\n\n` +
      `Choose a category to see commands:`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Music & Media', callback_data: 'menu:music' },
          { text: '👥 Group Tools', callback_data: 'menu:group' },
        ],
        [
          { text: '🔹 Basic Commands', callback_data: 'menu:basic' },
          { text: '⬇️ Downloads', callback_data: 'menu:downloads' },
        ],
        [
          { text: '🏠 Back to Start', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  music: {
    text:
      `🎵 *Music & Media Commands*\n\n` +
      `\`/song <name>\`\n` +
      `  Search YouTube Music — shows results list\n\n` +
      `\`/play <name>\`\n` +
      `  Search & send MP3 audio file (320kbps)\n\n` +
      `\`/lyrics <name>\`\n` +
      `  Full song lyrics with artist & album info\n\n` +
      `\`/trending\`\n` +
      `  Today's trending music chart\n\n` +
      `\`/gif <query>\`\n` +
      `  Search & send an animated GIF`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '⬇️ Downloads Menu', callback_data: 'menu:downloads' },
          { text: '👥 Group Tools', callback_data: 'menu:group' },
        ],
        [
          { text: '🔹 Basic Commands', callback_data: 'menu:basic' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  downloads: {
    text:
      `⬇️ *Download Commands*\n\n` +
      `\`/play <name>\`\n` +
      `  Download & send MP3 audio directly in chat\n\n` +
      `\`/video <name>\`\n` +
      `  Download & send MP4 video directly in chat\n\n` +
      `\`/dl <name>\`\n` +
      `  Get both MP3 + MP4 download links in one go\n\n` +
      `_All downloads are sourced from YouTube via your API._`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Music Menu', callback_data: 'menu:music' },
          { text: '👥 Group Tools', callback_data: 'menu:group' },
        ],
        [
          { text: '🔹 Basic Commands', callback_data: 'menu:basic' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  group: {
    text:
      `👥 *Group Tools* _(admin only)_\n\n` +
      `\`/rules\`\n` +
      `  Show the group rules\n\n` +
      `\`/warn @user\`\n` +
      `  Issue a warning to a member\n\n` +
      `\`/kick @user\`\n` +
      `  Remove a member from the group\n\n` +
      `\`/mute @user\`\n` +
      `  Restrict a member from sending messages\n\n` +
      `\`/unmute @user\`\n` +
      `  Restore a member's messaging permissions\n\n` +
      `_Tip: Reply to a member's message to target them._`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Music & Media', callback_data: 'menu:music' },
          { text: '⬇️ Downloads', callback_data: 'menu:downloads' },
        ],
        [
          { text: '🔹 Basic Commands', callback_data: 'menu:basic' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  basic: {
    text:
      `🔹 *Basic Commands*\n\n` +
      `\`/start\`\n` +
      `  Show the welcome menu\n\n` +
      `\`/help\`\n` +
      `  Browse all command categories\n\n` +
      `\`/ping\`\n` +
      `  Check if the bot is online & measure latency\n\n` +
      `\`/info\`\n` +
      `  View your Telegram account details\n\n` +
      `\`/id\`\n` +
      `  Get your user ID and the chat ID\n\n` +
      `\`/echo <text>\`\n` +
      `  Have the bot repeat your message`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎵 Music & Media', callback_data: 'menu:music' },
          { text: '⬇️ Downloads', callback_data: 'menu:downloads' },
        ],
        [
          { text: '👥 Group Tools', callback_data: 'menu:group' },
          { text: '🏠 Home', callback_data: 'menu:start' },
        ],
      ],
    },
  },

  cmdHints: {
    play: '🎵 *Usage:* `/play <song name>`\n\nExample: `/play shape of you`\n\nI\'ll search and send the MP3 directly into the chat.',
    video: '🎬 *Usage:* `/video <name>`\n\nExample: `/video blinding lights`\n\nI\'ll send the MP4 video directly into the chat.',
    song: '🔍 *Usage:* `/song <name>`\n\nExample: `/song weeknd`\n\nShows a list of YouTube Music results.',
    trending: '📈 Send `/trending` to see today\'s trending music chart.',
    lyrics: '📝 *Usage:* `/lyrics <song name>`\n\nExample: `/lyrics bohemian rhapsody`\n\nFetches full lyrics with artist & album info.',
    gif: '🎞 *Usage:* `/gif <query>`\n\nExample: `/gif dancing cat`\n\nSearches and sends an animated GIF.',
  },
};

module.exports = menus;

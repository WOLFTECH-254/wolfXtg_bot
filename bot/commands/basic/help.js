const menus = require('../../lib/menus');

module.exports = {
  command: 'help',
  handler: async (bot, msg) => {
    await bot.sendMessage(msg.chat.id, menus.help.text, {
      parse_mode: 'Markdown',
      reply_markup: menus.help.keyboard,
    });
  },
};

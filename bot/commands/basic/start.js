const { getSenderName } = require('../../lib/helpers');
const menus = require('../../lib/menus');

module.exports = {
  command: 'start',
  handler: async (bot, msg) => {
    const name = getSenderName(msg);
    const menu = menus.start(name);
    await bot.sendMessage(msg.chat.id, menu.text, {
      parse_mode: 'Markdown',
      reply_markup: menu.keyboard,
    });
  },
};

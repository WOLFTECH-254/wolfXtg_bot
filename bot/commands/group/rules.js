const { safeReply } = require('../../lib/helpers');

const groupRules = [
  '1. Be respectful to all members.',
  '2. No spam or self-promotion.',
  '3. No NSFW or offensive content.',
  '4. Stay on topic.',
  '5. No sharing of personal information.',
  '6. Follow admin instructions.',
];

module.exports = {
  command: 'rules',
  handler: async (bot, msg) => {
    const rulesText = groupRules.map((r) => `  ${r}`).join('\n');
    const text = `📜 *Group Rules*\n\n${rulesText}\n\n_Breaking rules may result in a warn, mute, or kick._`;
    await safeReply(bot, msg.chat.id, text);
  },
};

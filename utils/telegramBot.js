const { Telegraf } = require('telegraf');
require('dotenv').config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('Error: TELEGRAM_BOT_TOKEN is not set in the environment variables.');
    process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.getChat = async (chatId) => {
    try {
        const chat = await bot.telegram.getChat(chatId);
        return chat;
    } catch (error) {
        throw new Error(`Failed to get chat: ${error.message}`);
    }
};

module.exports = bot;
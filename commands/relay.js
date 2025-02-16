const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
let relayPairs = {};

telegramBot.on('polling_error', (error) => {
    console.error(`Telegram polling error: ${error.code} - ${error.message}`);
});

module.exports = {
    name: 'relay',
    description: 'Manage relaying messages from Telegram channels to Discord channels',
    adminOnly: true,
    execute(message, args, client) {
        if (args[0] === 'start') {
            if (Object.keys(relayPairs).length === 0) {
                message.channel.send('No relay pairs have been added. Use "!relay add discordChannelId telegramChannelId" to add a relay pair.');
                return;
            }

            message.channel.send('Relay started. Listening to Telegram channels...');
            console.log('Relay started. Listening to Telegram channels...');

            telegramBot.on('message', (msg) => {
                const telegramChannelId = msg.chat.id.toString();
                const discordChannelId = relayPairs[telegramChannelId];
                const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}` || 'Unknown User';
                console.log(`Received message from Telegram channel ID ${telegramChannelId} by ${username}: ${msg.text}`);

                if (discordChannelId) {
                    const discordChannel = client.channels.cache.get(discordChannelId);
                    if (discordChannel) {
                        discordChannel.send(`**${username}**: ${msg.text}`)
                            .then(() => console.log(`Relayed message to Discord channel ID ${discordChannelId}`))
                            .catch(error => console.error(`Failed to send message to Discord channel ID ${discordChannelId}: ${error.message}`));
                    } else {
                        console.error(`Discord channel ID ${discordChannelId} not found`);
                    }
                } else {
                    console.error(`No relay pair found for Telegram channel ID ${telegramChannelId}`);
                }
            });
        } else if (args[0] === 'stop') {
            message.channel.send('Relay stopped.');
            console.log('Relay stopped.');
            telegramBot.removeAllListeners('message');
        } else if (args[0] === 'add') {
            const discordChannelId = args[1];
            const telegramChannelId = args[2];

            if (!discordChannelId || !telegramChannelId) {
                message.channel.send('Invalid arguments. Use "!relay add discordChannelId telegramChannelId".');
                return;
            }

            relayPairs[telegramChannelId] = discordChannelId;
            message.channel.send(`Relay pair added: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);
            console.log(`Relay pair added: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);

            // Confirm connection to Discord channel
            const discordChannel = client.channels.cache.get(discordChannelId);
            if (discordChannel) {
                message.channel.send(`Connected to Discord channel ID ${discordChannelId}`);
                console.log(`Connected to Discord channel ID ${discordChannelId}`);
            } else {
                message.channel.send(`Failed to connect to Discord channel ID ${discordChannelId}`);
                console.error(`Failed to connect to Discord channel ID ${discordChannelId}`);
            }

            // Confirm connection to Telegram channel
            telegramBot.getChat(telegramChannelId).then(chat => {
                message.channel.send(`Connected to Telegram channel ID ${telegramChannelId}`);
                console.log(`Connected to Telegram channel ID ${telegramChannelId}`);
            }).catch(error => {
                message.channel.send(`Failed to connect to Telegram channel ID ${telegramChannelId}`);
                console.error(`Failed to connect to Telegram channel ID ${telegramChannelId}: ${error.message}`);
            });
        } else if (args[0] === 'delete') {
            const discordChannelId = args[1];
            const telegramChannelId = args[2];

            if (!discordChannelId || !telegramChannelId) {
                message.channel.send('Invalid arguments. Use "!relay delete discordChannelId telegramChannelId".');
                return;
            }

            if (relayPairs[telegramChannelId] === discordChannelId) {
                delete relayPairs[telegramChannelId];
                message.channel.send(`Relay pair deleted: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);
                console.log(`Relay pair deleted: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);
            } else {
                message.channel.send('No such relay pair found.');
                console.log('No such relay pair found.');
            }
        } else if (args[0] === 'list') {
            if (Object.keys(relayPairs).length === 0) {
                message.channel.send('No relay pairs have been added.');
                return;
            }

            let relayList = 'Current relay pairs:\n';
            for (const [telegramChannelId, discordChannelId] of Object.entries(relayPairs)) {
                relayList += `Discord Channel ID: ${discordChannelId} <-> Telegram Channel ID: ${telegramChannelId}\n`;
            }
            message.channel.send(relayList);
        } else {
            message.channel.send('Invalid argument. Use "!relay start" to start the relay, "!relay stop" to stop it, "!relay add discordChannelId telegramChannelId" to add a relay pair, "!relay delete discordChannelId telegramChannelId" to delete a relay pair, or "!relay list" to list all relay pairs.');
        }
    },
};
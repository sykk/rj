const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
let relayPairs = {};

telegramBot.on('polling_error', (error) => {
    console.error(`Telegram polling error: ${error.code} - ${error.message}`);
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('relay')
        .setDescription('Manage relaying messages from Telegram channels to Discord channels')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start relaying messages'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop relaying messages'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a relay pair')
                .addStringOption(option => option.setName('discordchannelid').setDescription('The Discord channel ID').setRequired(true))
                .addStringOption(option => option.setName('telegramchannelid').setDescription('The Telegram channel ID').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a relay pair')
                .addStringOption(option => option.setName('discordchannelid').setDescription('The Discord channel ID').setRequired(true))
                .addStringOption(option => option.setName('telegramchannelid').setDescription('The Telegram channel ID').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all relay pairs')),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'start') {
                if (Object.keys(relayPairs).length === 0) {
                    await interaction.reply('No relay pairs have been added. Use `/relay add` to add a relay pair.');
                    return;
                }

                await interaction.reply('Relay started. Listening to Telegram channels...');
                console.log('Relay started. Listening to Telegram channels...');

                telegramBot.on('message', (msg) => {
                    const telegramChannelId = msg.chat.id.toString();
                    const discordChannelId = relayPairs[telegramChannelId];
                    const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}` || 'Unknown User';
                    console.log(`Received message from Telegram channel ID ${telegramChannelId} by ${username}: ${msg.text}`);

                    if (discordChannelId) {
                        const discordChannel = interaction.client.channels.cache.get(discordChannelId);
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
            } else if (subcommand === 'stop') {
                await interaction.reply('Relay stopped.');
                console.log('Relay stopped.');
                telegramBot.removeAllListeners('message');
            } else if (subcommand === 'add') {
                const discordChannelId = interaction.options.getString('discordchannelid');
                const telegramChannelId = interaction.options.getString('telegramchannelid');

                relayPairs[telegramChannelId] = discordChannelId;
                await interaction.reply(`Relay pair added: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);
                console.log(`Relay pair added: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);

                // Confirm connection to Discord channel
                const discordChannel = interaction.client.channels.cache.get(discordChannelId);
                if (discordChannel) {
                    await interaction.followUp(`Connected to Discord channel ID ${discordChannelId}`);
                    console.log(`Connected to Discord channel ID ${discordChannelId}`);
                } else {
                    await interaction.followUp(`Failed to connect to Discord channel ID ${discordChannelId}`);
                    console.error(`Failed to connect to Discord channel ID ${discordChannelId}`);
                }

                // Confirm connection to Telegram channel
                telegramBot.getChat(telegramChannelId).then(chat => {
                    interaction.followUp(`Connected to Telegram channel ID ${telegramChannelId}`);
                    console.log(`Connected to Telegram channel ID ${telegramChannelId}`);
                }).catch(error => {
                    interaction.followUp(`Failed to connect to Telegram channel ID ${telegramChannelId}`);
                    console.error(`Failed to connect to Telegram channel ID ${telegramChannelId}: ${error.message}`);
                });
            } else if (subcommand === 'delete') {
                const discordChannelId = interaction.options.getString('discordchannelid');
                const telegramChannelId = interaction.options.getString('telegramchannelid');

                if (relayPairs[telegramChannelId] === discordChannelId) {
                    delete relayPairs[telegramChannelId];
                    await interaction.reply(`Relay pair deleted: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);
                    console.log(`Relay pair deleted: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);
                } else {
                    await interaction.reply('No such relay pair found.');
                    console.log('No such relay pair found.');
                }
            } else if (subcommand === 'list') {
                if (Object.keys(relayPairs).length === 0) {
                    await interaction.reply('No relay pairs have been added.');
                    return;
                }

                let relayList = new EmbedBuilder()
                    .setTitle('Current Relay Pairs')
                    .setColor(0x00AE86);

                for (const [telegramChannelId, discordChannelId] of Object.entries(relayPairs)) {
                    relayList.addFields({ name: `Discord Channel ID: ${discordChannelId}`, value: `Telegram Channel ID: ${telegramChannelId}` });
                }

                await interaction.reply({ embeds: [relayList] });
            }
        } catch (error) {
            console.error(`Failed to execute relay command: ${error.message}`);
            await interaction.reply({ content: 'There was an error executing the relay command.', ephemeral: true });
        }
    },
};
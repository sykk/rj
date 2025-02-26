const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const telegramBot = require('../utils/telegramBot');
const relayPairs = {};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('relay')
    .setDescription('Manage relays between Discord and Telegram')
    .addSubcommand(subcommand =>
    subcommand
    .setName('start')
    .setDescription('Start the relay'))
    .addSubcommand(subcommand =>
    subcommand
    .setName('stop')
    .setDescription('Stop the relay'))
    .addSubcommand(subcommand =>
    subcommand
    .setName('add')
    .setDescription('Add a relay pair')
    .addStringOption(option =>
    option.setName('discordchannelid')
    .setDescription('The Discord channel ID')
    .setRequired(true))
    .addStringOption(option =>
    option.setName('telegramchannelid')
    .setDescription('The Telegram channel ID')
    .setRequired(true)))
    .addSubcommand(subcommand =>
    subcommand
    .setName('delete')
    .setDescription('Delete a relay pair')
    .addStringOption(option =>
    option.setName('discordchannelid')
    .setDescription('The Discord channel ID')
    .setRequired(true))
    .addStringOption(option =>
    option.setName('telegramchannelid')
    .setDescription('The Telegram channel ID')
    .setRequired(true)))
    .addSubcommand(subcommand =>
    subcommand
    .setName('list')
    .setDescription('List all relay pairs')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'start') {
                await interaction.reply('Relay started.');
                console.log('Relay started.');
                telegramBot.on('message', async message => {
                    const telegramChannelId = message.chat.id;
                    const discordChannelId = relayPairs[telegramChannelId];

                    if (discordChannelId) {
                        const discordChannel = interaction.client.channels.cache.get(discordChannelId);
                        if (discordChannel) {
                            discordChannel.send(message.text)
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

                const discordChannel = interaction.client.channels.cache.get(discordChannelId);
                if (discordChannel) {
                    await interaction.followUp(`Connected to Discord channel ID ${discordChannelId}`);
                    console.log(`Connected to Discord channel ID ${discordChannelId}`);
                } else {
                    await interaction.followUp(`Failed to connect to Discord channel ID ${discordChannelId}`);
                    console.error(`Failed to connect to Discord channel ID ${discordChannelId}`);
                }

                try {
                    const chat = await telegramBot.getChat(telegramChannelId);
                    await interaction.followUp(`Connected to Telegram channel ID ${telegramChannelId}`);
                    console.log(`Connected to Telegram channel ID ${telegramChannelId}`);
                } catch (error) {
                    await interaction.followUp(`Failed to connect to Telegram channel ID ${telegramChannelId}`);
                    console.error(`Failed to connect to Telegram channel ID ${telegramChannelId}: ${error.message}`);
                }
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
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'There was an error executing the relay command.', ephemeral: true });
            }
        }
    },
};

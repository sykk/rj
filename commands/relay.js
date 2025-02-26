const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const telegramBot = require('../utils/telegramBot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('relay')
        .setDescription('Manages relays between Discord and Telegram')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Starts the relay')
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
                .setName('stop')
                .setDescription('Stops the relay'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adds a new relay pair')
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
                .setDescription('Deletes a relay pair')
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
                .setDescription('Lists all relay pairs')),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'start') {
                const discordChannelId = interaction.options.getString('discordchannelid');
                const telegramChannelId = interaction.options.getString('telegramchannelid');

                if (relayPairs[telegramChannelId]) {
                    await interaction.reply({ content: 'Relay already exists for this Telegram channel ID.', flags: MessageFlags.EPHEMERAL });
                    return;
                }

                const discordChannel = interaction.client.channels.cache.get(discordChannelId);
                if (!discordChannel) {
                    await interaction.reply({ content: 'Invalid Discord channel ID.', flags: MessageFlags.EPHEMERAL });
                    return;
                }

                telegramBot.getChat(telegramChannelId).then(chat => {
                    relayPairs[telegramChannelId] = discordChannelId;
                    telegramBot.on('message', relayMessage);
                    interaction.reply(`Relay started between Discord channel ID ${discordChannelId} and Telegram channel ID ${telegramChannelId}`);
                }).catch(error => {
                    interaction.reply({ content: 'Invalid Telegram channel ID.', flags: MessageFlags.EPHEMERAL });
                });
            } else if (subcommand === 'stop') {
                await interaction.reply('Relay stopped.');
                telegramBot.removeAllListeners('message');
            } else if (subcommand === 'add') {
                const discordChannelId = interaction.options.getString('discordchannelid');
                const telegramChannelId = interaction.options.getString('telegramchannelid');

                relayPairs[telegramChannelId] = discordChannelId;
                await interaction.reply(`Relay pair added: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);

                const discordChannel = interaction.client.channels.cache.get(discordChannelId);
                if (discordChannel) {
                    await interaction.followUp(`Connected to Discord channel ID ${discordChannelId}`);
                } else {
                    await interaction.followUp({ content: `Failed to connect to Discord channel ID ${discordChannelId}`, flags: MessageFlags.EPHEMERAL });
                }

                telegramBot.getChat(telegramChannelId).then(chat => {
                    interaction.followUp(`Connected to Telegram channel ID ${telegramChannelId}`);
                }).catch(error => {
                    interaction.followUp({ content: `Failed to connect to Telegram channel ID ${telegramChannelId}`, flags: MessageFlags.EPHEMERAL });
                });
            } else if (subcommand === 'delete') {
                const discordChannelId = interaction.options.getString('discordchannelid');
                const telegramChannelId = interaction.options.getString('telegramchannelid');

                if (relayPairs[telegramChannelId] === discordChannelId) {
                    delete relayPairs[telegramChannelId];
                    await interaction.reply(`Relay pair deleted: Discord Channel ID ${discordChannelId} <-> Telegram Channel ID ${telegramChannelId}`);
                } else {
                    await interaction.reply({ content: 'No such relay pair found.', flags: MessageFlags.EPHEMERAL });
                }
            } else if (subcommand === 'list') {
                if (Object.keys(relayPairs).length === 0) {
                    await interaction.reply({ content: 'No relay pairs have been added.', flags: MessageFlags.EPHEMERAL });
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
            await interaction.reply({ content: 'There was an error executing the relay command.', flags: MessageFlags.EPHEMERAL });
        }
    },
};
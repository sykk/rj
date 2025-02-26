const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const logger = require('../logger'); // Add the logger

module.exports = {
    data: new SlashCommandBuilder()
    .setName('cryptowatch')
    .setDescription('Manage cryptocurrency watchlist')
    .addSubcommand(subcommand =>
    subcommand
    .setName('add')
    .setDescription('Add a cryptocurrency to the watchlist')
    .addStringOption(option =>
    option.setName('symbol')
    .setDescription('The cryptocurrency symbol (e.g., BTC, ETH)')
    .setRequired(true))
    .addNumberOption(option =>
    option.setName('percent')
    .setDescription('The percentage change to alert')
    .setRequired(true)))
    .addSubcommand(subcommand =>
    subcommand
    .setName('delete')
    .setDescription('Delete a cryptocurrency from the watchlist')
    .addStringOption(option =>
    option.setName('symbol')
    .setDescription('The cryptocurrency symbol (e.g., BTC, ETH)')
    .setRequired(true)))
    .addSubcommand(subcommand =>
    subcommand
    .setName('list')
    .setDescription('List all cryptocurrencies in the watchlist')),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'add') {
                return await this.addWatch(interaction);
            } else if (subcommand === 'delete') {
                return await this.deleteWatch(interaction);
            } else if (subcommand === 'list') {
                return await this.listWatch(interaction);
            } else {
                throw new Error('Invalid subcommand');
            }
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
            logger.error('Error executing command', error); // Log error
            try {
                await interaction.reply({ content: 'There was an error trying to execute the command.', flags: MessageFlags.EPHEMERAL });
            } catch (replyError) {
                console.error('Failed to send reply:', replyError);
                logger.error('Failed to send reply', replyError); // Log error
            }
        }
    },

    async addWatch(interaction) {
        try {
            const crypto = interaction.options.getString('symbol').toUpperCase();
            const percent = interaction.options.getNumber('percent');

            const watchlist = loadWatchlist();
            watchlist.push({ crypto, percent });
            saveWatchlist(watchlist);

            console.debug(`Added ${crypto} with alert set for ${percent}% increase.`);
            logger.log(`Added ${crypto} with alert set for ${percent}% increase.`); // Log success
            await interaction.reply({ content: `Added ${crypto} to watchlist with alert set for ${percent}% increase.`, flags: MessageFlags.EPHEMERAL });
        } catch (error) {
            console.error(`Failed to add watch: ${error.message}`);
            logger.error('Failed to add watch', error); // Log error
            try {
                await interaction.reply({ content: 'There was an error adding to the watchlist.', flags: MessageFlags.EPHEMERAL });
            } catch (replyError) {
                console.error('Failed to send reply:', replyError);
                logger.error('Failed to send reply', replyError); // Log error
            }
        }
    },

    async deleteWatch(interaction) {
        try {
            const crypto = interaction.options.getString('symbol').toUpperCase();

            let watchlist = loadWatchlist();
            watchlist = watchlist.filter(item => item.crypto !== crypto);
            saveWatchlist(watchlist);

            console.debug(`Deleted ${crypto} from watchlist.`);
            logger.log(`Deleted ${crypto} from watchlist.`); // Log success
            await interaction.reply({ content: `Deleted ${crypto} from watchlist.`, flags: MessageFlags.EPHEMERAL });
        } catch (error) {
            console.error(`Failed to delete watch: ${error.message}`);
            logger.error('Failed to delete watch', error); // Log error
            try {
                await interaction.reply({ content: 'There was an error deleting from the watchlist.', flags: MessageFlags.EPHEMERAL });
            } catch (replyError) {
                console.error('Failed to send reply:', replyError);
                logger.error('Failed to send reply', replyError); // Log error
            }
        }
    },

    async listWatch(interaction) {
        try {
            const watchlist = loadWatchlist();

            if (watchlist.length === 0) {
                console.debug('Watchlist is empty.');
                logger.log('Watchlist is empty.'); // Log info
                await interaction.reply({ content: 'Your watchlist is empty.', flags: MessageFlags.EPHEMERAL });
                return;
            }

            const embed = new EmbedBuilder()
            .setTitle('Your Cryptocurrency Watchlist')
            .setDescription(watchlist.map(item => `${item.crypto}: Alert at ${item.percent}% increase`).join('\n'));

            console.debug('Displaying watchlist:', watchlist);
            logger.log('Displaying watchlist'); // Log info
            await interaction.reply({ embeds: [embed], flags: MessageFlags.EPHEMERAL });
        } catch (error) {
            console.error(`Failed to list watch: ${error.message}`);
            logger.error('Failed to list watch', error); // Log error
            try {
                await interaction.reply({ content: 'There was an error listing the watchlist.', flags: MessageFlags.EPHEMERAL });
            } catch (replyError) {
                console.error('Failed to send reply:', replyError);
                logger.error('Failed to send reply', replyError); // Log error
            }
        }
    }
};

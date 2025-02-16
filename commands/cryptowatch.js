const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const watchlistPath = path.join(__dirname, 'watchlist.json');

// Load watchlist from JSON file
const loadWatchlist = () => {
    try {
        if (fs.existsSync(watchlistPath)) {
            return JSON.parse(fs.readFileSync(watchlistPath, 'utf8'));
        }
    } catch (error) {
        console.error(`Failed to load watchlist: ${error.message}`);
    }
    return [];
};

// Save watchlist to JSON file
const saveWatchlist = (watchlist) => {
    try {
        fs.writeFileSync(watchlistPath, JSON.stringify(watchlist, null, 2), 'utf8');
    } catch (error) {
        console.error(`Failed to save watchlist: ${error.message}`);
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cryptowatch')
        .setDescription('Manage your cryptocurrency watchlist and alerts')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a cryptocurrency to your watchlist')
                .addStringOption(option => 
                    option.setName('symbol')
                          .setDescription('The cryptocurrency symbol (e.g., BTC, ETH)')
                          .setRequired(true))
                .addNumberOption(option => 
                    option.setName('percent')
                          .setDescription('The percentage increase to trigger an alert')
                          .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a cryptocurrency from your watchlist')
                .addStringOption(option => 
                    option.setName('symbol')
                          .setDescription('The cryptocurrency symbol (e.g., BTC, ETH)')
                          .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List your watchlist')),
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
            await interaction.reply({ content: 'There was an error trying to execute the command.', ephemeral: true });
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
            await interaction.reply({ content: `Added ${crypto} to watchlist with alert set for ${percent}% increase.`, ephemeral: true });
        } catch (error) {
            console.error(`Failed to add watch: ${error.message}`);
            await interaction.reply({ content: 'There was an error adding to the watchlist.', ephemeral: true });
        }
    },

    async deleteWatch(interaction) {
        try {
            const crypto = interaction.options.getString('symbol').toUpperCase();

            let watchlist = loadWatchlist();
            watchlist = watchlist.filter(item => item.crypto !== crypto);
            saveWatchlist(watchlist);

            console.debug(`Deleted ${crypto} from watchlist.`);
            await interaction.reply({ content: `Deleted ${crypto} from watchlist.`, ephemeral: true });
        } catch (error) {
            console.error(`Failed to delete watch: ${error.message}`);
            await interaction.reply({ content: 'There was an error deleting from the watchlist.', ephemeral: true });
        }
    },

    async listWatch(interaction) {
        try {
            const watchlist = loadWatchlist();

            if (watchlist.length === 0) {
                console.debug('Watchlist is empty.');
                await interaction.reply({ content: 'Your watchlist is empty.', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('Your Cryptocurrency Watchlist')
                .setDescription(watchlist.map(item => `${item.crypto}: Alert at ${item.percent}% increase`).join('\n'));

            console.debug('Displaying watchlist:', watchlist);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(`Failed to list watch: ${error.message}`);
            await interaction.reply({ content: 'There was an error listing the watchlist.', ephemeral: true });
        }
    }
};
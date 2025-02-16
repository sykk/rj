const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const watchlistPath = path.join(__dirname, 'watchlist.json');

// Load watchlist from JSON file
const loadWatchlist = () => {
    if (fs.existsSync(watchlistPath)) {
        return JSON.parse(fs.readFileSync(watchlistPath, 'utf8'));
    }
    return [];
};

// Save watchlist to JSON file
const saveWatchlist = (watchlist) => {
    fs.writeFileSync(watchlistPath, JSON.stringify(watchlist, null, 2), 'utf8');
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
                          .setDescription('The cryptocurrency symbol (e.g., btc, eth)')
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
                          .setDescription('The cryptocurrency symbol (e.g., btc, eth)')
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
            await interaction.reply({ content: 'There was an error trying to execute the command.', flags: 64 });
        }
    },

    async addWatch(interaction) {
        const crypto = interaction.options.getString('symbol').toLowerCase();
        const percent = interaction.options.getNumber('percent');

        const watchlist = loadWatchlist();
        watchlist.push({ crypto, percent });
        saveWatchlist(watchlist);

        await interaction.reply({ content: `Added ${crypto.toUpperCase()} to watchlist with alert set for ${percent}% increase.`, flags: 64 });
    },

    async deleteWatch(interaction) {
        const crypto = interaction.options.getString('symbol').toLowerCase();

        let watchlist = loadWatchlist();
        watchlist = watchlist.filter(item => item.crypto !== crypto);
        saveWatchlist(watchlist);

        await interaction.reply({ content: `Deleted ${crypto.toUpperCase()} from watchlist.`, flags: 64 });
    },

    async listWatch(interaction) {
        const watchlist = loadWatchlist();

        if (watchlist.length === 0) {
            await interaction.reply({ content: 'Your watchlist is empty.', flags: 64 });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Cryptocurrency Watchlist')
            .setDescription('Your current watchlist')
            .setColor(0x00AE86);

        watchlist.forEach(item => {
            embed.addFields({ name: item.crypto.toUpperCase(), value: `Alert at ${item.percent}% increase`, inline: false });
        });

        await interaction.reply({ embeds: [embed], flags: 64 });
    },
};
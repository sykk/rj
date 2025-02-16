const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const isAdmin = require('../utils/isAdmin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ds')
        .setDescription('Get trending tokens')
        .addSubcommand(subcommand =>
            subcommand
                .setName('trending')
                .setDescription('Get top 5 trending tokens')
                .addStringOption(option =>
                    option.setName('interval')
                        .setDescription('Time interval for trending tokens (5m, 1h, 6h)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('token')
                .setDescription('Get top 5 trending of a specific token')
                .addStringOption(option =>
                    option.setName('symbol')
                        .setDescription('The token symbol (e.g., BTC, ETH)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('interval')
                        .setDescription('Time interval for trending tokens (5m, 1h, 6h)')
                        .setRequired(true))),
    async execute(interaction) {
        // Check if the user is an admin
        if (!isAdmin(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        const subcommand = interaction.options.getSubcommand();
        const interval = interaction.options.getString('interval').toLowerCase();

        if (!['5m', '1h', '6h'].includes(interval)) {
            return interaction.reply({ content: 'Invalid interval. Please use one of the following: 5m, 1h, 6h.', flags: 64 });
        }

        try {
            if (subcommand === 'trending') {
                const response = await axios.get(`https://api.dexscreener.com/latest/dex/trending?interval=${interval}`);
                console.log(response.data); // Log the response data for debugging
                
                const trendingTokens = response.data.pairs || [];

                if (trendingTokens.length === 0) {
                    throw new Error('No trending data available');
                }

                const embed = new EmbedBuilder()
                    .setTitle(`Top 5 Trending Tokens (${interval})`)
                    .setDescription(trendingTokens.slice(0, 5).map((token, index) => `${index + 1}. ${token.baseToken.symbol} (${token.priceChange.percent})`).join('\n'))
                    .setColor(0x00AE86);

                await interaction.reply({ embeds: [embed] });

            } else if (subcommand === 'token') {
                const symbol = interaction.options.getString('symbol').toUpperCase();
                const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${symbol}/trending?interval=${interval}`);
                console.log(response.data); // Log the response data for debugging

                const trendingTokens = response.data.pairs || [];

                if (trendingTokens.length === 0) {
                    throw new Error('No trending data available for this token');
                }

                const embed = new EmbedBuilder()
                    .setTitle(`Top 5 Trending Tokens for ${symbol} (${interval})`)
                    .setDescription(trendingTokens.slice(0, 5).map((token, index) => `${index + 1}. ${token.baseToken.symbol} (${token.priceChange.percent})`).join('\n'))
                    .setColor(0x00AE86);

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`Error fetching trending data: ${error.message}`);
            await interaction.reply({ content: 'There was an error fetching the trending data.', flags: 64 });
        }
    },
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const isAdmin = require('../utils/isAdmin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Crypto commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('price')
                .setDescription('Get the current cryptocurrency price, daily change, daily high, daily low, volume, market cap, and a 24-hour chart')
                .addStringOption(option =>
                    option.setName('cryptocurrency')
                        .setDescription('The cryptocurrency symbol (e.g., BTC, ETH)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('trending')
                .setDescription('List the top 5 trending cryptocurrencies'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('newlistings')
                .setDescription('Show the last 5 new listings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('topgains')
                .setDescription('Get the top gainers'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('toplosers')
                .setDescription('Get the top losers')),
    async execute(interaction) {
        // Check if the user is an admin
        if (!isAdmin(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'price') {
                const symbol = interaction.options.getString('cryptocurrency').toUpperCase();
                const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);

                if (!response.data) {
                    throw new Error('Invalid cryptocurrency symbol');
                }

                const cryptoData = response.data;

                const pricesResponse = await axios.get(`https://api.binance.com/api/v3/klines`, {
                    params: {
                        symbol: `${symbol}USDT`,
                        interval: '1h',
                        limit: 24,
                    },
                });

                const prices = pricesResponse.data.map(price => parseFloat(price[4]));

                const chartUrl = `https://quickchart.io/chart?c={
                    type: 'line',
                    data: {
                        labels: [${Array.from({ length: prices.length }, (_, i) => i + 1).join(', ')}],
                        datasets: [{
                            label: '${symbol} Price (24 hours)',
                            data: [${prices.join(', ')}],
                            borderColor: 'rgba(75, 192, 192, 1)',
                            fill: false,
                        }]
                    }
                }`;

                const embed = new EmbedBuilder()
                    .setTitle(`${symbol} Price`)
                    .setDescription(`**Current Price:** $${cryptoData.lastPrice}\n**24 Hour Change:** ${cryptoData.priceChangePercent}%\n**24 Hour High:** $${cryptoData.highPrice}\n**24 Hour Low:** $${cryptoData.lowPrice}\n**Volume:** ${cryptoData.volume}\n**Market Cap:** ${cryptoData.quoteVolume}`)
                    .setImage(chartUrl)
                    .setColor(0x00AE86);

                await interaction.reply({ embeds: [embed] });

            } else if (subcommand === 'trending') {
                const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`);
                const trending = response.data
                    .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
                    .slice(0, 5);

                const embed = new EmbedBuilder()
                    .setTitle('Top 5 Trending Cryptocurrencies')
                    .setDescription(trending.map((crypto, index) => `${index + 1}. ${crypto.symbol} (${crypto.priceChangePercent}%)`).join('\n'))
                    .setColor(0x00AE86);

                await interaction.reply({ embeds: [embed] });

            } else if (subcommand === 'newlistings') {
                // Binance does not provide a direct endpoint for new listings. This is a placeholder.
                const newlistings = ["Placeholder1", "Placeholder2", "Placeholder3", "Placeholder4", "Placeholder5"];

                const embed = new EmbedBuilder()
                    .setTitle('Last 5 New Listings')
                    .setDescription(newlistings.join('\n'))
                    .setColor(0x00AE86);

                await interaction.reply({ embeds: [embed] });

            } else if (subcommand === 'topgains') {
                const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`);
                const topGains = response.data
                    .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
                    .slice(0, 5);

                const embed = new EmbedBuilder()
                    .setTitle('Top 5 Gainers')
                    .setDescription(topGains.map((crypto, index) => `${index + 1}. ${crypto.symbol} (${crypto.priceChangePercent}%)`).join('\n'))
                    .setColor(0x00AE86);

                await interaction.reply({ embeds: [embed] });

            } else if (subcommand === 'toplosers') {
                const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`);
                const topLosers = response.data
                    .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
                    .slice(0, 5);

                const embed = new EmbedBuilder()
                    .setTitle('Top 5 Losers')
                    .setDescription(topLosers.map((crypto, index) => `${index + 1}. ${crypto.symbol} (${crypto.priceChangePercent}%)`).join('\n'))
                    .setColor(0x00AE86);

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`Error fetching cryptocurrency data: ${error.message}`);
            await interaction.reply({ content: 'There was an error fetching the cryptocurrency data.', flags: 64 });
        }
    },
};
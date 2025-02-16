const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const isAdmin = require('../utils/isAdmin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Get the current cryptocurrency price, the last hour and 24-hour changes, and a small 7-day chart')
        .addStringOption(option =>
            option.setName('symbol')
                .setDescription('The cryptocurrency symbol (e.g., BTC, ETH)')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the user is an admin
        if (!isAdmin(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const symbol = interaction.options.getString('symbol').toUpperCase();

        try {
            // Fetch current price and percentage changes from CoinGecko
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    ids: symbol.toLowerCase(),
                },
            });

            if (response.data.length === 0) {
                throw new Error('Invalid cryptocurrency symbol');
            }

            const cryptoData = response.data[0];

            // Fetch 7-day historical data for the chart
            const historyResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoData.id}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: '7',
                },
            });

            const prices = historyResponse.data.prices.map(price => price[1]);

            // Generate chart URL using quickchart.io
            const chartUrl = `https://quickchart.io/chart?c={
                type: 'line',
                data: {
                    labels: [${Array.from({ length: prices.length }, (_, i) => i + 1).join(', ')}],
                    datasets: [{
                        label: '${symbol} Price (7 days)',
                        data: [${prices.join(', ')}],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false,
                    }]
                }
            }`;

            // Create and send the embed
            const embed = new EmbedBuilder()
                .setTitle(`${cryptoData.name} (${cryptoData.symbol.toUpperCase()})`)
                .setDescription(`**Current Price:** $${cryptoData.current_price}\n**1 Hour Change:** ${cryptoData.price_change_percentage_1h_in_currency.toFixed(2)}%\n**24 Hour Change:** ${cryptoData.price_change_percentage_24h_in_currency.toFixed(2)}%`)
                .setImage(chartUrl)
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error fetching cryptocurrency data: ${error.message}`);
            await interaction.reply({ content: 'There was an error fetching the cryptocurrency data.', ephemeral: true });
        }
    },
};
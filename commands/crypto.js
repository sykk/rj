const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Checks the current price and details of a cryptocurrency')
        .addStringOption(option => option.setName('symbol').setDescription('The cryptocurrency symbol (e.g., btc, eth)').setRequired(true)),
    async execute(interaction) {
        const crypto = interaction.options.getString('symbol').toLowerCase();
        const url = `https://api.coingecko.com/api/v3/simple/price`;
        const sparklineUrl = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart`;

        try {
            console.log(`Fetching data for: ${crypto} from CoinGecko API`);

            const [priceResponse, sparklineResponse] = await Promise.all([
                axios.get(url, { params: { ids: crypto, vs_currencies: 'usd', include_24hr_change: 'true' } }),
                axios.get(sparklineUrl, { params: { vs_currency: 'usd', days: '7' } })
            ]);

            if (!priceResponse.data || !priceResponse.data[crypto]) {
                console.error('Price data not found or invalid cryptocurrency symbol.');
                await interaction.reply('Could not retrieve the details. Please check the cryptocurrency symbol and try again.');
                return;
            }

            const priceData = priceResponse.data[crypto];
            const sparklineData = sparklineResponse.data.prices;

            const price = priceData.usd;
            const change24h = priceData.usd_24h_change || 0;
            const last7Days = sparklineData.map(entry => entry[1]);

            const graphData = last7Days.join(',');

            // Ensure the URL length is within the limit
            const chartUrl = `https://quickchart.io/chart?c={type:'line',data:{labels:[${sparklineData.map((_, index) => `'${7 - index}d'`).join(',')}],datasets:[{label:'${crypto.toUpperCase()} price',data:[${graphData}]}]}}`;
            const truncatedChartUrl = chartUrl.length > 2048 ? chartUrl.slice(0, 2048) : chartUrl;

            const embed = new EmbedBuilder()
                .setTitle('Cryptocurrency Price')
                .setDescription(`Details for ${crypto.toUpperCase()}`)
                .addFields(
                    { name: 'Price', value: `$${price} USD`, inline: true },
                    { name: 'Change (24h)', value: `${change24h.toFixed(2)}%`, inline: true }
                )
                .setImage(truncatedChartUrl)
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error('404 Error: Invalid cryptocurrency symbol or endpoint not found.');
                await interaction.reply('Could not retrieve the details. Please check the cryptocurrency symbol and try again.');
            } else {
                console.error(`Error fetching cryptocurrency details: ${error.message}`);
                await interaction.reply('There was an error trying to fetch the cryptocurrency details.');
            }
        }
    },
};
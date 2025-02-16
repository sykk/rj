const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Checks the current price and details of a cryptocurrency')
        .addStringOption(option => option.setName('symbol').setDescription('The cryptocurrency symbol (e.g., BTC, ETH)').setRequired(true)),
    async execute(interaction) {
        const crypto = interaction.options.getString('symbol').toUpperCase();
        const url = `https://api.coingecko.com/api/v3/coins/markets`;
        const graphUrl = `https://quickchart.io/chart?c={type:'line',data:{labels:['7d','6d','5d','4d','3d','2d','1d'],datasets:[{label:'${crypto} price',data:[`;

        try {
            const response = await axios.get(url, {
                params: {
                    vs_currency: 'usd',
                    ids: crypto,
                    price_change_percentage: '1h,24h,7d',
                    sparkline: true
                }
            });

            if (response.data.length === 0) {
                await interaction.reply('Could not retrieve the details. Please check the cryptocurrency symbol and try again.');
                return;
            }

            const data = response.data[0];
            const price = data.current_price;
            const change1h = data.price_change_percentage_1h_in_currency;
            const change24h = data.price_change_percentage_24h_in_currency;
            const price7d = data.sparkline_in_7d.price;

            const graphData = price7d.join(',');

            const embed = new EmbedBuilder()
                .setTitle('Cryptocurrency Price')
                .setDescription(`Details for ${crypto}`)
                .addFields(
                    { name: 'Price', value: `$${price} USD`, inline: true },
                    { name: 'Change (1h)', value: `${change1h.toFixed(2)}%`, inline: true },
                    { name: 'Change (24h)', value: `${change24h.toFixed(2)}%`, inline: true }
                )
                .setImage(`${graphUrl}${graphData}]}}]}}`)
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error fetching cryptocurrency details: ${error.message}`);
            await interaction.reply('There was an error trying to fetch the cryptocurrency details.');
        }
    },
};
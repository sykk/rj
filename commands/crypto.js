const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Checks the current price and details of a cryptocurrency')
        .addStringOption(option => option.setName('symbol').setDescription('The cryptocurrency symbol (e.g., BTC, ETH)').setRequired(true)),
    async execute(interaction) {
        const crypto = interaction.options.getString('symbol').toLowerCase();
        const url = `https://api.coingecko.com/api/v3/coins/${crypto}`;
        
        try {
            const response = await axios.get(url);
            const data = response.data;
            const price = data.market_data.current_price.usd;
            const change1h = data.market_data.price_change_percentage_1h_in_currency.usd;
            const change24h = data.market_data.price_change_percentage_24h_in_currency.usd;
            const sparkline = data.market_data.sparkline_7d.price;

            const graphData = sparkline.join(',');

            const embed = new EmbedBuilder()
                .setTitle('Cryptocurrency Price')
                .setDescription(`Details for ${data.name} (${data.symbol.toUpperCase()})`)
                .addFields(
                    { name: 'Price', value: `$${price} USD`, inline: true },
                    { name: 'Change (1h)', value: `${change1h.toFixed(2)}%`, inline: true },
                    { name: 'Change (24h)', value: `${change24h.toFixed(2)}%`, inline: true }
                )
                .setImage(`https://quickchart.io/chart?c={type:'line',data:{labels:['7d','6d','5d','4d','3d','2d','1d'],datasets:[{label:'${data.name} price',data:[${graphData}]}]}}`)
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error fetching cryptocurrency details: ${error.message}`);
            await interaction.reply('Could not retrieve the details. Please check the cryptocurrency symbol and try again.');
        }
    },
};
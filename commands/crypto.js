const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Checks the current price of a cryptocurrency')
        .addStringOption(option => option.setName('symbol').setDescription('The cryptocurrency symbol (e.g., BTC, ETH)').setRequired(true)),
    async execute(interaction) {
        const crypto = interaction.options.getString('symbol').toUpperCase();
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`;

        try {
            const response = await axios.get(url);
            const price = response.data[crypto.toLowerCase()]?.usd;
            if (price) {
                const embed = new EmbedBuilder()
                    .setTitle('Cryptocurrency Price')
                    .setDescription(`The current price of ${crypto} is $${price} USD.`)
                    .setColor(0x00AE86);
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply('Could not retrieve the price. Please check the cryptocurrency symbol and try again.');
            }
        } catch (error) {
            console.error(`Error fetching cryptocurrency price: ${error.message}`);
            await interaction.reply('There was an error trying to fetch the cryptocurrency price.');
        }
    },
};
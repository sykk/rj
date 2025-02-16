const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Cryptocurrency related commands')
        .addSubcommand(subcommand => 
            subcommand
                .setName('price')
                .setDescription('Checks the current price and details of a cryptocurrency by symbol')
                .addStringOption(option => option.setName('symbol').setDescription('The cryptocurrency symbol (e.g., BTC, ETH)').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('trending')
                .setDescription('Shows the last 5 trending cryptocurrencies')),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'trending') {
                return await this.showTrending(interaction);
            } else if (subcommand === 'price') {
                return await this.showPrice(interaction);
            } else {
                throw new Error('Invalid subcommand');
            }
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
            await interaction.reply({ content: 'There was an error trying to execute the command.', flags: 64 });
        }
    },

    async showPrice(interaction) {
        const crypto = interaction.options.getString('symbol').toUpperCase();
        const url = `https://api.kraken.com/0/public/Ticker?pair=${crypto}USD`;

        try {
            console.log(`Fetching data for: ${crypto} from Kraken API`);

            const response = await axios.get(url);

            if (!response.data || !response.data.result) {
                console.error('Price data not found or invalid cryptocurrency symbol.');
                await interaction.reply({ content: 'Could not retrieve the details. Please check the cryptocurrency symbol and try again.', flags: 64 });
                return;
            }

            const priceData = response.data.result[Object.keys(response.data.result)[0]];
            const price = priceData.c[0];
            const change24h = ((priceData.c[0] - priceData.o) / priceData.o * 100).toFixed(2); // Assuming 'o' is the opening price for 24h

            const embed = new EmbedBuilder()
                .setTitle('Cryptocurrency Price')
                .setDescription(`Details for ${crypto}`)
                .addFields(
                    { name: 'Price', value: `$${price} USD`, inline: true },
                    { name: 'Change (24h)', value: `${change24h}%`, inline: true }
                )
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed], flags: 64 });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error('404 Error: Invalid cryptocurrency symbol or endpoint not found.');
                await interaction.reply({ content: 'Could not retrieve the details. Please check the cryptocurrency symbol and try again.', flags: 64 });
            } else {
                console.error(`Error fetching cryptocurrency details: ${error.message}`);
                await interaction.reply({ content: 'There was an error trying to fetch the cryptocurrency details.', flags: 64 });
            }
        }
    },

    async showTrending(interaction) {
        // Kraken API does not provide a direct endpoint for trending cryptocurrencies
        // Here we just acknowledge the command as a placeholder
        await interaction.reply({ content: 'Trending cryptocurrency data is not available via Kraken API.', flags: 64 });
    }
};
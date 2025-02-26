const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const isAdmin = require('../utils/isAdmin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Get the current cryptocurrency price')
        .addStringOption(option =>
            option.setName('symbol')
                .setDescription('The cryptocurrency symbol (e.g., BTC, ETH)')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the user is an admin
        if (!isAdmin(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.EPHEMERAL });
        }

        const symbol = interaction.options.getString('symbol').toUpperCase();

        try {
            // Fetch current price from Coinbase
            const response = await axios.get(`https://api.coinbase.com/v2/prices/${symbol}-USD/spot`);

            if (!response.data || !response.data.data) {
                throw new Error('Invalid cryptocurrency symbol');
            }

            const cryptoData = response.data.data;

            // Create and send the embed
            const embed = new EmbedBuilder()
                .setTitle(`${symbol} Price`)
                .setDescription(`**Current Price:** $${cryptoData.amount}`)
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed], flags: MessageFlags.EPHEMERAL });
        } catch (error) {
            console.error(`Error fetching cryptocurrency data: ${error.message}`);
            try {
                await interaction.reply({ content: 'There was an error fetching the cryptocurrency data.', flags: MessageFlags.EPHEMERAL });
            } catch (replyError) {
                console.error('Failed to send reply:', replyError);
            }
        }
    },
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('google')
        .setDescription('Searches Google and posts the results')
        .addStringOption(option => option.setName('query').setDescription('The search query').setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const apiKey = process.env.GOOGLE_API_KEY;
        const cx = process.env.GOOGLE_CX;
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

        try {
            const response = await axios.get(url);
            const items = response.data.items;
            let results = new EmbedBuilder()
                .setTitle('Google Search Results')
                .setDescription(`Results for: ${query}`)
                .setColor(0x00AE86);

            if (items && items.length > 0) {
                items.forEach((item, index) => {
                    results.addFields({ name: `${index + 1}. ${item.title}`, value: `[Link](${item.link})` });
                });
                await interaction.reply({ embeds: [results] });
            } else {
                await interaction.reply('No results found.');
            }
        } catch (error) {
            console.error(`Error searching Google: ${error.message}`);
            await interaction.reply('There was an error trying to search Google.');
        }
    },
};
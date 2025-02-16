const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Echoes the user\'s message')
        .addStringOption(option => option.setName('message').setDescription('The message to echo').setRequired(true)),
    async execute(interaction) {
        const echoMessage = interaction.options.getString('message');
        const embed = new EmbedBuilder()
            .setTitle('Echo')
            .setDescription(echoMessage)
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [embed] });
    },
};
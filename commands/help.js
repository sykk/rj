const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands'),
    async execute(interaction) {
        const commands = interaction.client.commands.map(cmd => `**${cmd.data.name}**: ${cmd.data.description}`).join('\n');
        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setDescription(commands)
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [embed] });
    },
};
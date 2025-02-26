const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks the bot\'s latency'),
    async execute(interaction) {
        try {
            const sent = Date.now();
            const embed = new EmbedBuilder()
                .setTitle('Pong!')
                .setDescription('Calculating latency...')
                .setColor(0x00AE86);

            const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
            const latency = Date.now() - sent;
            embed.setDescription(`Latency: ${latency}ms`);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(`Failed to execute ping command: ${error.message}`);
            await interaction.reply({ content: 'There was an error executing the ping command.', flags: MessageFlags.EPHEMERAL });
        }
    },
};
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
    async execute(interaction) {
        try {
            // Reply to the interaction
            await interaction.reply({ content: 'Pong!', flags: 64 }); // Use flags to set ephemeral
        } catch (error) {
            console.error('Failed to execute ping command:', error);
        }
    },
};

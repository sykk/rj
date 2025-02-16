const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restarts the bot'),
    async execute(interaction) {
        try {
            await interaction.reply('Restarting the bot...');
            exec('pm2 restart all', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error restarting the bot: ${error.message}`);
                    interaction.followUp({ content: 'There was an error restarting the bot.', ephemeral: true });
                    return;
                }
                if (stderr) {
                    console.error(`Stderr: ${stderr}`);
                    interaction.followUp({ content: 'There was an error restarting the bot.', ephemeral: true });
                    return;
                }
                console.log(`Stdout: ${stdout}`);
            });
        } catch (error) {
            console.error(`Failed to execute restart command: ${error.message}`);
            await interaction.reply({ content: 'There was an error executing the restart command.', ephemeral: true });
        }
    },
};
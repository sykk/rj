const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const { MessageFlags } = require('discord.js');

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
                    try {
                        interaction.followUp({ content: 'There was an error restarting the bot.', ephemeral: true });
                    } catch (followUpError) {
                        console.error('Failed to send follow-up:', followUpError);
                    }
                    return;
                }
                if (stderr) {
                    console.error(`Stderr: ${stderr}`);
                    try {
                        interaction.followUp({ content: 'There was an error restarting the bot.', ephemeral: true });
                    } catch (followUpError) {
                        console.error('Failed to send follow-up:', followUpError);
                    }
                    return;
                }
                console.log(`Stdout: ${stdout}`);
            });
        } catch (error) {
            console.error(`Failed to execute restart command: ${error.message}`);
            try {
                await interaction.reply({ content: 'There was an error executing the restart command.', ephemeral: true });
            } catch (replyError) {
                console.error('Failed to send reply:', replyError);
            }
        }
    },
};

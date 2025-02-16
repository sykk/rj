const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restarts the bot'),
    async execute(interaction) {
        await interaction.reply('Restarting the bot...');
        exec('pm2 restart all', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error restarting the bot: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return;
            }
            console.log(`Stdout: ${stdout}`);
        });
    },
};
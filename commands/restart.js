const { exec } = require('child_process');

// List of admin Discord IDs
const adminIds = ['YOUR_DISCORD_ID_1', 'YOUR_DISCORD_ID_2'];

module.exports = {
    name: 'restart',
    description: 'Restarts the bot',
    execute(message, args, client) {
        if (!adminIds.includes(message.author.id)) {
            message.reply('You do not have permission to use this command.');
            return;
        }

        message.channel.send('Restarting the bot...')
            .then(() => {
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
            });
    },
};
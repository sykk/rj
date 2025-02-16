const { exec } = require('child_process');

module.exports = {
    name: 'restart',
    description: 'Restarts the bot',
    adminOnly: true,
    execute(message, args, client) {
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
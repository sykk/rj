module.exports = {
    name: 'help',
    description: 'Lists all available commands',
    execute(message, args, client) {
        const commands = client.commands.map(cmd => `**${cmd.name}**: ${cmd.description}`).join('\n');
        message.channel.send(`Available commands:\n${commands}`);
    },
};
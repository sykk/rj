module.exports = {
    name: 'echo',
    description: 'Echoes the user\'s message',
    adminOnly: false,
    execute(message, args, client) {
        const echoMessage = args.join(' ');
        message.channel.send(echoMessage);
    },
};
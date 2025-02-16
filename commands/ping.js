module.exports = {
    name: 'ping',
    description: 'Checks the bot\'s latency',
    execute(message, args, client) {
        const sent = Date.now();
        message.channel.send('Pong!').then(reply => {
            const latency = Date.now() - sent;
            reply.edit(`Pong! Latency: ${latency}ms`);
        });
    },
};
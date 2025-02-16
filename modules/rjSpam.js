module.exports = (client) => {
    const channelId = process.env.RJ_CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        console.error(`Channel ID ${channelId} not found`);
        return;
    }

    const sendRJMessage = () => {
        const messages = [':rj:', ':rjnod:'];
        const message = messages[Math.floor(Math.random() * messages.length)];
        channel.send(message).catch(console.error);
    };

    const getRandomInterval = () => Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000;

    const startRJSpam = () => {
        sendRJMessage();
        setTimeout(startRJSpam, getRandomInterval());
    };

    startRJSpam();
};

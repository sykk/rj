module.exports = (client) => {
    const channelId = process.env.RJ_CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        console.error(`Channel ID ${channelId} not found`);
        return;
    }

    const sendRJMessage = async () => {
        const messages = [':rj:', ':rjnod:'];
        const message = messages[Math.floor(Math.random() * messages.length)];
        try {
            const emoji = channel.guild.emojis.cache.find(e => e.name === message.slice(1, -1));
            if (emoji) {
                await channel.send(`${emoji}`);
            } else {
                console.error(`Emoji ${message} not found`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const getRandomInterval = () => Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000;

    const startRJSpam = () => {
        sendRJMessage();
        setTimeout(startRJSpam, getRandomInterval());
    };

    startRJSpam();
};
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const ACTIVE_NAME = 'rj :rj:';
const NOD_NAME = 'rj :rjnod:';
const INACTIVE_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

let activeTimeout;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    setActive();
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content === '!wakeup') {
        setActive();
        message.channel.send('I am awake!');
    } else {
        resetActiveTimeout();
    }
});

function setActive() {
    client.guilds.cache.forEach(guild => {
        const botMember = guild.members.cache.get(client.user.id);
        if (botMember) {
            botMember.setNickname(ACTIVE_NAME).catch(console.error);
        }
    });
    clearTimeout(activeTimeout);
    activeTimeout = setTimeout(setNod, INACTIVE_TIME);
}

function setNod() {
    client.guilds.cache.forEach(guild => {
        const botMember = guild.members.cache.get(client.user.id);
        if (botMember) {
            botMember.setNickname(NOD_NAME).catch(console.error);
        }
    });
}

function resetActiveTimeout() {
    setActive();
}

client.login(process.env.BOT_TOKEN);
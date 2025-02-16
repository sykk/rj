const { Client, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const NOD_MODE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const WAKE_UP_TRIGGER = "wake up";
let nodMode = false;
let timeoutId;

const emojiSmile = '😊'; // Unicode for :smile:
const emojiFrowning = '☹️'; // Unicode for :frowning:

function enterNodMode() {
    nodMode = true;
    client.guilds.cache.forEach(async (guild) => {
        try {
            const me = guild.members.me || await guild.members.fetch(client.user.id);
            const nickname = `rj ${emojiFrowning}`;
            if (nickname.length <= 32) {
                await me.setNickname(nickname);
                console.log(`Nickname set to "${nickname}" in guild: ${guild.name}`);
            } else {
                console.error(`Nickname too long in guild: ${guild.name}.`);
            }
        } catch (error) {
            console.error(`Failed to set nickname in guild: ${guild.name}`, error);
        }
    });
    console.log('Bot has entered nod mode.');
}

function exitNodMode() {
    nodMode = false;
    client.guilds.cache.forEach(async (guild) => {
        try {
            const me = guild.members.me || await guild.members.fetch(client.user.id);
            const nickname = `rj ${emojiSmile}`;
            if (nickname.length <= 32) {
                await me.setNickname(nickname);
                console.log(`Nickname set to "${nickname}" in guild: ${guild.name}`);
            } else {
                console.error(`Nickname too long in guild: ${guild.name}.`);
            }
        } catch (error) {
            console.error(`Failed to set nickname in guild: ${guild.name}`, error);
        }
    });
    console.log('Bot has exited nod mode.');
}

function resetTimeout() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(enterNodMode, NOD_MODE_TIMEOUT);
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    resetTimeout();
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (nodMode) {
        if (message.mentions.has(client.user) && message.content.includes(WAKE_UP_TRIGGER)) {
            const delay = Math.floor(Math.random() * (20000 - 4000 + 1)) + 4000; // 4-20 seconds
            setTimeout(() => {
                message.reply({ content: "I'm awake now!" });
                exitNodMode();
                resetTimeout();
            }, delay);
        }
    } else {
        resetTimeout();
    }
});

// Dynamically read command files and set commands to the client
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, '../commands', file));
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if (nodMode) {
        return interaction.reply({ content: "I'm currently in nod mode. Please wake me up by typing '@mention wake up'.", ephemeral: true });
    }

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
    resetTimeout();
});

client.login(process.env.DISCORD_TOKEN);
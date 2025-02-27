const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const logger = require('./logger'); // Add the logger
const { handleMessage, resetActivityTimeout } = require('./modules/nodmode'); // Import nodmode module

// Import the Watcher class
const Watcher = require('./modules/watcher');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Command collection
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`Command '${file}' does not have a 'data' property or 'name'.`);
    }
}

// Event handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    logger.log(`Logged in as ${client.user.tag}!`); // Log info

    // Instantiate and start the watcher when the client is ready
    const watcher = new Watcher();
    watcher.start();
});

client.on('messageCreate', async message => {
    if (!handleMessage(message)) return;

    // Add your existing command handling logic here
    resetActivityTimeout(message.channel); // Reset activity timeout on every message
});

client.login(process.env.DISCORD_TOKEN);

const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const logger = require('./logger'); // Add the logger

// Import the Watcher class
const Watcher = require('./modules/watcher');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    logger.log(`Logged in as ${client.user.tag}!`); // Log info

    // Instantiate and start the watcher when the client is ready
    const watcher = new Watcher();
    watcher.start();
});

// Dynamically read command files and set commands to the client
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`Command '${file}' does not have a 'data' property or 'name'.`);
    }
}

// Dynamically read module files and set modules to the client
client.modules = new Map();
const moduleFiles = fs.readdirSync(path.join(__dirname, 'modules')).filter(file => file.endsWith('.js'));

for (const file of moduleFiles) {
    const module = require(path.join(__dirname, 'modules', file));
    if (module.data && module.data.name) {
        client.modules.set(module.data.name, module);
    } else {
        console.warn(`Module '${file}' does not have a 'data' property.`);
    }
}

client.on('messageCreate', async message => {
    // Add your existing command handling logic here
});

client.login(process.env.DISCORD_TOKEN);

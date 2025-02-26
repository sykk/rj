const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const logger = require('./logger'); // Add the logger

// Import the Watcher class
const Watcher = require('./modules/watcher');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

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

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        logger.error('Error executing command', error); // Log error
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            } catch (replyError) {
                console.error('Failed to send reply:', replyError);
                logger.error('Failed to send reply', replyError); // Log error
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

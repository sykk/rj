const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Node mode is working correctly.');
});

// Dynamically read command files and set commands to the client
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`Command in file ${file} is missing 'data' or 'data.name' property.`);
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
        console.warn(`Module in file ${file} is missing 'data' or 'data.name' property.`);
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
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

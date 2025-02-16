const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN;

client.commands = new Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Bot is ready');
    // Initialize all modules
    try {
        const modulesPath = path.join(__dirname, 'modules');
        const moduleFiles = fs.readdirSync(modulesPath).filter(file => file.endsWith('.js'));
        moduleFiles.forEach(file => {
            try {
                require(path.join(modulesPath, file))(client);
                console.log(`Loaded module: ${file}`);
            } catch (err) {
                console.error(`Error loading module ${file}: ${err.message}`);
            }
        });
    } catch (err) {
        console.error(`Error initializing modules: ${err.message}`);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.warn(`Command not found: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}: ${error.message}`);
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
    }
});

client.login(token).catch(error => {
    console.error(`Failed to login: ${error.message}`);
});
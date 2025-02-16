const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Change bot's nickname to "rj :rj:" in all guilds
    const emojiNameRJ = 'rj'; // Replace with your emoji name
    const emojiIdRJ = '123456789012345678'; // Replace with your emoji ID for :rj:
    const emojiNameRJNod = 'rjnod'; // Replace with your emoji name for :rjnod:
    const emojiIdRJNod = '876543210987654321'; // Replace with your emoji ID for :rjnod:

    client.guilds.cache.forEach(async (guild) => {
        try {
            const me = guild.members.me || await guild.members.fetch(client.user.id);
            await me.setNickname(`rj <:${emojiNameRJ}:${emojiIdRJ}>`);
            console.log(`Nickname set to "rj <:${emojiNameRJ}:${emojiIdRJ}>" in guild: ${guild.name}`);
        } catch (error) {
            console.error(`Failed to set nickname in guild: ${guild.name}`, error);
        }
    });

    console.log('Node mode is working correctly.');
});

// Dynamically read command files and set commands to the client
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
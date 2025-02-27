const fetch = require('node-fetch');
const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const url = 'https://www.pokemoncenter-online.com/?p_cd=4521329421377';
let lastStatus = null;

client.once('ready', () => {
    console.log('Discord bot is ready!');
    checkPokemonCenter();
    setInterval(checkPokemonCenter, 30000); // Check every 30 seconds
});

async function checkPokemonCenter() {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const isAvailable = text.includes('Add to Cart'); // Update this based on the actual HTML content indicating a restock

        if (isAvailable && lastStatus !== 'available') {
            lastStatus = 'available';
            announceRestock();
        } else if (!isAvailable && lastStatus !== 'unavailable') {
            lastStatus = 'unavailable';
        }
    } catch (error) {
        console.error('Error checking Pokemon Center:', error);
    }
}

function announceRestock() {
    const channel = client.channels.cache.get(process.env.POKEMON_CHANNEL_ID);
    if (channel) {
        channel.send('A new release or restock is available at the Pokemon Center! Check it out: ' + url);
    } else {
        console.error('Channel not found!');
    }
}

client.login(process.env.DISCORD_TOKEN);

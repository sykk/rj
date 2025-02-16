const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const watchlistPath = path.join(__dirname, 'commands', 'watchlist.json');
const token = process.env.DISCORD_TOKEN;
const channelId = process.env.WATCH_CHANNEL_ID;

// Load watchlist from JSON file
const loadWatchlist = () => {
    if (fs.existsSync(watchlistPath)) {
        return JSON.parse(fs.readFileSync(watchlistPath, 'utf8'));
    }
    return [];
};

// Check prices and send alerts
const checkPrices = async () => {
    const watchlist = loadWatchlist();

    for (const item of watchlist) {
        const { crypto, percent } = item;
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd&include_24hr_change=true`;

        try {
            const response = await axios.get(url);
            const priceData = response.data[crypto];

            if (priceData && priceData.usd_24h_change >= percent) {
                const embed = new EmbedBuilder()
                    .setTitle('Cryptocurrency Alert')
                    .setDescription(`${crypto.toUpperCase()} has increased by ${priceData.usd_24h_change.toFixed(2)}% in the last 24 hours!`)
                    .setColor(0x00AE86);

                const channel = client.channels.cache.get(channelId);
                if (channel) {
                    channel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error(`Error fetching price for ${crypto}: ${error.message}`);
        }
    }
};

client.once('ready', () => {
    console.log('Watcher is ready');
    setInterval(checkPrices, 60 * 60 * 1000); // Check every hour
});

client.login(token);
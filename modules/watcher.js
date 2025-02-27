const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const watchlistPath = path.join(__dirname, '..', 'commands', 'watchlist.json');
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

// Load watchlist from JSON file
const loadWatchlist = () => {
    if (fs.existsSync(watchlistPath)) {
        return JSON.parse(fs.readFileSync(watchlistPath, 'utf8'));
    }
    return [];
};

// Save watchlist to JSON file
const saveWatchlist = (watchlist) => {
    fs.writeFileSync(watchlistPath, JSON.stringify(watchlist, null, 2), 'utf8');
};

// Send alert to Discord
const sendAlert = async (crypto, percent, currentPercent) => {
    const message = {
        content: `Alert! ${crypto} has increased by ${currentPercent}% (threshold: ${percent}%)`
    };

    try {
        await axios.post(webhookUrl, message);
        console.debug(`Sent alert for ${crypto}: ${currentPercent}% increase`); // Debug statement
    } catch (error) {
        console.error(`Error sending alert: ${error.message}`);
    }
};

// Check the prices and compare with watchlist
const checkPrices = async () => {
    const watchlist = loadWatchlist();

    for (const item of watchlist) {
        const crypto = item.crypto;
        const percent = item.percent;

        const url = `https://api.kraken.com/0/public/Ticker?pair=${crypto}USD`;

        try {
            const response = await axios.get(url);
            const priceData = response.data.result[Object.keys(response.data.result)[0]];

            if (priceData) {
                const change24h = ((priceData.c[0] - priceData.o) / priceData.o * 100).toFixed(2); // Assuming 'o' is the opening price for 24h
                if (change24h >= percent) {
                    await sendAlert(crypto, percent, change24h);
                }
            }
        } catch (error) {
            console.error(`Error fetching price for ${crypto}: ${error.message}`);
        }
    }
};

// Define the Watcher class
class Watcher {
    start() {
        setInterval(checkPrices, 3600000); // Run the price check at regular intervals (e.g., every hour)
    }
}

module.exports = Watcher;
const data = {
    name: 'watcher'
};

module.exports.data = data;

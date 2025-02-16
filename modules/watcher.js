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
        content: `Alert! ${crypto.toUpperCase()} has increased by ${currentPercent}% (threshold: ${percent}%)`
    };

    try {
        await axios.post(webhookUrl, message);
        console.debug(`Sent alert for ${crypto.toUpperCase()}: ${currentPercent}% increase`); // Debug statement
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

        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd&include_24hr_change=true`;

        try {
            const response = await axios.get(url);
            const priceData = response.data[crypto];

            if (priceData && priceData.usd_24h_change >= percent) {
                await sendAlert(crypto, percent, priceData.usd_24h_change);
            }
        } catch (error) {
            console.error(`Error fetching price for ${crypto}: ${error.message}`);
        }
    }
};

// Run the price check at regular intervals (e.g., every hour)
setInterval(checkPrices, 3600000);
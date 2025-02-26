const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const watchlistPath = path.join(__dirname, '..', 'commands', 'watchlist.json');
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

class Watcher {
    constructor() {
        this.watchlistPath = watchlistPath;
        this.webhookUrl = webhookUrl;
    }

    loadWatchlist() {
        if (fs.existsSync(this.watchlistPath)) {
            return JSON.parse(fs.readFileSync(this.watchlistPath, 'utf8'));
        }
        return [];
    }

    saveWatchlist(watchlist) {
        fs.writeFileSync(this.watchlistPath, JSON.stringify(watchlist, null, 2), 'utf8');
    }

    async sendAlert(crypto, percent, currentPercent) {
        const message = {
            content: `Alert! ${crypto} has increased by ${currentPercent}% (threshold: ${percent}%)`
        };

        try {
            await axios.post(this.webhookUrl, message);
            console.debug(`Sent alert for ${crypto}: ${currentPercent}% increase`); // Debug statement
        } catch (error) {
            console.error(`Error sending alert: ${error.message}`);
        }
    }

    async checkPrices() {
        const watchlist = this.loadWatchlist();

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
                        await this.sendAlert(crypto, percent, change24h);
                    }
                }
            } catch (error) {
                console.error(`Error fetching price for ${crypto}: ${error.message}`);
            }
        }
    }

    start() {
        setInterval(() => this.checkPrices(), 3600000);
    }
}

module.exports = Watcher;

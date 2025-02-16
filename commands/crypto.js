const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const watchlistPath = path.join(__dirname, 'watchlist.json');

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Cryptocurrency related commands')
        .addSubcommand(subcommand => 
            subcommand
                .setName('price')
                .setDescription('Checks the current price and details of a cryptocurrency by symbol')
                .addStringOption(option => option.setName('symbol').setDescription('The cryptocurrency symbol (e.g., btc, eth)').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('trending')
                .setDescription('Shows the last 5 trending cryptocurrencies'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a cryptocurrency to your watchlist')
                .addStringOption(option => 
                    option.setName('symbol')
                          .setDescription('The cryptocurrency symbol (e.g., btc, eth)')
                          .setRequired(true))
                .addNumberOption(option => 
                    option.setName('percent')
                          .setDescription('The percentage increase to trigger an alert')
                          .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a cryptocurrency from your watchlist')
                .addStringOption(option => 
                    option.setName('symbol')
                          .setDescription('The cryptocurrency symbol (e.g., btc, eth)')
                          .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List your watchlist')),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'trending') {
                return await this.showTrending(interaction);
            } else if (subcommand === 'price') {
                return await this.showPrice(interaction);
            } else if (subcommand === 'add') {
                return await this.addWatch(interaction);
            } else if (subcommand === 'delete') {
                return await this.deleteWatch(interaction);
            } else if (subcommand === 'list') {
                return await this.listWatch(interaction);
            } else {
                throw new Error('Invalid subcommand');
            }
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
            await interaction.reply({ content: 'There was an error trying to execute the command.', flags: 64 });
        }
    },

    async showPrice(interaction) {
        const crypto = interaction.options.getString('symbol').toLowerCase();
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd&include_24hr_change=true`;
        const sparklineUrl = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=7`;

        try {
            console.log(`Fetching data for: ${crypto} from CoinGecko API`);

            const [priceResponse, sparklineResponse] = await Promise.all([
                axios.get(url),
                axios.get(sparklineUrl)
            ]);

            if (!priceResponse.data || !priceResponse.data[crypto]) {
                console.error('Price data not found or invalid cryptocurrency symbol.');
                await interaction.reply({ content: 'Could not retrieve the details. Please check the cryptocurrency symbol and try again.', flags: 64 });
                return;
            }

            const priceData = priceResponse.data[crypto];
            const sparklineData = sparklineResponse.data.prices;

            const price = priceData.usd;
            const change24h = priceData.usd_24h_change || 0;
            const last7Days = sparklineData.map(entry => entry[1]);

            // Optimize chart data to reduce URL length
            const reducedDataPoints = last7Days.filter((_, index) => index % Math.ceil(last7Days.length / 10) === 0);

            // Create the chart URL using QuickChart
            const chartConfig = {
                type: 'line',
                data: {
                    labels: reducedDataPoints.map((_, index) => `${7 - index}d`),
                    datasets: [{
                        label: `${crypto.toUpperCase()} price`,
                        data: reducedDataPoints,
                        fill: false,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.1
                    }]
                }
            };
            const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

            // Ensure the URL length is within the limit
            if (chartUrl.length > 2048) {
                console.error('Chart URL is too long.');
                await interaction.reply({ content: 'The chart URL generated is too long. Please try again with a different cryptocurrency symbol.', flags: 64 });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('Cryptocurrency Price')
                .setDescription(`Details for ${crypto.toUpperCase()}`)
                .addFields(
                    { name: 'Price', value: `$${price} USD`, inline: true },
                    { name: 'Change (24h)', value: `${change24h.toFixed(2)}%`, inline: true }
                )
                .setImage(chartUrl)
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed], flags: 64 });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error('404 Error: Invalid cryptocurrency symbol or endpoint not found.');
                await interaction.reply({ content: 'Could not retrieve the details. Please check the cryptocurrency symbol and try again.', flags: 64 });
            } else {
                console.error(`Error fetching cryptocurrency details: ${error.message}`);
                await interaction.reply({ content: 'There was an error trying to fetch the cryptocurrency details.', flags: 64 });
            }
        }
    },

    async showTrending(interaction) {
        const trendingUrl = 'https://api.coingecko.com/api/v3/search/trending';

        try {
            console.log('Fetching trending cryptocurrencies from CoinGecko API');

            const response = await axios.get(trendingUrl);

            if (!response.data || !response.data.coins || response.data.coins.length === 0) {
                console.error('No trending data found.');
                await interaction.reply({ content: 'Could not retrieve trending cryptocurrencies.', flags: 64 });
                return;
            }

            const trendingCoins = response.data.coins.slice(0, 5);

            const embed = new EmbedBuilder()
                .setTitle('Trending Cryptocurrencies')
                .setDescription('Top 5 trending cryptocurrencies on CoinGecko')
                .setColor(0x00AE86);

            trendingCoins.forEach((coin, index) => {
                embed.addFields(
                    { name: `${index + 1}. ${coin.item.name} (${coin.item.symbol.toUpperCase()})`, value: `Market Cap Rank: ${coin.item.market_cap_rank}`, inline: false }
                );
            });

            await interaction.reply({ embeds: [embed], flags: 64 });
        } catch (error) {
            console.error(`Error fetching trending cryptocurrencies: ${error.message}`);
            await interaction.reply({ content: 'There was an error trying to fetch the trending cryptocurrencies.', flags: 64 });
        }
    },

    async addWatch(interaction) {
        const crypto = interaction.options.getString('symbol').toLowerCase();
        const percent = interaction.options.getNumber('percent');

        const watchlist = loadWatchlist();
        watchlist.push({ crypto, percent });
        saveWatchlist(watchlist);

        console.debug(`Added ${crypto.toUpperCase()} with alert set for ${percent}% increase.`); // Debug statement
        await interaction.reply({ content: `Added ${crypto.toUpperCase()} to watchlist with alert set for ${percent}% increase.`, flags: 64 });
    },

    async deleteWatch(interaction) {
        const crypto = interaction.options.getString('symbol').toLowerCase();

        let watchlist = loadWatchlist();
        watchlist = watchlist.filter(item => item.crypto !== crypto);
        saveWatchlist(watchlist);

        console.debug(`Deleted ${crypto.toUpperCase()} from watchlist.`); // Debug statement
        await interaction.reply({ content: `Deleted ${crypto.toUpperCase()} from watchlist.`, flags: 64 });
    },

    async listWatch(interaction) {
        const watchlist = loadWatchlist();

        if (watchlist.length === 0) {
            console.debug('Watchlist is empty.'); // Debug statement
            await interaction.reply({ content: 'Your watchlist is empty.', flags: 64 });
            return;
        }

        const embed = new EmbedBuilder()
        .setTitle('Your Cryptocurrency Watchlist')
        .setDescription(watchlist.map(item => `${item.crypto.toUpperCase()}: Alert at ${item.percent}% increase`).join('\n'));

        console.debug('Displaying watchlist:', watchlist); // Debug statement
        await interaction.reply({ embeds: [embed], flags: 64 });
    }
};
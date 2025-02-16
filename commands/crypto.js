const axios = require('axios');

module.exports = {
    name: 'crypto',
    description: 'Checks the current price of a cryptocurrency',
    adminOnly: false,
    execute(message, args, client) {
        const crypto = args[0]?.toUpperCase();

        if (!crypto) {
            message.reply('Please provide a cryptocurrency symbol (e.g., BTC, ETH).');
            return;
        }

        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`;

        axios.get(url)
            .then(response => {
                const price = response.data[crypto.toLowerCase()]?.usd;
                if (price) {
                    message.channel.send(`The current price of ${crypto} is $${price} USD.`);
                } else {
                    message.channel.send('Could not retrieve the price. Please check the cryptocurrency symbol and try again.');
                }
            })
            .catch(error => {
                console.error(`Error fetching cryptocurrency price: ${error.message}`);
                message.channel.send('There was an error trying to fetch the cryptocurrency price.');
            });
    },
};
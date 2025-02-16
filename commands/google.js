const axios = require('axios');
require('dotenv').config();

// List of admin Discord IDs
const adminIds = ['YOUR_DISCORD_ID_1', 'YOUR_DISCORD_ID_2'];

module.exports = {
    name: 'google',
    description: 'Searches Google and posts the results',
    execute(message, args, client) {
        if (!adminIds.includes(message.author.id)) {
            message.reply('You do not have permission to use this command.');
            return;
        }

        const query = args.join(' ');

        if (!query) {
            message.reply('Please provide a search query.');
            return;
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        const cx = process.env.GOOGLE_CX;
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

        axios.get(url)
            .then(response => {
                const items = response.data.items;
                if (items && items.length > 0) {
                    let results = 'Google Search Results:\n';
                    items.forEach((item, index) => {
                        results += `${index + 1}. [${item.title}](${item.link})\n`;
                    });
                    message.channel.send(results);
                } else {
                    message.channel.send('No results found.');
                }
            })
            .catch(error => {
                console.error(`Error searching Google: ${error.message}`);
                message.channel.send('There was an error trying to search Google.');
            });
    },
};
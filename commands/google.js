const axios = require('axios');
require('dotenv').config();

module.exports = {
    name: 'google',
    description: 'Searches Google and posts the results',
    adminOnly: true,
    execute(message, args, client) {
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
const fetch = require('node-fetch');

function sendWebhook(title, article, link, imageSrc, price, message) {
    const webhookUrl = 'YOUR_WEBHOOK_URL_HERE';
    const data = {
        username: 'Pokemon Center Bot',
        embeds: [
            {
                title: title,
                description: article,
                url: link,
                image: {
                    url: imageSrc,
                },
                fields: [
                    { name: 'Price', value: price, inline: true },
                    { name: 'Details', value: message, inline: true },
                ],
            },
        ],
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => console.log('Webhook sent successfully:', data))
    .catch(error => console.error('Error sending webhook:', error));
}

module.exports = {
    sendWebhook,
};
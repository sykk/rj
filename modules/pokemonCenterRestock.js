import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const urls = [
    'https://www.pokemoncenter-online.com/?p_cd=4521329421353',
'https://www.pokemoncenter-online.com/?p_cd=4521329421377'
];
const webhookLink = "https://ptb.discord.com/api/webhooks/1308971250801971250/xtNPhsWcXoE-RCjrE-CPuahoYdG991rJm0N_PVy1KcnMLjNkj6VDaXawhiGpW7cGdOeC";
let knownProducts = new Map();

function sendWebhook(title, article, link, image, price, stockStatus) {
    try {
        fetch(
            webhookLink,
            {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'Pokemon Center JP Monitor',
                    avatar_url: 'https://affluencestore.fr/wp-content/uploads/2024/03/LogoBackWhite.png',
                    embeds: [
                        {
                            color: 5763719,
                            title: title,
                            url: link ? link : 'https://keinemusik.com',
                            thumbnail: {
                                url: image ? image : 'https://affluencestore.fr/wp-content/uploads/2024/03/LogoBackWhite.png'
                            },
                            footer: {
                                text: 'Affluence Monitor',
                                icon_url: 'https://affluencestore.fr/wp-content/uploads/2024/03/LogoBackWhite.png',
                            },
                            fields: article ? [
                                {
                                    name: 'Article',
                                    value: article,
                                    inline: true
                                },
                                {
                                    name: 'Price',
                                    value: price,
                                    inline: true
                                },
                                {
                                    name: 'Stock Status',
                                    value: stockStatus,
                                    inline: true
                                },
                            ] : [],
                        },
                    ],
                }),
            }
        );
    } catch (error) {
        console.log(error)
    }
}

async function fetchDataPokemonCenter(isInitial = false) {
    try {
        for (const url of urls) {
            const response = await fetch(url);
            const body = await response.text();
            const $ = cheerio.load(body);

            const product = {
                link: url,
                article: $('h1').text().trim(),
                price: $('.price').text().trim(),
                stockStatus: 'sold-out',
                sizes: []
            };

            const sizeRows = $('.size tbody tr');
            sizeRows.each((_, row) => {
                const sizeName = $(row).find('th').text().trim();
                const soldOutImg = $(row).find('img[alt="SOLD OUT"]');
                const sizeStatus = soldOutImg.length === 0 ? 'in-stock' : 'sold-out';
                product.sizes.push({ size: sizeName, status: sizeStatus });
                if (sizeStatus === 'in-stock') {
                    product.stockStatus = 'in-stock';
                }
            });

            if (!knownProducts.has(url)) {
                knownProducts.set(url, product);
            } else {
                const knownProduct = knownProducts.get(url);
                // Check each size for restocks
                product.sizes.forEach((currentSize, index) => {
                    const previousSize = knownProduct.sizes[index];
                    if (previousSize.status === 'sold-out' && currentSize.status === 'in-stock') {
                        notifyRestocked(product, currentSize.size);
                    }
                });
                knownProducts.set(url, product);
            }
        }

        return Array.from(knownProducts.values());
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function notifyRestocked(product, restockedSize) {
    sendWebhook(
        `Size ${restockedSize} Restocked on Pokemon Center JP`,
        product.article,
        product.link,
        product.imageSrc,
        product.price,
        `Size ${restockedSize} is now in stock!`
    );
    console.log(`Size ${restockedSize} restocked for:`, product.article);
}

function automaticGetStock() {
    setInterval(() => {
        fetchDataPokemonCenter();
    }, 30000); // Check every 30 seconds
}

// Initial fetch to populate known products
fetchDataPokemonCenter(true).then(() => {
    console.log('Initial product list fetched. Starting automatic checks...');
    sendWebhook("Pokemon Center JP Monitor Started", "", "", "", "");
    automaticGetStock();
});

export const data = {
    name: 'pokemonCenterRestock'
};

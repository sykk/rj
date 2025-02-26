const fs = require('fs');
const path = require('path');

const watchlistPath = path.join(__dirname, '..', 'commands', 'watchlist.json');

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
    loadWatchlist,
    saveWatchlist
};
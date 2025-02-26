const fs = require('fs');
const path = require('path');

module.exports = {
    log: (message) => {
        const logPath = path.join(__dirname, 'activity.log');
        const logMessage = `${new Date().toISOString()} - ${message}\n`;
        fs.appendFileSync(logPath, logMessage, 'utf8');
    }
};

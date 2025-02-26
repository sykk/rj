const fs = require('fs');
const path = require('path');

module.exports = {
    log: (message) => {
        const logPath = path.join(__dirname, 'activity.log');
        const logMessage = `${new Date().toISOString()} - ${message}\n`;
        fs.appendFileSync(logPath, logMessage, 'utf8');
    },
    error: (message, error) => {
        const logPath = path.join(__dirname, 'error.log');
        const logMessage = `${new Date().toISOString()} - ${message}: ${error.stack || error.message || error}\n`;
        fs.appendFileSync(logPath, logMessage, 'utf8');
    }
};
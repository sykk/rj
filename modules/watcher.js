const fs = require('fs');
const path = require('path');

class Watcher {
    constructor(directory) {
        this.directory = directory;
    }

    watch() {
        fs.watch(this.directory, (eventType, filename) => {
            if (filename) {
                console.log(`${eventType} on file: ${filename}`);
            } else {
                console.log('filename not provided');
            }
        });
    }
}

module.exports = Watcher;
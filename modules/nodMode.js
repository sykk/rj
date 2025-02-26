const { Client, GatewayIntentBits, Events } = require('discord.js');

class NodMode {
    constructor(client) {
        this.client = client;
        this.nodTimeout = null;
        this.isNodding = false;
        this.exemptCommands = ['ping', 'help']; // Add any commands that should work in "nod mode"
        this.init();
    }

    init() {
        this.client.on(Events.MESSAGE_CREATE, (message) => this.handleMessage(message));
        this.startInactivityTimer();
    }

    startInactivityTimer() {
        this.clearInactivityTimer();
        this.nodTimeout = setTimeout(() => this.activateNodMode(), this.randomDelay(5, 10) * 60 * 1000);
    }

    clearInactivityTimer() {
        if (this.nodTimeout) {
            clearTimeout(this.nodTimeout);
            this.nodTimeout = null;
        }
    }

    randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    activateNodMode() {
        this.isNodding = true;
        this.client.channels.cache.forEach(channel => {
            if (channel.isTextBased()) {
                channel.send(':rjnod: nodding off..');
            }
        });
    }

    deactivateNodMode() {
        this.isNodding = false;
        this.client.channels.cache.forEach(channel => {
            if (channel.isTextBased()) {
                setTimeout(() => {
                    channel.send(':rj: i\'m awake.');
                }, this.randomDelay(5, 10) * 1000);
            }
        });
        this.startInactivityTimer();
    }

    handleMessage(message) {
        if (message.author.bot) return;

        if (message.content.includes('@rj#9396')) {
            if (this.isNodding) {
                this.deactivateNodMode();
            }
        } else if (this.isNodding) {
            const command = message.content.split(' ')[0].slice(1);
            if (this.exemptCommands.includes(command)) {
                return;
            } else {
                message.reply('I am currently in nod mode and cannot respond to commands.');
            }
        } else {
            this.startInactivityTimer();
        }
    }
}

module.exports = {
    NodMode,
    data: {
        name: 'nodMode'
    }
};

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
        console.log('[NodMode] Initializing NodMode...');
        this.client.on(Events.MESSAGE_CREATE, (message) => this.handleMessage(message));
        this.startInactivityTimer();
        console.log('[NodMode] Initialization complete.');
    }

    startInactivityTimer() {
        console.log('[NodMode] Starting inactivity timer...');
        this.clearInactivityTimer();
        this.nodTimeout = setTimeout(() => this.activateNodMode(), this.randomDelay(1, 2) * 60 * 1000);
        console.log(`[NodMode] Inactivity timer started with delay of ${this.nodTimeout}ms.`);
    }

    clearInactivityTimer() {
        if (this.nodTimeout) {
            console.log('[NodMode] Clearing inactivity timer...');
            clearTimeout(this.nodTimeout);
            this.nodTimeout = null;
            console.log('[NodMode] Inactivity timer cleared.');
        }
    }

    randomDelay(min, max) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log(`[NodMode] Calculated random delay: ${delay} minutes.`);
        return delay;
    }

    activateNodMode() {
        console.log('[NodMode] Activating nod mode...');
        this.isNodding = true;
        this.client.channels.cache.forEach(channel => {
            if (channel.isTextBased()) {
                channel.send(':rjnod: nodding off...')
                .then(() => console.log(`[NodMode] Message sent in channel ${channel.id}`))
                .catch(error => console.error(`[NodMode] Error sending message in channel ${channel.id}: ${error.stack}`));
            }
        });
        console.log('[NodMode] Nod mode activated.');
    }

    deactivateNodMode() {
        console.log('[NodMode] Deactivating nod mode...');
        this.isNodding = false;
        this.client.channels.cache.forEach(channel => {
            if (channel.isTextBased()) {
                setTimeout(() => {
                    channel.send(':rj: I\'m awake.')
                    .then(() => console.log(`[NodMode] Message sent in channel ${channel.id}`))
                    .catch(error => console.error(`[NodMode] Error sending message in channel ${channel.id}: ${error.stack}`));
                }, this.randomDelay(5, 10) * 1000);
            }
        });
        this.startInactivityTimer();
        console.log('[NodMode] Nod mode deactivated.');
    }

    handleMessage(message) {
        console.log(`[NodMode] Handling message from ${message.author.tag}: ${message.content}`);
        if (message.author.bot) return;

        if (message.content.includes('@rj#9396')) {
            if (this.isNodding) {
                console.log('[NodMode] Mention detected while in nod mode. Deactivating nod mode...');
                this.deactivateNodMode();
            }
        } else if (this.isNodding) {
            const command = message.content.split(' ')[0].slice(1);
            console.log(`[NodMode] Command received during nod mode: ${command}`);
            if (this.exemptCommands.includes(command)) {
                console.log(`[NodMode] Command ${command} is exempt from nod mode.`);
                return;
            } else {
                message.reply('I am currently in nod mode and cannot respond to commands.')
                .then(() => console.log(`[NodMode] Reply sent to ${message.author.tag}`))
                .catch(error => console.error(`[NodMode] Error replying to message: ${error.stack}`));
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

let nodMode = false;
let activityTimeout;

function activateNodMode(channel) {
    console.log("Activating nod mode...");
    nodMode = true;
    channel.send(':rjnod: nod mode activated');
    console.log("Nod mode activated.");
}

function deactivateNodMode(channel) {
    console.log("Deactivating nod mode...");
    nodMode = false;
    channel.send("i'm awake");
    console.log("Nod mode deactivated.");
}

function resetActivityTimeout(channel) {
    console.log("Resetting activity timeout...");
    if (activityTimeout) clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        console.log("Activity timeout triggered.");
        if (!nodMode) activateNodMode(channel);
    }, 30000); // 30 seconds
    console.log("Activity timeout set.");
}

function handleMessage(message) {
    console.log("Handling message:", message.content);
    if (message.author.bot) {
        console.log("Message is from a bot. Ignoring.");
        return;
    }

    if (nodMode) {
        console.log("Nod mode is active.");
        if (message.content.toLowerCase() === 'rj') {
            deactivateNodMode(message.channel);
        } else if (!message.content.startsWith('!')) {
            console.log("Message is not a command. Ignoring.");
            return false;
        }
    } else {
        console.log("Nod mode is not active. Resetting activity timeout.");
        if (message.content.startsWith('!')) {
            resetActivityTimeout(message.channel);
        }
    }

    console.log("Message handled successfully.");
    return true;
}

module.exports = {
    data: {
        name: 'nodmode',
    },
    handleMessage,
    activateNodMode,
    deactivateNodMode,
    resetActivityTimeout,
};

let nodMode = false;
let exemptedCommands = ["!help", "!info"];
let activityTimeout;

function activateNodMode(channel) {
    nodMode = true;
    channel.send(':rjnod: nod mode activated');
}

function deactivateNodMode(channel) {
    nodMode = false;
    channel.send("i'm awake");
}

function resetActivityTimeout(channel) {
    if (activityTimeout) clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        if (!nodMode) activateNodMode(channel);
    }, 30000);
}

function handleMessage(message) {
    if (message.author.bot) return;

    if (nodMode) {
        if (message.content.toLowerCase() === 'rj') {
            deactivateNodMode(message.channel);
        } else if (!exemptedCommands.includes(message.content.split(' ')[0])) {
            return false;
        }
    } else {
        resetActivityTimeout(message.channel);
    }

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

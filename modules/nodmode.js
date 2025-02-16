const ACTIVE_NICKNAME = "rj :rj:";
const NOD_NICKNAME = "rj :rjnod:";
const INACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 minutes in milliseconds

let lastActiveTime = Date.now();
let isNodMode = false;

module.exports = (client) => {
    client.on("ready", () => {
        setActive(client);
        setInterval(() => checkInactivity(client), 60 * 1000); // Check inactivity every minute
    });

    client.on("messageCreate", (msg) => {
        if (isNodMode && msg.content.toLowerCase() === "!wakeup") {
            setActive(client);
            msg.channel.send("I'm awake now!");
        } else if (!isNodMode) {
            // Reset inactivity timer on any command
            lastActiveTime = Date.now();
            // Add your other command handlers here
        }
    });
};

function setActive(client) {
    if (isNodMode) {
        client.user.setUsername(ACTIVE_NICKNAME);
        isNodMode = false;
    }
}

function setNodMode(client) {
    if (!isNodMode) {
        client.user.setUsername(NOD_NICKNAME);
        isNodMode = true;
    }
}

function checkInactivity(client) {
    if (!isNodMode && Date.now() - lastActiveTime >= INACTIVITY_THRESHOLD) {
        setNodMode(client);
    }
}
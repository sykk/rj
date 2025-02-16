# Discord-Telegram Relay Bot

This is a modular Discord bot built using JavaScript. The bot can relay messages from a specified Telegram channel to a specified Discord channel using simple commands.

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/discord-telegram-bot.git
    cd discord-telegram-bot
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:

    ```plaintext
    DISCORD_TOKEN=your_discord_bot_token
    TELEGRAM_TOKEN=your_telegram_bot_token
    ```

4. Replace `your_discord_bot_token` and `your_telegram_bot_token` with your actual tokens.

## Commands

### `!relay start`

Starts relaying messages from the added Telegram channels to the specified Discord channels.

### `!relay stop`

Stops relaying messages.

### `!relay add <discordChannelId> <telegramChannelId>`

Adds a relay pair. Messages from the specified Telegram channel will be relayed to the specified Discord channel.
This command also confirms the connection to both the Discord and Telegram channels.

### `!relay delete <discordChannelId> <telegramChannelId>`

Deletes a relay pair. Messages from the specified Telegram channel will no longer be relayed to the specified Discord channel.

### `!relay list`

Lists all current relay pairs.

## Running the Bot

To run the bot, execute the following command:

```bash
node index.js
```

## Example

1. Add a relay pair:

    ```plaintext
    !relay add 123456789012345678 987654321
    ```

    This command adds a relay pair where messages from Telegram channel ID `987654321` will be relayed to Discord channel ID `123456789012345678`.

2. Start relaying messages:

    ```plaintext
    !relay start
    ```

    This command starts relaying messages from the added Telegram channels to the specified Discord channels.

3. Stop relaying messages:

    ```plaintext
    !relay stop
    ```

    This command stops relaying messages.

4. Delete a relay pair:

    ```plaintext
    !relay delete 123456789012345678 987654321
    ```

    This command deletes the relay pair, stopping messages from Telegram channel ID `987654321` from being relayed to Discord channel ID `123456789012345678`.

5. List all relay pairs:

    ```plaintext
    !relay list
    ```

    This command lists all current relay pairs.

## License

This project is licensed under the MIT License.
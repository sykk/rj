# Discord-Telegram Relay Bot

This is a modular Discord bot built using JavaScript. The bot can relay messages from a specified Telegram channel to a specified Discord channel using simple commands, search Google, check cryptocurrency prices, and more.

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
    GOOGLE_API_KEY=your_google_api_key
    GOOGLE_CX=your_google_cx
    ADMIN_IDS=your_admin_discord_ids_comma_separated
    ```

4. Replace `your_discord_bot_token`, `your_telegram_bot_token`, `your_google_api_key`, `your_google_cx`, and `your_admin_discord_ids_comma_separated` with your actual tokens and admin Discord IDs.

## Commands

### `!relay start`

Starts relaying messages from the added Telegram channels to the specified Discord channels. (Admin only)

### `!relay stop`

Stops relaying messages. (Admin only)

### `!relay add <discordChannelId> <telegramChannelId>`

Adds a relay pair. Messages from the specified Telegram channel will be relayed to the specified Discord channel. This command also confirms the connection to both the Discord and Telegram channels. (Admin only)

### `!relay delete <discordChannelId> <telegramChannelId>`

Deletes a relay pair. Messages from the specified Telegram channel will no longer be relayed to the specified Discord channel. (Admin only)

### `!relay list`

Lists all current relay pairs. (Admin only)

### `!echo <message>`

Echoes the user's message.

### `!restart`

Restarts the bot. (Admin only)

### `!google <query>`

Searches Google and posts the results. (Admin only)

### `!crypto <symbol>`

Checks the current price of a cryptocurrency.

### `!ping`

Checks the bot's latency.

### `!help`

Lists all available commands.

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

6. Echo a message:

    ```plaintext
    !echo Hello, world!
    ```

    This command echoes the message "Hello, world!".

7. Restart the bot:

    ```plaintext
    !restart
    ```

    This command restarts the bot.

8. Search Google:

    ```plaintext
    !google Discord bot tutorial
    ```

    This command searches Google for "Discord bot tutorial" and posts the results.

9. Check cryptocurrency price:

    ```plaintext
    !crypto BTC
    ```

    This command checks the current price of Bitcoin (BTC).

10. Check bot latency:

    ```plaintext
    !ping
    ```

    This command checks the bot's latency.

11. List all commands:

    ```plaintext
    !help
    ```

    This command lists all available commands.

## License

This project is licensed under the MIT License.
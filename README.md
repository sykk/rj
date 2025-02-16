# Discord-Telegram Relay Bot

This is a modular Discord bot built using JavaScript and the discord.js library. The bot can relay messages from a specified Telegram channel to a specified Discord channel using simple commands, search Google, check cryptocurrency prices, and more.

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
    RJ_CHANNEL_ID=your_discord_channel_id
    CLIENT_ID=your_discord_client_id
    GUILD_ID=your_discord_guild_id
    ```

4. Replace the placeholder values with your actual tokens, IDs, and keys.

## Running the Bot

To run the bot, execute the following command:

```bash
node index.js
```

## License

This project is licensed under the MIT License.
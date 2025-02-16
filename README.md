# RJ Bot

**RJ Bot** is an AI-powered bot designed to manage various tasks and provide functionalities for different platforms. This bot is built using JavaScript and leverages several libraries and APIs to offer a seamless experience.

## Features

- Manage cryptocurrency watchlists and alerts
- Interact with users through Discord commands
- Fetch and display real-time cryptocurrency data
- Store and manage user preferences and settings

## Installation

To get started with RJ Bot, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/sykk/rj.git
    cd rj
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following environment variables:

    ```plaintext
    DISCORD_TOKEN=your_discord_bot_token
    TELEGRAM_TOKEN=your_telegram_bot_token
    GOOGLE_API_KEY=your_google_api_key
    GOOGLE_CX=your_google_cx
    ADMIN_IDS=your_admin_discord_ids_comma_separated
    RJ_CHANNEL_ID=your_discord_channel_id
    CLIENT_ID=your_discord_client_id
    GUILD_ID=your_discord_guild_id
    WATCH_CHANNEL_ID=your_watch_channel_id
    ```

    Replace the placeholder values with your actual tokens, IDs, and keys.

4. **Run the bot:**

    ```bash
    npm start
    ```

## Contributing

We welcome contributions to enhance RJ Bot. If you'd like to contribute, please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.
```` ▋
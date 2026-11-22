# OnlineDiscordBot

A Discord bot designed to enhance the online experience for players using
**[PSDK's online features](https://github.com/PokemonWorkshop/OnlineServer)**: it lists online players and mystery
gifts, and displays Pokédex information (Pokémon, moves, types) in English or French.

## Prerequisites

Before installing and running the bot, ensure you have the following:

- **Node.js** 18 or higher (required by `discord.js` v14).
- **npm** (comes with Node.js).
- A **Discord bot token** and **client ID** (available in
  the [Discord Developer Portal](https://discord.com/developers/applications)).
- Optionally, access to an **[Online Server](https://github.com/PokemonWorkshop/OnlineServer)** API (with its bearer
  token) and/or a **Data API** serving the game data.

## Installation guide

### 1. Clone the repository

```bash
git clone https://github.com/PokemonWorkshop/OnlineDiscordBot.git
cd OnlineDiscordBot
```

### 2. Create the `.env` file

Copy [`.env.example`](.env.example) to `.env` in the root folder and fill in each value:

```plaintext
DISCORD_BOT_NAME='PSDK Bot'
DISCORD_BOT_VERSION=1.0
DISCORD_TOKEN=<your-bot-token>
DISCORD_CLIENT_ID=<your-bot-client-id>
DISCORD_LOGS_CHANNEL_ID=<logs-channel-id>
ONLINE_SERVER_API_URL=<online-server-api-url>
ONLINE_SERVER_BEARER_TOKEN=<your-bearer-token>
DATA_API_BASE_URL=<data-api-base-url>
POKEMON_IMAGE_BASE_URL=<pokemon-image-base-url>
TICKET_URL=<ticket-url>
```

| Variable                     | Required | Description                                                                         |
|------------------------------|----------|-------------------------------------------------------------------------------------|
| `DISCORD_BOT_NAME`           | No       | Name displayed by `/about` (default: `PSDK Bot`).                                   |
| `DISCORD_BOT_VERSION`        | No       | Version displayed by `/about` (default: `1.0`).                                     |
| `DISCORD_TOKEN`              | Yes      | Bot token from the Discord Developer Portal.                                        |
| `DISCORD_CLIENT_ID`          | Yes      | Application client ID from the Discord Developer Portal.                            |
| `DISCORD_LOGS_CHANNEL_ID`    | No       | Channel where the bot sends its logs.                                               |
| `ONLINE_SERVER_API_URL`      | No       | Online Server API URL. Enables `/players` and `/gifts`.                             |
| `ONLINE_SERVER_BEARER_TOKEN` | No       | Bearer token provided by the Online Server.                                         |
| `DATA_API_BASE_URL`          | No       | Data API URL. Enables `/pokemon`, `/move` and `/type`.                              |
| `POKEMON_IMAGE_BASE_URL`     | No       | Base URL of the Pokémon sprites (`<url>001.png`). Without it, no sprite is shown.   |
| `TICKET_URL`                 | No       | URL opened by `/ticket` (e.g. a GitHub "new issue" page). Enables `/ticket`.        |

Commands depending on a URL are only registered when that URL is set.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the bot

```bash
node bot.js
```

Slash commands are registered on Discord at startup.

### Docker

A `Dockerfile` and a `docker-compose.yml` are provided. The compose file reads the variables from your `.env` and
expects an external `web` network:

```bash
docker network create web   # only once
docker compose up -d --build
```

## Available commands

Responses are displayed in the user's Discord language (English or French). Pokédex commands also accept a `lang`
option to force the language.

### General

- `/commands` — list the available commands.
- `/about` — display bot information (ping, uptime, version).
- `/ticket` — report a bug or suggest an idea (requires `TICKET_URL`).

### Online Server (requires `ONLINE_SERVER_API_URL`)

- `/players` — list the players.
- `/gifts` — list mystery gifts, filtered by type (`all`, `code`, `internet`), optionally including expired ones.

### Pokédex (requires `DATA_API_BASE_URL`)

- `/pokemon <name>` — display a Pokémon: sprite, base stats, types with their combined weaknesses and resistances,
  abilities, experience, encounter and breeding data. Type and ability buttons show their details.
- `/move <name>` — display a move.
- `/type <name>` — display a type: its weaknesses and resistances (damage taken) and the types it is super effective
  or not very effective against (damage dealt).

### Logs

If `DISCORD_LOGS_CHANNEL_ID` is set, the bot logs its actions and errors in that channel.

## Configuration

- **Bot permissions**: Make sure your bot has the required permissions to function. You can use
  the [Discord Permissions Calculator](https://discordapi.com/permissions.html) to set up the necessary permissions.
- **Bot settings**: Settings are read from the environment in [`tools/settings.js`](tools/settings.js).
- **Environment variables**: Do not share your `.env` file publicly to protect sensitive data like your token.

## Troubleshooting

- **Dependencies**: Ensure all dependencies are installed correctly. Run `npm install` again if needed.
- **Node.js version**: Make sure you're using Node.js 18 or higher.
- **Bot token**: Verify your token and other credentials in the `.env` file.
- **Missing commands**: Check that the matching API URL is set, then restart the bot. Discord may take a few minutes
  to refresh the command list.
- **Logs**: Check the console and the logs channel to see if a message is relevant to your error.

If the problem persists, open a ticket with `/ticket` or directly on
[GitHub](https://github.com/ForetEternelle/OnlineDiscordBot/issues).

## Hosting

To host your Discord bot, you can choose between local hosting or a remote server. For local hosting, run `node bot.js`.
For a more reliable solution, consider hosting on a VPS (like those provided by OVH, DigitalOcean, or AWS) and use
Docker (see above) or a process manager like PM2 to keep your bot running persistently.
Ensure your hosting environment is secure by setting up a firewall and keeping your token and sensitive data private.

You may want to check the [Online Server](https://github.com/PokemonWorkshop/OnlineServer) README file for more
information about hosting.

## License

This project is licensed under the [MIT License](LICENSE).

## Contribution

Contributions are welcome! Feel free to submit a pull request or open an
[issue](https://github.com/ForetEternelle/OnlineDiscordBot/issues) for any bugs or improvements.

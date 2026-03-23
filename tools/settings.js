const {GatewayIntentBits} = require('discord.js');

function getEnv(primaryKey, legacyKeys = []) {
    const keys = [primaryKey, ...legacyKeys];
    for (const key of keys) {
        const value = process.env[key];
        if (typeof value === 'string' && value.trim() !== '') {
            return value;
        }
    }
    return undefined;
}

const botName = getEnv('DISCORD_BOT_NAME', ['BOT_NAME']) || 'PSDK Bot';
const botVersion = getEnv('DISCORD_BOT_VERSION', ['BOT_VERSION']) || '1.0';
const discordToken = getEnv('DISCORD_TOKEN', ['TOKEN']);
const discordClientId = getEnv('DISCORD_CLIENT_ID', ['CLIENT_ID']);
const onlineServerBearerToken = getEnv('ONLINE_SERVER_BEARER_TOKEN', ['BEARER']);
const baseUrlOnlineServerAPI = getEnv('ONLINE_SERVER_API_URL', ['ONLINE_SERVER_URL']);
const baseUrlDataApi = getEnv('DATA_API_BASE_URL', ['BASE_URL_DATA_API']);
const pokemonImageBaseUrl = getEnv('POKEMON_IMAGE_BASE_URL', ['IMAGE_URL']);
// Color of the messages
const embedColor = 0x345C6D;
// Name of the logs channel
const logsChannelName = '📰-logs';

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
];

module.exports = {
    botName,
    botVersion,
    discordToken,
    discordClientId,
    onlineServerBearerToken,
    baseUrlOnlineServerAPI,
    baseUrlDataApi,
    pokemonImageBaseUrl,
    embedColor,
    logsChannelName,
    intents
};

const {ContainerBuilder, TextDisplayBuilder} = require('discord.js');
const {logInteraction} = require('../tools/log');
const {botName, botVersion, embedColor} = require('../tools/settings');
const {getLanguage} = require('../tools/language');

/**
 * Displays information about the bot, including its ping, uptime, and version.
 * @param {object} interaction - The interaction object from Discord.js.
 * @param {object} client - The Discord client object.
 * @returns {ContainerBuilder} The container to send.
 */
async function showABout(interaction, client) {
    logInteraction('About command', interaction, client, true);

    const lang = getLanguage(interaction);
    const ping = client.ws.ping;

    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400).toString().padStart(2, '0');
    const hours = Math.floor((uptime % 86400) / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(uptime % 60).toString().padStart(2, '0');

    const labels = {
        en: {
            title: `**About ${botName}**`,
            ping: `📡 **Ping:** ${ping} ms`,
            uptime: `⏱️ **Uptime:** ${days}d ${hours}h ${minutes}m ${seconds}s`,
            version: `🚀 **Version:** ${botVersion}`
        },
        fr: {
            title: `**À propos de ${botName}**`,
            ping: `📡 **Ping :** ${ping} ms`,
            uptime: `⏱️ **Uptime :** ${days}j ${hours}h ${minutes}m ${seconds}s`,
            version: `🚀 **Version :** ${botVersion}`
        }
    };

    const t = labels[lang];

    const container = new ContainerBuilder()
        .setAccentColor(embedColor);

    container.addTextDisplayComponents(
        new TextDisplayBuilder({content: t.title}),
        new TextDisplayBuilder({content: t.ping}),
        new TextDisplayBuilder({content: t.uptime}),
        new TextDisplayBuilder({content: t.version})
    );

    return container;
}

module.exports = {showABout};

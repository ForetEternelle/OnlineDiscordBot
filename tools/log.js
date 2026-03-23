const {ContainerBuilder, SectionBuilder, TextDisplayBuilder, MessageFlags} = require('discord.js');
const {embedColor, logsChannelName, botName} = require('../tools/settings');

/**
 * Logs an interaction with the bot in the console and in a channel of the bot named "📰-logs" (set in the settings file).
 * @param {string} message - The message to log.
 * @param {object} [interaction=null] - The interaction object from Discord.js.
 * @param {object} [client=null] - The Discord client object.
 * @param {boolean} [warn=false] - Indicates if this log is a warning.
 */
async function logInteraction(message, interaction = null, client = null, warn = false) {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];

    let userInfoMessage = 'N/A';
    let userInfoConsole = '';

    const user = interaction?.user;
    const guildName = interaction?.guild?.name || 'DM';

    if (user) {
        const userName = user.username;
        const userId = user.id;
        const commandName = interaction.commandName ?? interaction.customId ?? 'N/A';

        userInfoMessage = `**User**: ${userName} (${userId})\n**Command/ID**: ${commandName}\n**Server**: ${guildName}`;
        userInfoConsole = ` | User: ${userName} (${userId}) | Command: ${commandName} | Guild: ${guildName}`;
    } else if (interaction?.customId) {
        userInfoMessage = `**Interaction ID**: ${interaction.customId}\n**Server**: ${guildName}`;
        userInfoConsole = ` | Interaction ID: ${interaction.customId} | Guild: ${guildName}`;
    }

    const logMessage = `[${timeString}] ${message}${userInfoConsole}`;
    warn ? console.warn(logMessage) : console.log(logMessage);

    if (client) {
        const container = new ContainerBuilder()
            .setAccentColor(embedColor);

        const section = new SectionBuilder();
        section.addTextDisplayComponents(
            new TextDisplayBuilder({ content: `📜 **${botName} Log**` }),
            new TextDisplayBuilder({ content: `📄 **Message**: ${message}` }),
            new TextDisplayBuilder({ content: `🔍 **Details**:\n${userInfoMessage}` })
        );

        container.addSectionComponents(section);

        const logChannel = client.channels.cache.find(ch => ch.name === logsChannelName);

        if (logChannel) {
            try {
                await logChannel.send({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch (error) {
                console.error(`Failed to send log message to channel '${logsChannelName}'. Error:`, error);
            }
        } else {
            console.error(`Channel '${logsChannelName}' not found to send the log message.`);
        }
    }
}

module.exports = {logInteraction};
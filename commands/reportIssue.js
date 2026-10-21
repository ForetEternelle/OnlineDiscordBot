const {ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const {logInteraction} = require('../tools/log');
const {embedColor, ticketUrl} = require('../tools/settings');
const {getLanguage} = require('../tools/language');

/**
 * Displays a link to open a ticket (TICKET_URL).
 * @param {object} interaction - The interaction object from Discord.js.
 * @param {object} client - The Discord client object.
 * @returns {ContainerBuilder} The container to send.
 */
async function reportIssue(interaction, client) {
    logInteraction('Ticket command', interaction, client, true);

    const lang = getLanguage(interaction);

    const labels = {
        en: {
            title: '**🎫 Report an issue**',
            description: 'Found a bug or have an idea? Open a ticket.',
            open: 'Open a ticket'
        },
        fr: {
            title: '**🎫 Signaler un problème**',
            description: 'Un bug ou une idée ? Ouvre un ticket.',
            open: 'Ouvrir un ticket'
        }
    };

    const t = labels[lang];

    const container = new ContainerBuilder()
        .setAccentColor(embedColor);

    container.addTextDisplayComponents(
        new TextDisplayBuilder({content: t.title}),
        new TextDisplayBuilder({content: t.description})
    );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel(t.open)
                .setStyle(ButtonStyle.Link)
                .setURL(ticketUrl)
        )
    );

    return container;
}

module.exports = {reportIssue};

const {ContainerBuilder, SectionBuilder, TextDisplayBuilder} = require('discord.js');
const {logInteraction} = require('../tools/log');
const {embedColor} = require('../tools/settings');
const {getLanguage} = require('../tools/language');

/**
 * Displays a list of available commands using Components V2.
 * @param {object} interaction - The interaction object from Discord.js.
 * @returns {ContainerBuilder} The container to send.
 */
async function commandsList(interaction) {
    logInteraction('Commands list command', interaction, interaction.client, true);

    const lang = getLanguage(interaction);
    const commands = await interaction.client.application.commands.fetch();
    const container = new ContainerBuilder()
        .setAccentColor(embedColor);

    const section = new SectionBuilder();

    commands.forEach(command => {
        // Use localized description if available
        const description = command.descriptionLocalizations?.[lang] || command.description;
        section.addTextDisplayComponents(
            new TextDisplayBuilder({content: `</${command.name}:${command.id}> - ${description}`})
        );
    });

    container.addSectionComponents(section);

    return container;
}

module.exports = {commandsList};

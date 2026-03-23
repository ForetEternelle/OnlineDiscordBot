const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {
    MessageFlags,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    Colors
} = require('discord.js');
const { logInteraction } = require('../tools/log');
const { baseUrlDataApi, onlineServerBearerToken } = require('../tools/settings');

async function handleAbilityShow(interaction) {
    const customId = interaction.customId;
    const abilityId = customId.split('&')[0].replace('ability_', '');
    const lang = customId.includes('lang=') ? customId.split('lang=')[1].split('&')[0] : 'en';

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const labels = {
        en: {
            unable: '⚠️ Unable to retrieve this ability.',
            error: "⚠️ An error occurred while retrieving this ability."
        },
        fr: {
            unable: '⚠️ Impossible de récupérer ce talent.',
            error: "⚠️ Une erreur est survenue lors de la récupération de ce talent."
        }
    };
    const t = labels[lang];

    try {
        const response = await fetch(
            `${baseUrlDataApi}/abilities/${abilityId}?lang=${lang}`,
            {
                headers: {
                    authorization: onlineServerBearerToken
                }
            }
        );

        if (!response.ok) throw new Error('API_RESPONSE_NOT_OK');

        const ability = await response.json();
        if (!ability || !ability.symbol) {
            return interaction.editReply({ content: t.unable });
        }

        const container = new ContainerBuilder()
            .setAccentColor(Colors.Blue);

        const section = new SectionBuilder();
        section.addTextDisplayComponents(
            new TextDisplayBuilder({ content: `# **${ability.name}**` }),
            new TextDisplayBuilder({ content: `${ability.description}` }),
        );

        container.addSectionComponents(section);

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });

    } catch (error) {
        console.error('Error while fetching ability:', error);
        logInteraction('Error in handleAbilityShow:', error);

        await interaction.editReply({
            content: t.error
        });
    }
}

module.exports = { handleAbilityShow };
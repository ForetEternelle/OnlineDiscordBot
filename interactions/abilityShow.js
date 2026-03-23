const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    Colors
} = require('discord.js');
const { logInteraction } = require('../tools/log');
const { baseUrlDataApi, onlineServerBearerToken } = require('../tools/settings');

async function handleAbilityShow(interaction) {
    const abilityId = interaction.customId.split('&')[0].replace('ability_', '');
    const lang = interaction.locale || 'en';

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
        const response = await fetch(
            `${baseUrlDataApi}/abilities/${abilityId}?lang=${encodeURIComponent(lang.toString())}`,
            {
                headers: {
                    authorization: onlineServerBearerToken
                }
            }
        );

        if (!response.ok) throw new Error('API_RESPONSE_NOT_OK');

        const ability = await response.json();
        if (!ability || !ability.symbol) {
            return interaction.editReply({ content: '⚠️ Impossible de récupérer cette capacité.' });
        }

        // 2. Construction du composant V2
        const container = new ContainerBuilder()
            .setAccentColor(Colors.Blue);

        container.addTextDisplayComponents(
            new TextDisplayBuilder({ content: `# **${ability.name}**` }),
            new TextDisplayBuilder({ content: `${ability.description}` }),
        );

        // 3. Envoi de la réponse avec le flag IsComponentsV2
        await interaction.editReply({
            // On s'assure que les flags incluent bien le support V2
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            components: [container]
        });

    } catch (error) {
        console.error('Error while fetching ability :', error);
        logInteraction('Error in handleAbilityShow:', error);

        // Pas besoin de flags ici, le deferReply a déjà fixé le canal éphémère
        await interaction.editReply({
            content: "⚠️ Une erreur s'est produite lors de la récupération de cette capacité."
        });
    }
}

module.exports = { handleAbilityShow };
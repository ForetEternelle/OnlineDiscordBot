const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {
    MessageFlags,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    Colors
} = require('discord.js');
const {logInteraction} = require('../tools/log');
const {baseUrlDataApi, onlineServerBearerToken} = require('../tools/settings');

async function handleTypeShow(interaction) {
    const customId = interaction.customId;
    const typeSymbol = customId.split('&')[0].replace('type_', '');
    const lang = customId.includes('lang=') ? customId.split('lang=')[1].split('&')[0] : 'en';

    await interaction.deferReply({ flags: MessageFlags.Ephemeral});

    const labels = {
        en: {
            unable: '⚠️ Unable to retrieve this type.',
            weaknesses: 'Weaknesses (takes more damage)',
            resistances: 'Resistances (takes less damage)',
            noData: 'No damage data available.',
            error: "⚠️ An error occurred while retrieving this type."
        },
        fr: {
            unable: '⚠️ Impossible de récupérer ce type.',
            weaknesses: 'Faiblesses (reçoit plus de dégâts)',
            resistances: 'Résistances (reçoit moins de dégâts)',
            noData: 'Aucune donnée de dégâts disponible.',
            error: "⚠️ Une erreur est survenue lors de la récupération de ce type."
        }
    };
    const t = labels[lang];

    try {
        const response = await fetch(`${baseUrlDataApi}/types/${typeSymbol}?lang=${lang}`, {
            headers: {
                authorization: onlineServerBearerToken
            },
        });

        const type = await response.json();
        if (!type || !type.symbol)
            return interaction.editReply({ content: t.unable });

        const color = type.color ? parseInt(type.color.slice(1), 16) : Colors.Blurple;
        const container = new ContainerBuilder().setAccentColor(color);
        const section = new SectionBuilder();

        // Type title
        section.addTextDisplayComponents(
            new TextDisplayBuilder({ content: `# **${type.name}**` })
        );

        // Defensive damage table
        if (type.typeDamage && type.typeDamage.length > 0) {
            const weaknesses = type.typeDamage.filter(td => td.factor > 1);
            const resistances = type.typeDamage.filter(td => td.factor < 1);

            if (weaknesses.length > 0) {
                const weaknessesText = weaknesses
                    .map(td => `- **${td.defensiveType}** ×${td.factor}`)
                    .join('\n');
                section.addTextDisplayComponents(
                    new TextDisplayBuilder({
                        content: `**${t.weaknesses}:**\n${weaknessesText}`
                    })
                );
            }

            if (resistances.length > 0) {
                const resistancesText = resistances
                    .map(td => `- **${td.defensiveType}** ×${td.factor}`)
                    .join('\n');
                section.addTextDisplayComponents(
                    new TextDisplayBuilder({
                        content: `**${t.resistances}:**\n${resistancesText}`
                    })
                );
            }
        } else {
            section.addTextDisplayComponents(
                new TextDisplayBuilder({ content: t.noData })
            );
        }

        container.addSectionComponents(section);

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });

    } catch (error) {
        console.error('Error while fetching type:', error);
        logInteraction('Error in handleTypeShow:', error);
        await interaction.editReply({ content: t.error });
    }
}

module.exports = {handleTypeShow};


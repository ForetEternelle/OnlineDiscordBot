const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    Colors
} = require('discord.js');
const {logInteraction} = require('../tools/log');
const {getAllTypes, buildTypeMatchupSections} = require('../tools/types');
const {dataApi} = require('../tools/dataApi');

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
            strongAgainst: 'Super effective against (deals more damage)',
            weakAgainst: 'Not very effective against (deals less damage)',
            noData: 'No damage data available.',
            error: "⚠️ An error occurred while retrieving this type."
        },
        fr: {
            unable: '⚠️ Impossible de récupérer ce type.',
            weaknesses: 'Faiblesses (reçoit plus de dégâts)',
            resistances: 'Résistances (reçoit moins de dégâts)',
            strongAgainst: 'Super efficace contre (inflige plus de dégâts)',
            weakAgainst: 'Peu efficace contre (inflige moins de dégâts)',
            noData: 'Aucune donnée de dégâts disponible.',
            error: "⚠️ Une erreur est survenue lors de la récupération de ce type."
        }
    };
    const t = labels[lang];

    try {
        const allTypesPromise = getAllTypes(lang);
        const {data: type} = await dataApi.GET('/types/{symbol}', {
            params: {path: {symbol: typeSymbol}, query: {lang}},
        });
        const allTypes = await allTypesPromise;
        if (!type || !type.symbol)
            return interaction.editReply({ content: t.unable });

        const color = type.color ? parseInt(type.color.slice(1), 16) : Colors.Blurple;
        const container = new ContainerBuilder().setAccentColor(color);

        // Type title and data
        container.addTextDisplayComponents(
            new TextDisplayBuilder({ content: `# **${type.name}**` })
        );

        // Defensive and offensive matchups
        const sections = buildTypeMatchupSections(type, allTypes, t);

        if (sections.length > 0) {
            sections.forEach(content => {
                container.addTextDisplayComponents(new TextDisplayBuilder({content}));
            });
        } else {
            container.addTextDisplayComponents(
                new TextDisplayBuilder({ content: t.noData })
            );
        }

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


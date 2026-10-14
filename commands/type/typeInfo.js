const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    Colors
} = require('discord.js');
const {logInteraction} = require('../../tools/log');
const {getAllTypes, buildTypeMatchupSections} = require('../../tools/types');
const {baseUrlDataApi, onlineServerBearerToken} = require('../../tools/settings');
const {getLanguage} = require('../../tools/language');

/**
 * Labels for the locales.
 */
const T = {
    en: {
        notFound: name => `⚠️ Type "${name}" not found.`,
        error: '❌ Unable to retrieve type information.',
        missingName: '⚠️ You must specify a type name.',
        weaknesses: 'Weaknesses (takes more damage)',
        resistances: 'Resistances (takes less damage)',
        strongAgainst: 'Super effective against (deals more damage)',
        weakAgainst: 'Not very effective against (deals less damage)',
        noData: 'No damage data available.',
    },
    fr: {
        notFound: name => `⚠️ Type "${name}" non trouvé.`,
        error: '❌ Impossible de récupérer les informations du type.',
        missingName: '⚠️ Vous devez spécifier un nom de type.',
        weaknesses: 'Faiblesses (reçoit plus de dégâts)',
        resistances: 'Résistances (reçoit moins de dégâts)',
        strongAgainst: 'Super efficace contre (inflige plus de dégâts)',
        weakAgainst: 'Peu efficace contre (inflige moins de dégâts)',
        noData: 'Aucune donnée de dégâts disponible.',
    }
};

/**
 * Convert hex color to Discord decimal color safely.
 * @param {string} hex
 * @returns {number}
 */
function hexToDecimalColor(hex) {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return Colors.Blurple;
    return parseInt(hex.slice(1), 16);
}

/**
 * Fetches and displays type information using Components V2.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function typeInfo(interaction) {
    const lang = getLanguage(interaction);
    const t = T[lang];
    const typeName = interaction.options.getString('name');

    if (!typeName) {
        return interaction.reply({content: t.missingName, flags: MessageFlags.Ephemeral});
    }

    await interaction.deferReply();

    try {
        const allTypesPromise = getAllTypes(lang);
        const response = await fetch(`${baseUrlDataApi}/types/${typeName.toLowerCase()}?lang=${lang}`, {
            headers: {
                authorization: onlineServerBearerToken
            },
        });

        const type = await response.json();
        const allTypes = await allTypesPromise;

        if (!type || !type.symbol) {
            return interaction.editReply({content: t.notFound(typeName)});
        }

        const color = hexToDecimalColor(type.color);
        const container = new ContainerBuilder().setAccentColor(color);

        // Type title
        container.addTextDisplayComponents(
            new TextDisplayBuilder({ content: `# **${type.name}**` })
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        // Defensive and offensive matchups
        const sections = buildTypeMatchupSections(type, allTypes, t);

        if (sections.length > 0) {
            sections.forEach((content, index) => {
                if (index > 0) {
                    container.addSeparatorComponents(new SeparatorBuilder());
                }
                container.addTextDisplayComponents(new TextDisplayBuilder({content}));
            });
        } else {
            container.addTextDisplayComponents(
                new TextDisplayBuilder({ content: t.noData })
            );
        }

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
        });

    } catch (error) {
        console.error('❌ Error fetching type data:', error.message);
        logInteraction('Error in typeInfo:', error);
        await interaction.editReply({content: t.error});
    }
}

module.exports = {typeInfo};



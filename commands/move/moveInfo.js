const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    Colors
} = require('discord.js');
const {baseUrlDataApi} = require("../../tools/settings");
const {getLanguage} = require("../../tools/language");

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
 * Labels for the locales.
 */
const T = {
    en: {
        type: 'Type',
        category: 'Category',
        power: 'Power',
        accuracy: 'Accuracy',
        pp: 'PP',
        priority: 'Priority',
        criticalRate: 'Critical Rate',
        targeting: 'Targeting',
        aimedTarget: 'Target',
        contactType: 'Contact',
        execution: 'Execution',
        charge: 'Charge',
        recharge: 'Recharge',
        method: 'Method',
        interactionsLabel: 'Interactions',
        secondaryEffects: 'Secondary Effects',
        chance: 'Chance',
        statusEffects: 'Status Effects',
        mechanicalTagsLabel: 'Tags',
        yes: 'Yes',
        no: 'No',
        none: 'None',
        notFound: name => `⚠️ Move "${name}" not found.`,
        error: '❌ Unable to retrieve move information.',
        missingName: '⚠️ You must specify a move name.',
        categories: {
            physical: 'Physical',
            special: 'Special',
            status: 'Status'
        },
        targets: {
            adjacent_pokemon: 'Adjacent Pokémon',
            adjacent_foe: 'Adjacent Foe',
            adjacent_all_foe: 'All Adjacent Foes',
            all_foe: 'All Foes',
            adjacent_all_pokemon: 'All Adjacent Pokémon',
            all_pokemon: 'All Pokémon',
            user: 'User',
            user_or_adjacent_ally: 'User or Adjacent Ally',
            adjacent_ally: 'Adjacent Ally',
            all_ally: 'All Allies',
            all_ally_but_user: 'All Allies (except User)',
            any_other_pokemon: 'Any Other Pokémon',
            random_foe: 'Random Foe'
        },
        contacts: {
            NONE: 'None',
            DIRECT: 'Direct',
            DISTANT: 'Distant'
        },
        methods: {
            s_basic: 'Basic',
            s_stat: 'Stat Modifier',
            s_status: 'Status Infliction',
            s_multi_hit: 'Multi-Hit',
            s_2hits: 'Two Hits',
            s_ohko: 'One-Hit KO',
            s_2turns: 'Two Turns',
            s_self_stat: 'Self Stat Modifier',
            s_self_status: 'Self Status'
        },
        interactionNames: {
            BLOCABLE: 'Blockable',
            MIRROR_MOVE: 'Mirror Move',
            SNATCHABLE: 'Snatchable',
            MAGIC_COAT_AFFECTED: 'Magic Coat',
            KING_ROCK_UTILITY: "King's Rock",
            AFFECTED_BY_GRAVITY: 'Affected by Gravity',
            NON_SKY_BATTLE: 'Not usable in Sky Battle'
        },
        mechanicalTagNames: {
            AUTHENTIC: 'Authentic',
            BALLISTIC: 'Ballistic',
            BITE: 'Bite',
            DANCE: 'Dance',
            PUNCH: 'Punch',
            SLICE: 'Slice',
            SOUND: 'Sound',
            WIND: 'Wind',
            PULSE: 'Pulse',
            POWDER: 'Powder',
            MENTAL: 'Mental'
        },
        statuses: {
            BURN: 'Burn',
            FREEZE: 'Freeze',
            PARALYSIS: 'Paralysis',
            POISON: 'Poison',
            TOXIC: 'Badly Poisoned',
            SLEEP: 'Sleep',
            CONFUSION: 'Confusion',
            FLINCH: 'Flinch'
        }
    },
    fr: {
        type: 'Type',
        category: 'Catégorie',
        power: 'Puissance',
        accuracy: 'Précision',
        pp: 'PP',
        priority: 'Priorité',
        criticalRate: 'Taux de Critique',
        targeting: 'Ciblage',
        aimedTarget: 'Cible',
        contactType: 'Contact',
        execution: 'Exécution',
        charge: 'Charge',
        recharge: 'Recharge',
        method: 'Méthode',
        interactionsLabel: 'Interactions',
        secondaryEffects: 'Effets Secondaires',
        chance: 'Chance',
        statusEffects: 'Effets de Statut',
        mechanicalTagsLabel: 'Tags',
        yes: 'Oui',
        no: 'Non',
        none: 'Aucun',
        notFound: name => `⚠️ Capacité "${name}" non trouvée.`,
        error: '❌ Impossible de récupérer les informations de la capacité.',
        missingName: '⚠️ Vous devez spécifier un nom de capacité.',
        categories: {
            physical: 'Physique',
            special: 'Spéciale',
            status: 'Statut'
        },
        targets: {
            adjacent_pokemon: 'Pokémon adjacent',
            adjacent_foe: 'Ennemi adjacent',
            adjacent_all_foe: 'Tous les ennemis adjacents',
            all_foe: 'Tous les ennemis',
            adjacent_all_pokemon: 'Tous les Pokémon adjacents',
            all_pokemon: 'Tous les Pokémon',
            user: 'Lanceur',
            user_or_adjacent_ally: 'Lanceur ou Allié adjacent',
            adjacent_ally: 'Allié adjacent',
            all_ally: 'Tous les alliés',
            all_ally_but_user: 'Tous les alliés (sauf lanceur)',
            any_other_pokemon: 'N\'importe quel autre Pokémon',
            random_foe: 'Ennemi aléatoire'
        },
        contacts: {
            NONE: 'Aucun',
            DIRECT: 'Direct',
            DISTANT: 'À distance'
        },
        methods: {
            s_basic: 'Basique',
            s_stat: 'Modificateur de Stat',
            s_status: 'Infliction de Statut',
            s_multi_hit: 'Coups Multiples',
            s_2hits: 'Deux Coups',
            s_ohko: 'K.O. en un coup',
            s_2turns: 'Deux Tours',
            s_self_stat: 'Modificateur de Stat (Soi)',
            s_self_status: 'Statut (Soi)'
        },
        interactionNames: {
            BLOCABLE: 'Bloquable',
            MIRROR_MOVE: 'Mimique',
            SNATCHABLE: 'Saisie',
            MAGIC_COAT_AFFECTED: 'Reflet Magik',
            KING_ROCK_UTILITY: "Roche Royale",
            AFFECTED_BY_GRAVITY: 'Affecté par Gravité',
            NON_SKY_BATTLE: 'Non utilisable en Combat Aérien'
        },
        mechanicalTagNames: {
            AUTHENTIC: 'Authentique',
            BALLISTIC: 'Balistique',
            BITE: 'Morsure',
            DANCE: 'Danse',
            PUNCH: 'Poing',
            SLICE: 'Tranchant',
            SOUND: 'Son',
            WIND: 'Vent',
            PULSE: 'Aura',
            POWDER: 'Poudre',
            MENTAL: 'Mental'
        },
        statuses: {
            BURN: 'Brûlure',
            FREEZE: 'Gel',
            PARALYSIS: 'Paralysie',
            POISON: 'Poison',
            TOXIC: 'Gravement Empoisonné',
            SLEEP: 'Sommeil',
            CONFUSION: 'Confusion',
            FLINCH: 'Peur'
        }
    }
};

/**
 * Fetches and displays move information using Components V2.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function moveInfo(interaction, client) {
    const lang = getLanguage(interaction);
    const t = T[lang];
    const moveName = formatMoveEntry(interaction.options.getString('name'));

    if (!moveName) {
        return interaction.reply({content: t.missingName, flags: MessageFlags.Ephemeral});
    }

    await interaction.deferReply();

    try {
        const response = await fetch(`${baseUrlDataApi}/moves/detail/${moveName}?lang=${lang}`);

        if (!response.ok) {
            if (response.status === 404) {
                return interaction.editReply({content: t.notFound(moveName)});
            }
        }

        const moveData = await response.json();

        const color = hexToDecimalColor(moveData.type?.color);
        const container = new ContainerBuilder().setAccentColor(color);

        // Header Section
        const categoryText = t.categories[moveData.category] || moveData.category || '?';

        container.addTextDisplayComponents(
            new TextDisplayBuilder({content: `# **${moveData.name}**`}),
            new TextDisplayBuilder({content: `${moveData.description}`})
        );
        container.addSeparatorComponents(new SeparatorBuilder());

        // Main Stats Section
        const powerText = moveData.power > 0 ? `**${moveData.power}**` : '-';
        const accuracyText = moveData.accuracy > 0 ? `**${moveData.accuracy}%**` : '-';
        const priorityText = moveData.priority && moveData.priority !== 0 ? ` | ${t.priority}: **${moveData.priority > 0 ? '+' : ''}${moveData.priority}**` : '';

        container.addTextDisplayComponents(
            new TextDisplayBuilder({
                content: `**${t.type}:** ${moveData.type?.name || '?'}\n` +
                    `**${t.category}:** ${categoryText}\n` +
                    `**${t.power}:** ${powerText} | **${t.accuracy}:** ${accuracyText} | **${t.pp}:** **${moveData.pp ?? '?'}**${priorityText}`
            })
        );

        // Critical Rate (if not 1)
        if (moveData.criticalRate && moveData.criticalRate !== 1) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder({
                    content: `**${t.criticalRate}:** +${moveData.criticalRate}`
                })
            );
        }

        // Targeting Section
        if (moveData.targeting) {
            container.addSeparatorComponents(new SeparatorBuilder());
            const targetText = t.targets[moveData.targeting.aimedTarget] || moveData.targeting.aimedTarget || '?';
            const contactText = t.contacts[moveData.targeting.contactType] || moveData.targeting.contactType || '?';

            container.addTextDisplayComponents(
                new TextDisplayBuilder({
                    content: `**${t.targeting}:**\n` +
                        `${t.aimedTarget}: **${targetText}**\n` +
                        `${t.contactType}: **${contactText}**`
                })
            );
        }

        // Execution Section (if method exists, or charge/recharge is true)
        if (moveData.execution && (moveData.execution.method || moveData.execution.charge || moveData.execution.recharge)) {
            container.addSeparatorComponents(new SeparatorBuilder());
            let executionContent = `**${t.execution}:**\n`;

            if (moveData.execution.method) {
                const methodText = t.methods[moveData.execution.method] || moveData.execution.method;
                executionContent += `${t.method}: **${methodText}**\n`;
            }
            if (moveData.execution.charge) {
                executionContent += `${t.charge}: **${t.yes}**\n`;
            }
            if (moveData.execution.recharge) {
                executionContent += `${t.recharge}: **${t.yes}**\n`;
            }

            container.addTextDisplayComponents(
                new TextDisplayBuilder({content: executionContent.trim()})
            );
        }

        // Mechanical Tags Section
        if (moveData.mechanicalTags && moveData.mechanicalTags.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());
            const tagsText = moveData.mechanicalTags
                .map(tag => t.mechanicalTagNames[tag] || tag)
                .join(', ');
            container.addTextDisplayComponents(
                new TextDisplayBuilder({
                    content: `**${t.mechanicalTagsLabel}:** ${tagsText}`
                })
            );
        }

        // Secondary Effects Section
        if (moveData.secondaryEffects && moveData.secondaryEffects.chance > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());

            let effectsContent = `**${t.secondaryEffects}:**\n` +
                `${t.chance}: **${moveData.secondaryEffects.chance}%**`;

            if (moveData.secondaryEffects.statusEffects && moveData.secondaryEffects.statusEffects.length > 0) {
                const statusList = moveData.secondaryEffects.statusEffects
                    .map(effect => {
                        const statusName = t.statuses[effect.status] || effect.status;
                        return `${statusName} (${effect.luckRate}%)`;
                    })
                    .join(', ');

                effectsContent += `\n${t.statusEffects}: **${statusList}**`;
            }

            container.addTextDisplayComponents(
                new TextDisplayBuilder({content: effectsContent})
            );
        }

        // Interactions Section
        if (moveData.interactions && moveData.interactions.list && moveData.interactions.list.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());
            const interactionsText = moveData.interactions.list
                .map(interaction => t.interactionNames[interaction] || interaction)
                .join(', ');
            container.addTextDisplayComponents(
                new TextDisplayBuilder({
                    content: `**${t.interactionsLabel}:** ${interactionsText}`
                })
            );
        }

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });

    } catch (error) {
        console.error('Error while fetching move:', error);
        await interaction.editReply({content: t.error});
    }
}

function formatMoveEntry(moveName) {
    return moveName.replace(/ /g, '_')
        .replace(/\b\w/g, char => char.toLowerCase());
}

module.exports = {moveInfo};
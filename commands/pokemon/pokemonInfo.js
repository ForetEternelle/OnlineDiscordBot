const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {
    MessageFlags,
    TextDisplayBuilder,
    ContainerBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SeparatorBuilder,
    Colors
} = require('discord.js');


const {baseUrlDataApi, pokemonImageBaseUrl} = require('../../tools/settings');
const { logInteraction } = require('../../tools/log');
const {getLanguage} = require('../../tools/language');

/**
 * Format a Pokémon name (capitalize first letter).
 * @param {string} str
 * @returns {string}
 */
function formatName(str) {
    if (!str) return 'Unknown';
    return str;
}

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
 * Fetch localized Pokemon display name from API, fallback to identifier.
 * @param {string} identifier
 * @param {string} lang
 * @returns {Promise<string>}
 */
async function getLocalizedPokemonName(identifier, lang) {
    if (!identifier || identifier === '__undef__') return '-';

    try {
        const response = await fetch(`${baseUrlDataApi}/pokemon/${encodeURIComponent(identifier)}?lang=${lang}`);
        if (!response.ok) return identifier;

        const pokemon = await response.json();
        console.log(pokemon);
        return pokemon?.main_form?.name || pokemon?.name || identifier;
    } catch {
        return identifier;
    }
}

/**
 * Labels for the locales.
 */
const T = {
    en: {
        height: 'Height',
        weight: 'Weight',
        baseStats: 'Base Stats',
        types: 'Type',
        abilities: 'Abilities',
        experience: 'Experience',
        encounter: 'Encounter',
        breeding: 'Breeding',
        evGiven: 'EV Given',
        expCurve: 'Experience Curve',
        baseExp: 'Base Experience',
        baseLoyalty: 'Base Loyalty',
        catchRate: 'Catch Rate',
        genderRatio: 'Gender Ratio',
        itemHeld: 'Item Held',
        breedingGroups: 'Breeding Groups',
        eggSteps: 'Egg Steps',
        baby: 'Baby',
        male: 'Male',
        female: 'Female',
        genderless: 'Genderless',
        notFound: name => `⚠️ Pokémon "${name}" not found.`,
        error: '❌ Unable to retrieve Pokémon information.',
        missingName: '⚠️ You must specify a Pokémon name.',
        stats: {
            hp: 'HP',
            atk: 'ATK',
            def: 'DEF',
            ats: 'ATS',
            dfs: 'DFS',
            spd: 'SPD'
        },
        experience_curve: {
            fast: 'Fast',
            medium_fast: 'Medium Fast',
            medium_slow: 'Medium Slow',
            slow: 'Slow',
            fluctuating: 'Fluctuating',
            erratic: 'Erratic'
        }
    },
    fr: {
        height: 'Taille',
        weight: 'Poids',
        baseStats: 'Statistiques de base',
        types: 'Type',
        abilities: 'Talents',
        experience: 'Expérience',
        encounter: 'Rencontre',
        breeding: 'Reproduction',
        evGiven: 'EV donnés',
        expCurve: 'Courbe d\'expérience',
        baseExp: 'Expérience de base',
        baseLoyalty: 'Bonheur de base',
        catchRate: 'Taux de capture',
        genderRatio: 'Ratio de genre',
        itemHeld: 'Objet tenu',
        breedingGroups: 'Groupes d\'œuf',
        eggSteps: 'Pas d\'éclosion',
        baby: 'Bébé',
        male: 'Mâle',
        female: 'Femelle',
        genderless: 'Asexué',
        notFound: name => `⚠️ Pokémon "${name}" non trouvé.`,
        error: '❌ Impossible de récupérer les informations du Pokémon.',
        missingName: '⚠️ Vous devez spécifier un nom de Pokémon.',
        stats: {
            hp: 'PV',
            atk: 'ATK',
            def: 'DEF',
            ats: 'ATS',
            dfs: 'DFS',
            spd: 'VIT'
        },
        experience_curve: {
            fast: 'Rapide',
            medium_fast: 'Moyenne Rapide',
            medium_slow: 'Moyenne Lente',
            slow: 'Lente',
            fluctuating: 'Fluctuante',
            erratic: 'Erratique'
        }
    }
};

/**
 * Fetches and displays Pokémon information using Components V2.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function pokemonInfo(interaction, client) {
    const lang = getLanguage(interaction);
    const t = T[lang];
    const name = interaction.options.getString('name')?.toLowerCase();

    if (!name) {
        return interaction.reply({content: t.missingName, flags: MessageFlags.Ephemeral});
    }

    await interaction.deferReply();

    try {
        const response = await fetch(`${baseUrlDataApi}/pokemon/${name}?lang=${lang}`);
        if (!response.ok) {
            if (response.status === 404) {
                return interaction.editReply({content: t.notFound(name)});
            }
        }
        const pokemonData = await response.json();
        const mainForm = pokemonData.main_form;

        if (!mainForm) {
            return interaction.editReply({content: t.notFound(name)});
        }

        const color = hexToDecimalColor(mainForm.type1?.color);
        const number = pokemonData.number || '???';
        const container = new ContainerBuilder().setAccentColor(color);

        const headerComponents = [
            new TextDisplayBuilder({content: `# **${formatName(mainForm.name)} - ${number}**`}),
            new TextDisplayBuilder({content: `${mainForm.description}`}),
            new TextDisplayBuilder({
                content: `${t.height}: **${mainForm.height ?? '?'} m** | ${t.weight}: **${mainForm.weight ?? '?'} kg**`
            })
        ];

        if (pokemonImageBaseUrl && pokemonImageBaseUrl.trim() !== "") {
            const thumbnailUrl = `${pokemonImageBaseUrl}${pokemonData.number}.png`;
            const thumbnail = new ThumbnailBuilder({
                media: { url: thumbnailUrl }
            });
            const headerSection = new SectionBuilder()
                .addTextDisplayComponents(...headerComponents)
                .setThumbnailAccessory(thumbnail);
            container.addSectionComponents(headerSection);
        } else {
            container.addTextDisplayComponents(...headerComponents);
        }
        container.addSeparatorComponents(new SeparatorBuilder());

        const statsLines = [
            `${t.stats.hp}: **${mainForm.baseHp ?? '?'}**`,
            `${t.stats.atk}: **${mainForm.baseAtk ?? '?'}**`,
            `${t.stats.def}: **${mainForm.baseDfe ?? '?'}**`,
            `${t.stats.ats}: **${mainForm.baseAts ?? '?'}**`,
            `${t.stats.dfs}: **${mainForm.baseDfs ?? '?'}**`,
            `${t.stats.spd}: **${mainForm.baseSpd ?? '?'}**`
        ];

        container.addTextDisplayComponents(
            new TextDisplayBuilder({content: `**${t.baseStats}:**\n${statsLines.join(' | ')}`})
        );

        const typeRow = new ActionRowBuilder();

        if (mainForm.type1) {
            typeRow.addComponents(
                new ButtonBuilder()
                    .setLabel(formatName(mainForm.type1.name))
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`type_${mainForm.type1.symbol}&lang=${lang}`)
            );
        }

        if (mainForm.type2?.symbol) {
            typeRow.addComponents(
                new ButtonBuilder()
                    .setLabel(formatName(mainForm.type2.name))
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`type_${mainForm.type2.symbol}&lang=${lang}`)
            );
        }

        container.addSeparatorComponents(new SeparatorBuilder());
        container.addTextDisplayComponents(
            new TextDisplayBuilder({
                content: `**${t.types}${mainForm.type2 ? 's' : ''}:**`
            })
        );
        container.addActionRowComponents(typeRow);

        if (mainForm.abilities && mainForm.abilities.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder());
            const abilitiesRows = new ActionRowBuilder();
            // Remove duplicates from abilities array with name as key
            mainForm.abilities.filter((ability, index, self) => {
                return index === self.findIndex(a => a.name === ability.name);
            })
                .forEach((ability, index) => {
                abilitiesRows.addComponents(
                    new ButtonBuilder()
                        .setLabel(formatName(ability.name))
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`ability_${ability.symbol}&index=${index}&lang=${lang}`)
                );
            });
            container.addTextDisplayComponents(
                new TextDisplayBuilder({
                    content: `**${t.abilities}:**`
                })
            );
            container.addActionRowComponents(abilitiesRows);
        }

        // Experience Section
        container.addSeparatorComponents(new SeparatorBuilder());
        const evGivenParts = [];
        if (mainForm.evHp > 0) evGivenParts.push(`${t.stats.hp}: ${mainForm.evHp}`);
        if (mainForm.evAtk > 0) evGivenParts.push(`${t.stats.atk}: ${mainForm.evAtk}`);
        if (mainForm.evDfe > 0) evGivenParts.push(`${t.stats.def}: ${mainForm.evDfe}`);
        if (mainForm.evAts > 0) evGivenParts.push(`${t.stats.ats}: ${mainForm.evAts}`);
        if (mainForm.evDfs > 0) evGivenParts.push(`${t.stats.dfs}: ${mainForm.evDfs}`);
        if (mainForm.evSpd > 0) evGivenParts.push(`${t.stats.spd}: ${mainForm.evSpd}`);

        const evGivenText = evGivenParts.length > 0 ? evGivenParts.join(', ') : '-';

        container.addTextDisplayComponents(
            new TextDisplayBuilder({
                content: `**${t.experience}:**\n` +
                    `${t.evGiven}: **${evGivenText}**\n` +
                    `${t.expCurve}: **${t.experience_curve[mainForm.experienceType] || '?'}**\n` +
                    `${t.baseExp}: **${mainForm.baseExperience ?? '?'}** | ${t.baseLoyalty}: **${mainForm.baseLoyalty ?? '?'}**`
            })
        );

        // Encounter Section
        container.addSeparatorComponents(new SeparatorBuilder());
        let genderRatioText;
        if (mainForm.femaleRate === -1) {
            genderRatioText = t.genderless;
        } else {
            const femalePercent = mainForm.femaleRate;
            const malePercent = 100 - femalePercent;
            genderRatioText = `♂ ${malePercent}% / ♀ ${femalePercent}%`;
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder({
                content: `**${t.encounter}:**\n` +
                    `${t.catchRate}: **${mainForm.catchRate ?? '?'}**\n` +
                    `${t.genderRatio}: **${genderRatioText}**\n` +
                    `${t.itemHeld}: **-**`
            })
        );

        // Breeding Section
        if (mainForm.babyDbSymbol !== '__undef__') {
            container.addSeparatorComponents(new SeparatorBuilder());
            const breedingGroupsText = mainForm.breedGroups && mainForm.breedGroups.length > 0
                ? mainForm.breedGroups.filter((v, i, a) => a.indexOf(v) === i).join(', ')
                : '-';
            const babyDisplayName = await getLocalizedPokemonName(mainForm.babyDbSymbol, lang);
            container.addTextDisplayComponents(
                new TextDisplayBuilder({
                    content: `**${t.breeding}:**\n` +
                        `${t.baby}: **${babyDisplayName}**\n` +
                        `${t.breedingGroups}: **${breedingGroupsText}**\n` +
                        `${t.eggSteps}: **${mainForm.hatchSteps ?? '?'}**`
                })
            );
        }

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
        });

    } catch (error) {
        await logInteraction('Error in pokemonInfo:', error, client);
        console.error('❌ Error fetching Pokémon data:', error);
        await interaction.editReply({content: t.error});
    }
}

module.exports = {pokemonInfo};

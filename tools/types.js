const {dataApi} = require('./dataApi');

// Cache of all types per language: { lang: [type, ...] }
const typesCache = {};

/**
 * Capitalize the first letter of a string for display.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Fetches all types (localized) from the Data API.
 * Results are cached per language. Returns an empty array on failure.
 * @param {string} lang
 * @returns {Promise<Array<{name: string, symbol: string, color: string, typeDamage: Object<string, number>}>>}
 */
async function getAllTypes(lang) {
    if (typesCache[lang]) return typesCache[lang];

    try {
        const {data: types} = await dataApi.GET('/types', {
            params: {query: {lang}},
        });
        if (!Array.isArray(types)) return [];

        typesCache[lang] = types;
        return types;
    } catch (error) {
        console.error('❌ Error fetching types:', error.message);
        return [];
    }
}

/**
 * Returns the localized display name of a type symbol, falling back to the capitalized symbol.
 * @param {Array<{name: string, symbol: string}>} allTypes
 * @param {string} symbol
 * @returns {string}
 */
function getTypeDisplayName(allTypes, symbol) {
    return allTypes.find(type => type.symbol === symbol)?.name || capitalize(symbol);
}

/**
 * Computes the damage multiplier each attacking type deals to the given defending types.
 * For a dual type, the multipliers of both types are combined.
 * @param {string[]} defendingSymbols
 * @param {Array<{symbol: string, typeDamage?: Object<string, number>}>} allTypes
 * @returns {Array<{symbol: string, factor: number}>}
 */
function getDefensiveFactors(defendingSymbols, allTypes) {
    return allTypes.map(attacker => ({
        symbol: attacker.symbol,
        factor: defendingSymbols.reduce((factor, symbol) => factor * (attacker.typeDamage?.[symbol] ?? 1), 1),
    }));
}

/**
 * Builds the text sections describing the weaknesses and resistances of one or two defending types.
 * @param {string[]} defendingSymbols
 * @param {Array} allTypes
 * @param {{weaknesses: string, resistances: string}} labels
 * @returns {string[]} One markdown string per non-empty section.
 */
function buildDefensiveSections(defendingSymbols, allTypes, labels) {
    const factors = getDefensiveFactors(defendingSymbols, allTypes);
    const sections = {
        weaknesses: factors.filter(m => m.factor > 1).sort((a, b) => b.factor - a.factor),
        resistances: factors.filter(m => m.factor < 1).sort((a, b) => a.factor - b.factor),
    };

    return Object.entries(sections)
        .filter(([, matchups]) => matchups.length > 0)
        .map(([key, matchups]) => {
            const lines = matchups
                .map(m => `- **${getTypeDisplayName(allTypes, m.symbol)}** ×${m.factor}`)
                .join('\n');
            return `**${labels[key]}:**\n${lines}`;
        });
}

/**
 * Computes the offensive and defensive matchups of a type.
 * `typeDamage` holds the damage multiplier the type deals to each defending type,
 * so the defensive matchups are obtained by reading every other type's `typeDamage`.
 * @param {{symbol: string, typeDamage?: Object<string, number>}} type
 * @param {Array<{symbol: string, typeDamage?: Object<string, number>}>} allTypes
 * @returns {{strongAgainst: Array, weakAgainst: Array, weaknesses: Array, resistances: Array}}
 */
function getTypeMatchups(type, allTypes) {
    const offensive = Object.entries(type.typeDamage || {})
        .map(([symbol, factor]) => ({symbol, factor}));
    const defensive = getDefensiveFactors([type.symbol], allTypes);

    const byFactorDesc = (a, b) => b.factor - a.factor;
    const byFactorAsc = (a, b) => a.factor - b.factor;

    return {
        strongAgainst: offensive.filter(m => m.factor > 1).sort(byFactorDesc),
        weakAgainst: offensive.filter(m => m.factor < 1).sort(byFactorAsc),
        weaknesses: defensive.filter(m => m.factor > 1).sort(byFactorDesc),
        resistances: defensive.filter(m => m.factor < 1).sort(byFactorAsc),
    };
}

/**
 * Builds the text sections describing a type's matchups.
 * @param {{symbol: string, typeDamage?: Object<string, number>}} type
 * @param {Array} allTypes
 * @param {{weaknesses: string, resistances: string, strongAgainst: string, weakAgainst: string}} labels
 * @returns {string[]} One markdown string per non-empty section.
 */
function buildTypeMatchupSections(type, allTypes, labels) {
    const matchups = getTypeMatchups(type, allTypes);

    return ['weaknesses', 'resistances', 'strongAgainst', 'weakAgainst']
        .filter(key => matchups[key].length > 0)
        .map(key => {
            const lines = matchups[key]
                .map(m => `- **${getTypeDisplayName(allTypes, m.symbol)}** ×${m.factor}`)
                .join('\n');
            return `**${labels[key]}:**\n${lines}`;
        });
}

module.exports = {getAllTypes, getTypeDisplayName, getTypeMatchups, buildTypeMatchupSections, buildDefensiveSections};

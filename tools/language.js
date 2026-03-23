/**
 * Determines the target language for an interaction.
 * Priority: Command option 'lang' > Interaction locale > 'en' (default)
 * @param {object} interaction - The Discord interaction object.
 * @returns {string} The determined language code ('en' or 'fr').
 */
function getLanguage(interaction) {
    // 1. Check for command option 'lang'
    let lang = interaction.options?.getString('lang');
    if (lang) return lang;

    // 2. Check interaction locale
    // Discord locales often start with 'en' or 'fr' (e.g., 'en-US', 'fr')
    const locale = interaction.locale;
    if (locale && locale.startsWith('fr')) return 'fr';
    if (locale && locale.startsWith('en')) return 'en';

    // 3. Default to English
    return 'en';
}

module.exports = { getLanguage };

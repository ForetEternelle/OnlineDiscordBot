const {REST, Routes, SlashCommandBuilder} = require('discord.js');
const {logInteraction} = require('../../tools/log');
const {
    baseUrlOnlineServerAPI,
    baseUrlDataApi,
    discordToken,
    discordClientId
} = require('../../tools/settings');

const rest = new REST({version: '10'}).setToken(discordToken);

const commands = [
    new SlashCommandBuilder()
        .setName('commands')
        .setNameLocalizations({
            fr: 'commandes'
        })
        .setDescription('Displays the list of the application commands.')
        .setDescriptionLocalizations({
            fr: 'Affiche la liste des commandes de l\'application.'
        }),

    new SlashCommandBuilder()
        .setName('about')
        .setNameLocalizations({
            fr: 'info'
        })
        .setDescription('Displays information about the bot.')
        .setDescriptionLocalizations({
            fr: 'Affiche les informations sur le bot.'
        }),
];

const onlineServerApiCommands = [
    new SlashCommandBuilder()
        .setName('players')
        .setNameLocalizations({
            fr: 'joueurs'
        })
        .setDescription('Displays the list of players.')
        .setDescriptionLocalizations({
            fr: 'Affiche la liste des joueurs.'
        }),

    new SlashCommandBuilder()
        .setName('gifts')
        .setNameLocalizations({
            fr: 'cadeaux'
        })
        .setDescription('Displays the list of mystery gifts.')
        .setDescriptionLocalizations({
            fr: 'Affiche la liste des cadeaux mystères.'
        })
        .addStringOption(option =>
            option
                .setName('type')
                .setNameLocalizations({
                    fr: 'type'
                })
                .setDescription('Type of gifts to display')
                .setDescriptionLocalizations({
                    fr: 'Type de cadeaux à afficher'
                })
                .addChoices(
                    { name: 'All', value: 'all', name_localizations: { fr: 'Tous' } },
                    { name: 'Code', value: 'code', name_localizations: { fr: 'Code' } },
                    { name: 'Internet', value: 'internet', name_localizations: { fr: 'Internet' } }
                )
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('show_all')
                .setNameLocalizations({
                    fr: 'tout_afficher'
                })
                .setDescription('Display all gifts, including expired ones')
                .setDescriptionLocalizations({
                    fr: 'Affiche tous les cadeaux, y compris ceux expirés'
                })
                .addChoices(
                    { name: 'Yes', value: 'yes', name_localizations: { fr: 'Oui' } },
                    { name: 'No', value: 'no', name_localizations: { fr: 'Non' } }
                )
                .setRequired(false)
        ),
];

const dataApiCommands = [
    new SlashCommandBuilder()
        .setName('pokemon')
        .setNameLocalizations({
            fr: 'pokemon'
        })
        .setDescription('Display Pokémon information.')
        .setDescriptionLocalizations({
            fr: 'Affiche les informations d\'un Pokémon.'
        })
        .addStringOption(option =>
            option
                .setName('name')
                .setNameLocalizations({
                    fr: 'nom'
                })
                .setDescription('Pokémon name')
                .setDescriptionLocalizations({
                    fr: 'Nom du Pokémon'
                })
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('lang')
                .setNameLocalizations({
                    fr: 'langue'
                })
                .setDescription('Language for the response')
                .setDescriptionLocalizations({
                    fr: 'Langue de la réponse'
                })
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Français', value: 'fr' }
                )
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("move")
        .setNameLocalizations({
            fr: 'capacite'
        })
        .setDescription("Display Move information.")
        .setDescriptionLocalizations({
            fr: 'Affiche les informations d\'une capacité.'
        })
        .addStringOption(option =>
            option
                .setName('name')
                .setNameLocalizations({
                    fr: 'nom'
                })
                .setDescription('Move name')
                .setDescriptionLocalizations({
                    fr: 'Nom de la capacité'
                })
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('lang')
                .setNameLocalizations({
                    fr: 'langue'
                })
                .setDescription('Language for the response')
                .setDescriptionLocalizations({
                    fr: 'Langue de la réponse'
                })
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Français', value: 'fr' }
                )
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("type")
        .setNameLocalizations({
            fr: 'type'
        })
        .setDescription("Display Type information.")
        .setDescriptionLocalizations({
            fr: 'Affiche les informations d\'un type.'
        })
        .addStringOption(option =>
            option
                .setName('name')
                .setNameLocalizations({
                    fr: 'nom'
                })
                .setDescription('Type name')
                .setDescriptionLocalizations({
                    fr: 'Nom du type'
                })
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('lang')
                .setNameLocalizations({
                    fr: 'langue'
                })
                .setDescription('Language for the response')
                .setDescriptionLocalizations({
                    fr: 'Langue de la réponse'
                })
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Français', value: 'fr' }
                )
                .setRequired(false)
        ),
];

if (baseUrlOnlineServerAPI) {
    commands.push(...onlineServerApiCommands);
}
if (baseUrlDataApi) {
    commands.push(...dataApiCommands);
}

const commandsJSON = commands.map(command => command.toJSON());

async function registerCommands(clientId) {
    try {
        logInteraction('Registering Slash commands...');
        await rest.put(
            Routes.applicationCommands(clientId),
            {body: commandsJSON}
        );
        logInteraction('Slash commands registered successfully.');
    } catch (error) { 
        console.error('Error while registering Slash commands:', error);
    }
}

module.exports = {commands, registerCommands};

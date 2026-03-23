const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {ContainerBuilder, TextDisplayBuilder, MessageFlags} = require('discord.js');
const {formatDate} = require('../tools/date');
const {logInteraction} = require('../tools/log');
const {
    embedColor,
    baseUrlOnlineServerAPI,
    onlineServerBearerToken
} = require('../tools/settings');
const {getLanguage} = require('../tools/language');

/**
 * Fetches and displays a list of players in Discord using Components V2.
 * @param {object} interaction - The interaction object from Discord.js, used to reply or edit messages.
 * @param {object} client - The Discord client object.
 */
async function playersList(interaction, client) {
    logInteraction('Players list command', interaction, client, true);
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const lang = getLanguage(interaction);
    const labels = {
        en: {
            online: '🟢 Online',
            offline: '🔴 Offline',
            friendCode: 'Friend code',
            lastSeen: 'Last seen',
            noPlayers: 'No players found.',
            error: '❌ Unable to retrieve the list of players. Please try again later.'
        },
        fr: {
            online: '🟢 En ligne',
            offline: '🔴 Hors ligne',
            friendCode: 'Code ami',
            lastSeen: 'Dernière fois vu',
            noPlayers: 'Aucun joueur trouvé.',
            error: '❌ Impossible de récupérer la liste des joueurs. Veuillez réessayer plus tard.'
        }
    };
    const t = labels[lang];

    try {
        const response = await fetch(`${baseUrlOnlineServerAPI}/player?lang=${lang}`, {
            headers: {
                authorization: onlineServerBearerToken
            }
        });
        const data = await response.json();

        if (data.success) {
            const players = data.players;

            const playerList = players.map((player) => {
                const status = player.isOnline ? t.online : t.offline;
                const friendCode = player.friendCode || 'N/A';

                return `**${player.playerName}**\n` +
                    `${status}\n` +
                    `📋 **${t.friendCode}**: ${friendCode}\n` +
                    `📅 **${t.lastSeen}**: ${formatDate(player.lastConnection)}`;
            }).join('\n\n');

            const container = new ContainerBuilder()
                .setAccentColor(embedColor);

            container.addTextDisplayComponents(
                new TextDisplayBuilder({content: playerList || t.noPlayers})
            );

            await interaction.editReply({
                flags: MessageFlags.IsComponentsV2,
                components: [container]
            });
        } else {
            throw new Error('API response indicates failure');
        }
    } catch (error) {
        console.error('Error while fetching players:', error);

        await interaction.editReply({
            content: t.error
        });
    }
}

module.exports = {playersList};

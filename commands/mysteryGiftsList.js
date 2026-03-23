const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors
} = require('discord.js');
const {formatDate} = require('../tools/date');
const {logInteraction} = require('../tools/log');
const {baseUrlOnlineServerAPI, onlineServerBearerToken} = require('../tools/settings');
const {getLanguage} = require('../tools/language');

async function mysteryGiftsList(interaction, client) {
    logInteraction('Mystery gifts command', interaction, client, true);
    await interaction.deferReply({flags: MessageFlags.Ephemeral});

    const lang = getLanguage(interaction);
    const labels = {
        en: {
            noGifts: '🎁 No Mystery Gifts available at the moment.',
            viewContents: '🎒 View contents',
            permanent: '📅 Permanent',
            error: '❌ Could not retrieve the Mystery Gift list at this time.',
            claim: '*Claim in-game*'
        },
        fr: {
            noGifts: '🎁 Aucun cadeau mystère disponible pour le moment.',
            viewContents: '🎒 Voir le contenu',
            permanent: '📅 Permanent',
            error: '❌ Impossible de récupérer la liste des cadeaux mystères pour le moment.',
            claim: '*Récupérer en jeu*'
        }
    };
    const t = labels[lang];

    try {
        const response = await fetch(`${baseUrlOnlineServerAPI}/gift?lang=${lang}`, {
            headers: {authorization: onlineServerBearerToken}
        });
        const data = await response.json();

        let gifts = data.gifts || [];

        const now = new Date();
        gifts = gifts.map(gift => {
            const hasDates = gift.validFrom && gift.validTo;
            const isActive =
                (hasDates && now >= new Date(gift.validFrom) && now <= new Date(gift.validTo)) ||
                gift.alwaysAvailable;
            return {...gift, isActive, hasDates};
        });

        const onlyActive = !interaction.options?.getString('show_all') === "yes" ?? true;
        const type = interaction.options?.getString('type') || 'all';

        if (type === 'code') {
            gifts = gifts.filter(gift => gift.type === 'code');
        } else if (type === 'internet') {
            gifts = gifts.filter(gift => gift.type === 'internet');
        }

        if (onlyActive) {
            gifts = gifts.filter(gift => gift.isActive);
        }

        gifts.sort((a, b) => {
            if (a.isActive && b.isActive) {
                if (a.validTo && b.validTo) return new Date(a.validTo) - new Date(b.validTo);
                return 0;
            }
            if (!a.isActive && !b.isActive) {
                if (a.validTo && b.validTo) return new Date(b.validTo) - new Date(a.validTo);
                return 0;
            }
            return a.isActive ? -1 : 1;
        });

        gifts = gifts.slice(0, 5);

        if (gifts.length === 0)
            return interaction.editReply({content: t.noGifts});

        const containers = gifts.map((gift) => {
            const color = gift.isActive ? Colors.Green : Colors.Red;
            const dateInfo = gift.hasDates
                ? `📅 ${formatDate(gift.validFrom)} → ${formatDate(gift.validTo)}`
                : t.permanent;

            const container = new ContainerBuilder()
                .setAccentColor(color);

            container.addTextDisplayComponents(
                new TextDisplayBuilder({content: `🎁 **${gift.title}**`}),
                new TextDisplayBuilder({content: `➡️ Code: **${gift.code || t.claim}**`}),
                new TextDisplayBuilder({content: dateInfo})
            );

            container.setButtonAccessory(
                new ButtonBuilder()
                    .setLabel(t.viewContents)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`gift_show_${gift.id}&lang=${lang}`)
            );

            return container;
        });

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: containers,
        });

    } catch (error) {
        console.error('Error while fetching gifts:', error);
        await interaction.editReply({
            content: t.error
        });
    }
}

module.exports = {mysteryGiftsList};

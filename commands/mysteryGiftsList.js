const axios = require('axios');
const {
    MessageFlags,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors
} = require('discord.js');
const {formatDate} = require('../tools/date');
const {logInteraction} = require('../tools/log');
const {baseUrlOnlineServerAPI, onlineServerBearerToken} = require('../tools/settings');

async function mysteryGiftsList(interaction, client) {
    logInteraction('Mystery gifts command', interaction, client, true);
    await interaction.deferReply({flags: MessageFlags.ephemeral});

    try {
        const response = await axios.get(`${baseUrlOnlineServerAPI}/gift`, {
            headers: {authorization: onlineServerBearerToken}
        });

        if (!response.data.success) throw new Error('API response indicates failure');

        let gifts = response.data.gifts || [];

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
            return interaction.editReply({content: '🎁 Aucun Mystery Gift disponible pour le moment.'});

        const containers = gifts.map((gift) => {
            const color = gift.isActive ? Colors.Green : Colors.Red;
            const dateInfo = gift.hasDates
                ? `📅 ${formatDate(gift.validFrom)} → ${formatDate(gift.validTo)}`
                : '📅 Permanente';

            const container = new ContainerBuilder()
                .setAccentColor(color);

            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder({content: `🎁 **${gift.title}**`}),
                    new TextDisplayBuilder({content: `➡️ Code : **${gift.code || '*À récupérer dans le jeu*'}**`}),
                    new TextDisplayBuilder({content: dateInfo})
                )
                .setButtonAccessory(
                    new ButtonBuilder()
                        .setLabel('🎒 Voir le contenu')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`gift_show_${gift.id}`)
                );

            container.addSectionComponents(section);
            return container;
        });

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: containers,
        });

    } catch (error) {
        console.error('Error while fetching gifts:', error);
        await interaction.editReply({
            content: '❌ Impossible de récupérer la liste des Mystery Gifts pour le moment.'
        });
    }
}

module.exports = {mysteryGiftsList};

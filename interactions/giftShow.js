const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    Colors
} = require('discord.js');
const { formatDate } = require('../tools/date');
const { baseUrlOnlineServerAPI, onlineServerBearerToken } = require('../tools/settings');

async function handleGiftShow(interaction) {
    const customId = interaction.customId;
    const giftId = customId.split('&')[0].replace('gift_show_', '');
    const lang = customId.includes('lang=') ? customId.split('lang=')[1].split('&')[0] : 'en';

    await interaction.deferReply({ flags: MessageFlags.Ephemeral});

    const labels = {
        en: {
            unable: '⚠️ Unable to retrieve this gift.',
            permanent: '📅 Permanent',
            items: 'Items',
            item: 'Item',
            pokemon: 'Pokémon',
            noItems: 'No items',
            noPokemon: 'No Pokémon',
            code: 'Code',
            claim: '*Claim in-game*',
            error: '❌ Could not retrieve this gift at this time.'
        },
        fr: {
            unable: '⚠️ Impossible de récupérer ce cadeau.',
            permanent: '📅 Permanent',
            items: 'Objets',
            item: 'Objet',
            pokemon: 'Pokémon',
            noItems: 'Aucun objet',
            noPokemon: 'Aucun Pokémon',
            code: 'Code',
            claim: '*Récupérer en jeu*',
            error: '❌ Impossible de récupérer ce cadeau pour le moment.'
        }
    };
    const t = labels[lang];

    try {
        const response = await fetch(`${baseUrlOnlineServerAPI}/gift/${giftId}?lang=${lang}`, {
            headers: { authorization: onlineServerBearerToken }
        });
        const data = await response.json();

        if (!data.success || !data.gift)
            return interaction.editReply({ content: t.unable });

        const gift = data.gift;

        const now = new Date();
        const hasDates = gift.validFrom && gift.validTo;
        const isActive =
            (hasDates && now >= new Date(gift.validFrom) && now <= new Date(gift.validTo)) ||
            gift.alwaysAvailable;

        const color = isActive ? Colors.Green : Colors.Red;

        const container = new ContainerBuilder().setAccentColor(color);

        const dateInfo = hasDates
            ? `📅 ${formatDate(gift.validFrom)} → ${formatDate(gift.validTo)}`
            : t.permanent;

        container.addTextDisplayComponents(
            new TextDisplayBuilder({ content: `🎁 **${gift.title}**` }),
            new TextDisplayBuilder({ content: `➡️ **${t.code}:** ${gift.code || t.claim}` }),
            new TextDisplayBuilder({ content: dateInfo }),
            new TextDisplayBuilder({
                content: gift.items?.length
                    ? `**${gift.items.length > 1 ? t.items : t.item}:**\n${gift.items.map(i => `- ${i.id} × ${i.count}`).join('\n')}`
                    : t.noItems,
            }),
            new TextDisplayBuilder({
                content: gift.creatures?.length
                    ? `**${t.pokemon}:**\n${gift.creatures.map(c => `- ${c.id} (Lv. ${c.level})${c.shiny ? ' ✨' : ''}`).join('\n')}`
                    : t.noPokemon,
            })
        );

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });
    } catch (error) {
        console.error('Error fetching gift:', error);
        await interaction.editReply({ content: t.error });
    }
}

module.exports = { handleGiftShow };

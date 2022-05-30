const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Envoyer un message dans un embed (intégration)")
        .addStringOption(option => option.setName('titre').setDescription("Le titre de l’embed").setRequired(true))
        .addStringOption(option => option.setName('couleur').setDescription("La couleur de l’embed").setRequired(true).addChoice("DEFAULT", "DEFAULT").addChoice("AQUA", "AQUA").addChoice("DARK_AQUA", "DARK_AQUA").addChoice("GREEN", "GREEN").addChoice("DARK_GREEN", "DARK_GREEN").addChoice("BLUE", "BLUE").addChoice("DARK_BLUE", "DARK_BLUE").addChoice("PURPLE", "PURPLE").addChoice("DARK_PURPLE", "DARK_PURPLE").addChoice("LUMINOUS_VIVID_PINK", "LUMINOUS_VIVID_PINK").addChoice("DARK_VIVID_PINK", "DARK_VIVID_PINK").addChoice("GOLD", "GOLD").addChoice("DARK_GOLD", "DARK_GOLD").addChoice("ORANGE", "ORANGE").addChoice("DARK_ORANGE", "DARK_ORANGE").addChoice("RED", "RED").addChoice("DARK_RED", "DARK_RED").addChoice("NAVY", "NAVY").addChoice("YELLOW", "YELLOW").addChoice("WHITE", "WHITE").addChoice("BLURPLE", "BLURPLE").addChoice("DARK_BUT_NOT_BLACK", "DARK_BUT_NOT_BLACK").addChoice("FUSCHIA", "FUSCHIA").addChoice("BLACK", "BLACK").addChoice("RANDOM", "RANDOM"))
        .addStringOption(option => option.setName('description').setDescription("Message principal de l’embed"))
        .addStringOption(option => option.setName('image').setDescription("L’URL de l’image qui s’affichera sur le côté")),
    async execute(interaction) {
        
        const color = interaction.options.get('couleur').value;
        const title = interaction.options.getString('titre')?.substring(0,256);
        const description = interaction.options.getString('description')?.substring(0,3000);
        const thumbnail = interaction.options.getString('image');

        var embedToSend = new MessageEmbed().setColor(color).setTitle(title);

        if (description) {
            embedToSend.setDescription(description);
        }

        if (thumbnail) {
            embedToSend.setThumbnail(thumbnail);
        }
        
        interaction.reply({content: "<:NitsuGreenTickRound:977520117216862239> Message envoyé", ephemeral: true});
        sendwebhook(interaction.channel,interaction.member.displayName,interaction.member.displayAvatarURL(),"\u200b",embedToSend);
    },
};


async function sendwebhook(channel,username,avatarURL,content,embed) {
    try {
        const webhooks = await channel.fetchWebhooks();
        var webhookfound = webhooks.find(wh => wh.name === "Nitsubot Auto-Mod");

        if (!webhookfound) {
            channel.createWebhook('Nitsubot Auto-Mod', {
                avatar: "https://i.imgur.com/blr9Osz.png",
            })
                .then(webhook => {
                    webhook.send({
                        content: content,
                        username: username,
                        avatarURL: avatarURL,
                        embeds: [embed],
                    });
                });
        } else {
            webhookfound.send({
                content: content,
                username: username,
                avatarURL: avatarURL,
                embeds: [embed],
            });
        }
    } catch (error) {
        const embederr = new MessageEmbed().setColor("RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Une erreur est survenue : impossible de renvoyer le message`);
        channel.send({embeds: [embederr]});
    }
}
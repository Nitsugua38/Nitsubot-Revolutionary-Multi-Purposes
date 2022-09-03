const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Envoyer un message dans un embed (intégration)")
        .addStringOption(option => option.setName('couleur').setDescription("La couleur de l’embed").setRequired(true).addChoice("Aucune", "DEFAULT").addChoice("Aqua", "AQUA").addChoice("Aqua foncé", "DARK_AQUA").addChoice("Vert", "GREEN").addChoice("Vert foncé", "DARK_GREEN").addChoice("Bleu", "BLUE").addChoice("Bleu foncé", "DARK_BLUE").addChoice("Violet", "PURPLE").addChoice("Violet foncé", "DARK_PURPLE").addChoice("Rose clair", "LUMINOUS_VIVID_PINK").addChoice("Rose foncé", "DARK_VIVID_PINK").addChoice("Or", "GOLD").addChoice("Or foncé", "DARK_GOLD").addChoice("Orange", "ORANGE").addChoice("Orange foncé", "DARK_ORANGE").addChoice("Rouge", "RED").addChoice("Rouge foncé", "DARK_RED").addChoice("Bleu marine", "NAVY").addChoice("Jaune", "YELLOW").addChoice("Blanc", "WHITE").addChoice("Bleu Discord", "BLURPLE").addChoice("Gris très foncé", "DARK_BUT_NOT_BLACK").addChoice("Fuchsia", "FUCHSIA").addChoice("Noir", "BLACK").addChoice("🎲 Aléatoire", "RANDOM"))
        .addStringOption(option => option.setName('titre').setDescription("Le titre de l’embed"))
        .addStringOption(option => option.setName('description').setDescription("Message principal de l’embed. Écrivez <> pour retourner à la ligne suivante."))
        .addStringOption(option => option.setName('miniature').setDescription("L’URL de la miniature"))
        .addStringOption(option => option.setName('image').setDescription("L’URL de l’image"))
        .addStringOption(option => option.setName('footer').setDescription("Le texte au pied de l’embed"))
        .addStringOption(option => option.setName('icone-footer').setDescription("L’URL de l’icone du pied de l’embed")),
    async execute(interaction) {
        
        const color = interaction.options.get('couleur').value;
        const title = interaction.options.getString('titre')?.substring(0,256);
        const description = interaction.options.getString('description')?.substring(0,4000)?.replace(new RegExp("<>","g"), "\n");
        const footer =  interaction.options.getString('footer')?.replace("Nitsubot", "")?.replace("NitsuBot", "")?.replace("nitsubot", "")?.replace("nitsuBot", "")?.replace("Annonce officiel", "")?.replace("annonce officiel", "")?.replace("Annonce Officiel", "")?.replace("annonce Officiel", "");
        
        var thumbnail, image, footerIcon;

        if (isValidHttpUrl(interaction.options.getString('miniature'))) thumbnail = interaction.options.getString('miniature');
        if (isValidHttpUrl(interaction.options.getString('image'))) image = interaction.options.getString('image');
        if (isValidHttpUrl(interaction.options.getString('icone-footer'))) footerIcon = interaction.options.getString('icone-footer');


        if (!image && !title && !description) return interaction.reply({embeds: [new MessageEmbed().setDescription("<:NitsuRedTickRound:977520171734401054> Vous devez au moins spécifier soit un titre, soit une description, soit une image !").setColor("DARK_RED")]})

        var embedToSend = {
            color: color,
            title: title ? title : null,
            description: description ? description : null,
            thumbnail: thumbnail ? { url: thumbnail } : null,
            image: image ? { url: image } : null,
            footer: footer ? { text: footer, icon_url: footerIcon } : null,
        };

        
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

function isValidHttpUrl(string) {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }
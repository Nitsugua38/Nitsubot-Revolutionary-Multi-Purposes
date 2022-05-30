const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche la liste des commandes ainsi que leur usage"),
    async execute(interaction) {
        const embedhome = new MessageEmbed()
            .setColor("GOLD")
            .setTitle("Aide de NitsuBot - Accueil")
            .setThumbnail("https://i.imgur.com/4MfQgrk.png")
            .setTimestamp()
            .setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'})
            .setDescription("Bienvenue sur la page d’aide de NitsuBot. Utilisez le menu ci-dessous pour naviguer entre les différent groupes de commandes.")
            .addFields(
                {name: "/ping", value: "Obtenir le temps de réponse du bot"},
                {name: "Liens utiles", value: "[Inviter le bot](https://discord.com/oauth2/authorize?client_id=919251061066317896&permissions=8&scope=bot%20applications.commands) \n[Serveur Support & Communauté](https://discord.gg/ZQVpjMZJqp) \n[Statut du bot](https://nitsubot-rmp.statuspage.io/) \n[Projet GitHub](https://github.com/Nitsugua38/Nitsubot-Revolutionary-Multi-Purposes)"}
            );
        
            const rowhelp = new MessageActionRow()
                .addComponents(new MessageSelectMenu()
                    .setCustomId("helpmenu")
                    .addOptions([
                        {
                            label: "Accueil",
                            description: "Informations utiles sur le bot",
                            value: "helpselecthome",
                            default: true,
                            emoji: "<:NitsuHome:979311763411587082>"
                        },
                        {
                            label: "Informations & Utilitaires",
                            description: "Commandes pour obtenir des informations sur qcch, ou autres trucs pratiques",
                            value: "helpselectinfo",
                            emoji: "<:NitsuInfo:979488492646170624>"
                        },
                        {
                            label: "Modération",
                            description: "Commandes pour la modération et l’auto-mod",
                            value: "helpselectmod",
                            emoji: "<:NitsuMod:979313073380810752>"
                        },
                        {
                            label: "Musique / Vocal",
                            description: "Commandes relatives à l’écoute de musique et d’autres fonctionnalités vocales",
                            value: "helpselectmusic",
                            emoji: "<:NitsuMusic:979312004009435156>"
                        },
                        {
                            label: "Contact / Ticket",
                            description: "Commandes pour contacter les membres ou gérer les tickets",
                            value: "helpselectcontact",
                            emoji: "<:NitsuMessage:979312588099829770>"
                        },
                        {
                            label: "Configuration du bot",
                            description: "Personnaliser le bot et gérer ses fonctionnalités",
                            value: "helpselectconfig",
                            emoji: "<:NitsuConfig:979312242480791562>"
                        },
                        {
                            label: "Fermer",
                            description: "Quitter le menu d’aide",
                            value: "helpselectclose",
                            emoji: "<:NitsuRedTickRound:977520171734401054>"
                        }
                    ])
                );

        interaction.reply({embeds: [embedhome], components: [rowhelp]});
    },
};
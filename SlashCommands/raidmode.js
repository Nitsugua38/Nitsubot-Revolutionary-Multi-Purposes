const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
const { Tags } = require("../index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("raidmode")
        .setDescription("Supprime toutes les invitations et empêche la création de nouvelles invitations")
        .addStringOption(option => option.setName('confirmation').setDescription("Veuillez taper `activer` ou `désactiver` pour confirmer l’action !").setRequired(true)),
    async execute(interaction) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const choice = interaction.options.getString("confirmation");
            if (choice === "activer") {
                var tagcheck = await Tags.findOne({ where: { guildid: interaction.guild.id } })
                if (tagcheck) {
                    Tags.update({raidmode: true}, { where: { guildid: interaction.guild.id } });
                    interaction.guild.invites.fetch().then(invites => {invites.each(i => i.delete())});

                    const embeddone = new MessageEmbed().setTitle(":exclamation: Mode Raid activé").setDescription("Toutes les invitations ont été supprimées et toute nouvelle invitation sera supprimée !").setColor("RED").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
                    interaction.reply({embeds: [embeddone]});
                } else {
                    const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Impossible d’activer le mode raid").setDescription("Il manque une étape ! Personnalisez le bot d’abord la commande `/setup` !");
                    interaction.reply({embeds: [embedNotConfig]});
                }
            }
            else {
                var tagcheck = await Tags.findOne({ where: { guildid: interaction.guild.id } })
                if (tagcheck) {
                    Tags.update({raidmode: false}, { where: { guildid: interaction.guild.id } });
                    const embeddone = new MessageEmbed().setTitle("<:NitsuGreenTickRound:977520117216862239> Mode Raid désactivé").setDescription("Tout le monde peut de nouveau créer des invitations").setColor("GREEN").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
                    interaction.reply({embeds: [embeddone]})
                } else {
                    const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Impossible d’activer le mode raid").setDescription("Il manque une étape ! Personnalisez le bot d’abord la commande `/setup` !");
                    interaction.reply({embeds: [embedNotConfig]});
                }
            }
        
        } else {
            const embedcantkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Permission manquante").setDescription("Administrateur").setColor("DARK_RED");
            interaction.reply({embeds: [embedcantkick]});
        };
        
        
    },
};

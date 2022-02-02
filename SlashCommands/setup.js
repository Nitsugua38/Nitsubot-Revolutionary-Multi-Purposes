const { SlashCommandBuilder } = require("@discordjs/builders");
const { Tags } = require("../index.js");
const { Permissions, MessageEmbed } = require("discord.js");



module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Initialise la base de données du bot"),
    async execute(interaction) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
            const guildID = interaction.guild.id;
            const tagtoinit = await Tags.findOne({ where: { guildid: guildID } });
            if (tagtoinit) {
                await Tags.destroy({ where: { guildid: guildID } });
            }
            try {
                const tag = await Tags.create({
                    guildid: guildID,
                });
                const embed = new MessageEmbed().setColor("#00FF00").setTitle(":white_check_mark: La base de données du bot a correctement été initialisée (ou réinitialisée si elle était déjà configurée :warning:)").setDescription("Utilisez `/config ...` pour définir :").addFields({name: "tempchannel", value: "Définir la catégorie où créer les Temp Channels", inline: true},{name: "replies", value: "Définir le salon où arriveront les réponses des messages à informations contrôlées (envoyés avec `/msg`)", inline: true},{name: "contact", value: "Définir le salon où arriveront les Tickets (commande à faire dans le salon où s’affichera le bouton à destination des membres pour contacter le staff)", inline: true},).setThumbnail("https://i.imgur.com/XkofZJ7.png").setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                return interaction.reply({embeds: [embed]});
            } catch (error) {
                return interaction.reply(":x: Une erreur est survenue. Veuillez rééssayer.")
            }
        } else {interaction.reply(":negative_squared_cross_mark: Vous ne pouvez pas initialiser la base de données du bot car vous n’avez pas la permission de gérer les salons !");}
    },
};
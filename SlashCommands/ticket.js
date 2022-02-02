const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Configure les tickets : un moyen simple et sécurisé de contacter le staff d’un serveur")
        .addRoleOption(option => option
            .setName("staffrole")
            .setDescription("Le rôle minimum requis pour voir les tickets créés par les membres. Ex : rôle @Staff")
            .setRequired(true))
        .addStringOption(option => option
            .setName("nom")
            .setDescription("Le nom du ticket")
            .setRequired(true))
        .addStringOption(option => option
            .setName("message")
            .setDescription("Le message à afficher au dessus du bouton permettant de créer un ticket")
            .setRequired(true)),
    async execute(interaction) {
        if (!interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return interaction.reply(":negative_squared_cross_mark: Vous n’avez pas la permission de gérer les salons !");
        const embedtosend = new MessageEmbed().setColor("BLUE").setTitle(`${interaction.options.get("nom").value}`).setDescription(`${interaction.options.get("message").value}`).setThumbnail("https://i.imgur.com/iwCQOeh.png").setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
        const sendrow = new MessageActionRow().addComponents(new MessageButton().setCustomId(`ticketroleis${interaction.options.getRole("staffrole").id}`).setLabel("Créer un ticket").setStyle("PRIMARY").setEmoji("🎫"));
        interaction.reply({ embeds: [embedtosend], components: [sendrow] });
    },
};
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("Affiche les informations sur l’utilisateur")
        .addUserOption(option => option.setName('cible').setDescription("L’utilisateur à afficher les options")),
    async execute(interaction) {
        interaction.reply("Fonctionnalité à venir");
    },
};
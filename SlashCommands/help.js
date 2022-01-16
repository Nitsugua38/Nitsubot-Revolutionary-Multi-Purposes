const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche la liste des commandes ainsi que leur usage"),
    async execute(interaction) {
        interaction.reply("Fonctionnalité à venir");
    },
};
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Réponds par pong!"),
    async execute(interaction) {
        interaction.reply('Pong!');
    },
};
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { client } = require("..");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Réponds par pong!"),
    async execute(interaction) {
        const embed = new MessageEmbed().setColor("RANDOM").setTitle("Pong !").setDescription(`:ping_pong: Le temps de réaction du bot est de ${Date.now() - interaction.createdTimestamp}ms. La latence de l’API de Discord est de ${Math.round(client.ws.ping)}ms`).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
        interaction.reply({embeds: [embed]});
    },
};
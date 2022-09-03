const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("react")
        .setDescription("Fais réagir le bot au dernier message envoyé")
        .addStringOption(option => option.setName("emoji").setDescription("L’émoji avec lequel réagir").setRequired(true)),
    async execute(interaction) {
        const emoji = interaction.options.getString("emoji");

        interaction.channel.messages.fetch({limit :1}).then(messages => {
            let lastMessageSent = messages.first();
            lastMessageSent.react(emoji)
            .then(() => {
                const embedOk = new MessageEmbed().setColor("GREEN").setDescription("<:NitsuGreenTickRound:977520117216862239> Réaction ajoutée !")
                interaction.reply({embeds: [embedOk], ephemeral: true})
            })
                .catch(error => {
                    const embedError = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Veuillez entrer un émoji valide !")
                    interaction.reply({embeds: [embedError], ephemeral: true})
                });
        
        })
    },
};
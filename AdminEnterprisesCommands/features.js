const { TagsEnterprisesGuilds } = require("../index.js");
const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js")

module.exports = {
    EnterprisesCmdName: "features",
    async exec(interaction) {
        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Configuration du système d’enterprises").setDescription("Cliquez pour activer/désactiver");
        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton().setLabel("Système d’entreprise").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("ENdisableEnterprises")
            );
            
            const guildID = interaction.guild.id;
            const tag = await TagsEnterprisesGuilds.findOne({ where: { guildId: guildID } });
            
            if (!tag?.features?.startsWith("on")) {
                row1.components[0].setEmoji("<:NitsuSwitchOff:984398007002878014>"); row1.components[0].customId = "ENenableEnterprises";
            }
            interaction.reply({ components: [row1], embeds: [embed] });
    }
}
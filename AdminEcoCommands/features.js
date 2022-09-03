const { TagsEconomyGuilds } = require("../index.js");
const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js")

module.exports = {
    EcoCmdName: "features",
    async exec(interaction) {
        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Configuration du système d’économie").setDescription("Cliquez sur les boutons pour activer/désactiver les fonctionnalités");
        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton().setLabel("Système d’économie").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disableEconomy")
            );
        const row2 = new MessageActionRow()
            .addComponents(
                new MessageButton().setLabel("Commande Work").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl1"),
                new MessageButton().setLabel("Commande Crime").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl2"),
                new MessageButton().setLabel("Commande Rob").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl3"),
                new MessageButton().setLabel("Commande Roulette (à venir)").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl4"),
                new MessageButton().setLabel("Commande Pile ou Face").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl5")
            );
        const row3 = new MessageActionRow()
            .addComponents(
                new MessageButton().setLabel("Marché des actions (Bourse)").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl6"),
                new MessageButton().setLabel("Achat de Bitcoin").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl7")
            );  

            
            const guildID = interaction.guild.id;
            const tag = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
            
            if (!tag?.features?.startsWith("on")) {
                row1.components[0].setEmoji("<:NitsuSwitchOff:984398007002878014>"); row1.components[0].customId = "enableEconomy";
                row2.components.forEach(component => {
                    component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.disabled = true;                            
                });
                row3.components.forEach(component => {
                    component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.disabled = true;                            
                });
                
            
            } else {
                let features = tag.features.split(",");
                
                row2.components.forEach(component => {
                    if (features[component.customId.substring(6)] === "off") {  component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.customId = `enable${component.customId.substring(6)}`;}                         
                });
                row3.components.forEach(component => {
                    if (features[component.customId.substring(6)] === "off") {  component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.customId = `enable${component.customId.substring(6)}`;}                         
                });
            }


            interaction.reply({ components: [row1, row2, row3], embeds: [embed] });
    }
}
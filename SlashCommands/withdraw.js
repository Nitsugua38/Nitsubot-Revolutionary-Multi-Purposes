const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Retirer du cash depuis la banque")
        .addStringOption(option => option.setName('montant').setDescription("Montant à retirer ou `all`")),
    async execute(interaction) {
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");

        var amount = parseInt(interaction.options.getString("montant")) || "all";

        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
    
        
        if (tag) {
            if (tag2?.features?.startsWith("on")) {
                
                if (amount === "all") { amount = parseInt(tag.money.split(",")[1]) };

                const embedNeg = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Action impossible").setDescription(`Veuillez entrer un entier positif valide !`);
                if (isNeg(amount)) return interaction.reply({embeds: [embedNeg]});

                if ( amount <= parseInt(tag.money.split(",")[1]) ) {
                    await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + amount},${parseInt(tag.money.split(",")[1]) - amount}`}, { where: { GUID: GUID } });
                    tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });

                    const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Argent retiré").setDescription(`<:NitsuCoin:984446683284910080> ${amount} ont été retirés en cash ! \n\n<:NitsuWallet:985835008088481802> **Cash actuel :** <:NitsuCoin:984446683284910080> ${tag.money.split(",")[0]}`);
                    interaction.reply({embeds: [embed]});
                
                } else {
                    const embed = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Action impossible").setDescription(`Vous essayez de retirer plus d’argent que vous n’en avez !`);
                    interaction.reply({embeds: [embed]});
                }

            } else {
                interaction.reply({embeds: [embedNotConfig]});
            }
        } else {
            const embed = new MessageEmbed().setColor("GOLD").setTitle(`<:NitsuRedTickRound:977520171734401054> Action impossible`).setDescription("Vous n’avez pas d’argent !");
            interaction.reply({embeds: [embed]});
        }

    },
};


function isNeg(x) {
    if (x !== Math.abs(x)) return true
    else return false
}
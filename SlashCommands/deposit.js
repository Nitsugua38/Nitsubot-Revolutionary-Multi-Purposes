const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Déposer de l’argent à la banque")
        .addStringOption(option => option.setName('montant').setDescription("Montant à déposer ou `all`")),
    async execute(interaction) {
    
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");


        var amount = parseInt(interaction.options.getString("montant")) || "all";

        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
    
        
        if (tag) {
            if (tag2?.features?.startsWith("on")) {
                
                if (amount === "all") { amount = parseInt(tag.money.split(",")[0]) };

                const embedNeg = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Action impossible").setDescription(`Vous essayez de déposer plus de cash que vous n’en avez !`);
                if (isNeg(amount)) return interaction.reply({embeds: [embedNeg]});

                if ( ( (amount + parseInt(tag.money.split(",")[1]) <= tag2.maxBank) || tag2.maxBank === -1) && (amount <= parseInt(tag.money.split(",")[0])) ) {
                    await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) - amount},${parseInt(tag.money.split(",")[1]) + amount}`}, { where: { GUID: GUID } });
                    tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });

                    const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Argent déposé").setDescription(`<:NitsuCoin:984446683284910080> ${amount} ont été déposés dans votre banque ! \n\n<:NitsuBank:985835845095399464> **Banque actuelle :** <:NitsuCoin:984446683284910080> ${tag.money.split(",")[1]}`);
                    interaction.reply({embeds: [embed]});
                
                } else {
                    const embed = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Action impossible").setDescription(`Soit vous essayez de déposer plus de cash que vous n’en avez, soit vous dépassez la limite de la banque du serveur ( <:NitsuCoin:984446683284910080> ${tag2.maxBank})`);
                    interaction.reply({embeds: [embed]});
                }

            } else {
                interaction.reply({embeds: [embedNotConfig]});
            }
        } else {
            const embed = new MessageEmbed().setColor("GOLD").setTitle(`<:NitsuRedTickRound:977520171734401054> Action impossible`).setDescription("Vous n’avez pas de cash !");
            interaction.reply({embeds: [embed]});
        }

    },
};


function isNeg(x) {
    if (x !== Math.abs(x)) return true
    else return false
}
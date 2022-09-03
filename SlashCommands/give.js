const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("give-money")
        .setDescription("Donner de l’argent, un objet ou un matériau à quelqu’un")
        .addIntegerOption(option => option.setName("montant").setDescription("Le montant à donner").setRequired(true))
        .addUserOption(option => option.setName('membre').setDescription("Le membre à qui donner").setRequired(true)),
    async execute(interaction) {
    
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");

        var TargetMember = interaction.options.getMember("membre");
        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;
        const TargetGUID = guildID + "-" + TargetMember.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });

            if (tag) {
                if (tag2?.features?.startsWith("on")) {

                    var montant = Math.abs(interaction.options.getInteger("montant"));

                    if ( (montant <= parseInt(tag.money.split(",")[0])) && !isNeg(parseInt(tag.money.split(",")[0])) ) {
                        
                        var tag3 = await TagsEconomyUsers.findOne({ where: { GUID: TargetGUID } });
                        if (!tag3) {
                            tag3 = await TagsEconomyUsers.create({ GUID: TargetGUID, });
                        }
                        
                        await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) - montant},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
                        await TagsEconomyUsers.update({money: `${parseInt(tag3.money.split(",")[0]) + montant},${parseInt(tag3.money.split(",")[1])}`}, { where: { GUID: TargetGUID } });
                        tag3 = await TagsEconomyUsers.findOne({ where: { GUID: TargetGUID } });
    
                        const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Transfert effectué").setDescription(`<:NitsuCoin:984446683284910080> ${montant} ont été transférés à **${TargetMember.displayName}** ! \n\n<:NitsuWallet:985835008088481802> **Son cash actuel :** <:NitsuCoin:984446683284910080> ${tag3.money.split(",")[0]}`);
                        interaction.reply({embeds: [embed]});


                    } else {
                        const embedtoR = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Action impossible").setDescription(`Vous essayez de donner plus de cash que vous n’en avez, essayez d’en retirer à la banque`);
                        interaction.reply({embeds: [embedtoR]});
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
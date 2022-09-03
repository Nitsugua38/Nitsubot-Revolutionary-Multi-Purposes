const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("money")
        .setDescription("Voir son argent")
        .addUserOption(option => option.setName('membre').setDescription("L’utilisateur dont qui afficher l’argent")),
    async execute(interaction) {
        var member = interaction.options.getMember("membre");
        if (!member) member = interaction.member;

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");

        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        
        if (!tag) {
            if (tag2?.features?.startsWith("on")) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});

                if (tag2.startingMoney) {
                    await TagsEconomyUsers.update({money: `${tag2.startingMoney},0`}, { where: { GUID: GUID } });
                }
                tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });


                const embed = new MessageEmbed().setColor("GOLD").setTitle(`Argent de ${member.displayName}`).addFields({name: "Cash", value: `<:NitsuCoin:984446683284910080> ${tag.money.split(",")[0]}`, inline: true},{name: "Banque", value: `<:NitsuCoin:984446683284910080> ${tag.money.split(",")[1]}`, inline: true},{name: "Total", value: `<:NitsuCoin:984446683284910080> ${parseInt(tag.money.split(",")[0]) + parseInt(tag.money.split(",")[1])}`, inline: true})
                interaction.reply({embeds: [embed]});
            } else {
                interaction.reply({embeds: [embedNotConfig]});
            }
        } else {
            const embed = new MessageEmbed().setColor("GOLD").setTitle(`Argent de ${member.displayName}`).addFields({name: "Cash", value: `<:NitsuCoin:984446683284910080> ${tag.money.split(",")[0]}`, inline: true},{name: "Banque", value: `<:NitsuCoin:984446683284910080> ${tag.money.split(",")[1]}`, inline: true},{name: "Total", value: `<:NitsuCoin:984446683284910080> ${parseInt(tag.money.split(",")[0]) + parseInt(tag.money.split(",")[1])}`, inline: true})
            interaction.reply({embeds: [embed]});
        }

    },
};
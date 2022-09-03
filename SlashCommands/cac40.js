const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js");



module.exports = {
    data: new SlashCommandBuilder()
        .setName("cac40")
        .setDescription("Acheter ou vendre des actions en bourse")
        .addStringOption(option => option.setName("action").setDescription("Quoi faire").setRequired(true).addChoice("📈 Voir le cours des actions et celles que vous possédez","view").addChoice("📥 Acheter des actions", "buy").addChoice("📤 Revendre des actions", "sell"))
        .addIntegerOption(option => option.setName("nombre").setDescription("Nombre d’actions à acheter ou revendre"))
        .addStringOption(option => option.setName("nom").setDescription("Nom de l’action à acheter ou vendre").addChoice("Carrefour", "0").addChoice("Airbus", "1").addChoice("Bouygues", "2").addChoice("Renault", "3").addChoice("TotalEnergies", "4").addChoice("Danone", "5").addChoice("LVMH", "6").addChoice("BNP Paribas", "7").addChoice("Engie", "8").addChoice("Michelin", "9")),
    async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embedDisabled = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Commande désactivée").setDescription("Cette commande est désactivée. Demandez à un modérateur de faire la commande `/admin-economy Fonctionnalités` !")
        const embedNameMissing = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Nom manquant").setDescription(`Vous n’avez pas spécifié le nom de la marque à qui acheter/vendre les action(s) !`);

        
        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        const tag3 = await TagsEconomyGuilds.findOne({ where: { guildId: "ADMIN" } });


        
        if (tag2?.features?.startsWith("on")) {
            if (!tag) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});
            }

            if (tag2.features.split(",")[6] === "off") return interaction.reply({embeds: [embedDisabled]});


            const action = interaction.options.get('action').value;

            if (action === "view") {
                const embed = new MessageEmbed().setColor("BLUE").setTitle("Cours des actions des entreprises du CAC 40").addFields(
                    {name: "Carrefour", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[0]}  |  Vous : ${tag.actions.split(",")[0]} <:NitsuCac40:984448948867575839>`, inline: true }, 
                    {name: "\u200B", value: "\u200B", inline: true}, 
                    {name: "Airbus", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[1]}  |  Vous : ${tag.actions.split(",")[1]} <:NitsuCac40:984448948867575839>`, inline: true }, 

                    {name: "Bouygues", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[2]}  |  Vous : ${tag.actions.split(",")[2]} <:NitsuCac40:984448948867575839>`, inline: true }, 
                    {name: "\u200B", value: "\u200B", inline: true}, 
                    {name: "Renault", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[3]}  |  Vous : ${tag.actions.split(",")[3]} <:NitsuCac40:984448948867575839>`, inline: true }, 

                    {name: "TotalEnergies", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[4]}  |  Vous : ${tag.actions.split(",")[4]} <:NitsuCac40:984448948867575839>`, inline: true }, 
                    {name: "\u200B", value: "\u200B", inline: true}, 
                    {name: "Danone", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[5]}  |  Vous : ${tag.actions.split(",")[5]} <:NitsuCac40:984448948867575839>`, inline: true }, 

                    {name: "LVMH", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[6]}  |  Vous : ${tag.actions.split(",")[6]} <:NitsuCac40:984448948867575839>`, inline: true }, 
                    {name: "\u200B", value: "\u200B", inline: true}, 
                    {name: "BNP Paribas", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[7]}  |  Vous : ${tag.actions.split(",")[7]} <:NitsuCac40:984448948867575839>`, inline: true }, 

                    {name: "Engie", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[8]}  |  Vous : ${tag.actions.split(",")[8]} <:NitsuCac40:984448948867575839>`, inline: true }, 
                    {name: "\u200B", value: "\u200B", inline: true}, 
                    {name: "Michelin", value: `<:NitsuCoin:984446683284910080> ${tag3.cac.split(",")[9]}  |  Vous : ${tag.actions.split(",")[9]} <:NitsuCac40:984448948867575839>`, inline: true }
                    )
                    .setFooter({text: "Les cours sont mis à jour à 9h et 19h", iconURL: "https://cdn.discordapp.com/emojis/984448948867575839.webp?size=256&quality=lossless"});
                interaction.reply({embeds: [embed]})
            }

            else if (action === "buy") {
                const number = Math.abs(interaction.options.getInteger("nombre")) || 1;
                
                var name = await interaction.options.get("nom")?.value;
                if (!name) return interaction.reply({embeds: [embedNameMissing]});
                name = parseInt(name);
                
                const price = number * parseInt(tag3.cac.split(",")[name]);
                
                var actions = tag.actions.split(",");


                if (parseInt(tag.money.split(",")[0]) >= price) {
                    
                    actions[name] = parseInt(actions[name]) + number;

                    await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) - price},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
                    await TagsEconomyUsers.update({actions: actions.toString()}, { where: { GUID: GUID } });

                    tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                    
                    const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Action(s) acheté(s)").setDescription(`Vous avez acheté ${number} action(s) pour <:NitsuCoin:984446683284910080> ${price} chez cette marque ! \n\n**Total actuel :** <:NitsuCac40:984448948867575839> ${tag.actions.split(",")[name]}`);
                    interaction.reply({embeds: [embed]});
                }
                else {
                    const embed = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Impossible").setDescription(`Vous n’avez pas assez de cash !`);
                    interaction.reply({embeds: [embed]});
                }
            }


            else if (action === "sell") {
                const number = Math.abs(interaction.options.getInteger("nombre")) || 1;
                
                var name = await interaction.options.get("nom")?.value;
                if (!name) return interaction.reply({embeds: [embedNameMissing]});
                name = parseInt(name);
                
                const price = number * parseInt(tag3.cac.split(",")[name]);
                
                var actions = tag.actions.split(",");


                if (parseInt(actions[name]) >= number) {
                    
                    actions[name] = parseInt(actions[name]) - number;

                    await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + price},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
                    await TagsEconomyUsers.update({actions: actions.toString()}, { where: { GUID: GUID } });

                    tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                    
                    const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Action(s) revendue(s)").setDescription(`Vous avez revendu ${number} action(s) pour <:NitsuCoin:984446683284910080> ${price} chez cette marque ! \n\n**Total actuel :** <:NitsuCac40:984448948867575839> ${tag.actions.split(",")[name]}`);
                    interaction.reply({embeds: [embed]});
                }
                else {
                    const embed = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Impossible").setDescription(`Vous essayez de vendre plus d’actions que vous n’en avez chez cette marque !`);
                    interaction.reply({embeds: [embed]});
                }
            }


        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
        

    },
};



function randomIntFromInterval(mina, maxa) { 
    return Math.floor(Math.random() * (maxa - mina + 1) + mina)
}
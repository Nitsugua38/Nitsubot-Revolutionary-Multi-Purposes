const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("bitcoin")
        .setDescription("Acheter ou vendre du Bitcoin")
        .addStringOption(option => option.setName("action").setDescription("Quoi faire").setRequired(true).addChoice("📉 Voir le cours du Bitcoin et ceux que vous possédez", "view").addChoice("📥 Acheter du Bitcoin", "buy").addChoice("📤 Revendre du Bitcoin", "sell"))
        .addIntegerOption(option => option.setName("nombre").setDescription("Nombre de Bitcoins à acheter ou revendre")),
    async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embedDisabled = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Commande désactivée").setDescription("Cette commande est désactivée. Demandez à un modérateur de faire la commande `/admin-economy Fonctionnalités` !")
        
        
        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        const tag3 = await TagsEconomyGuilds.findOne({ where: { guildId: "ADMIN" } });

        
        if (tag2?.features?.startsWith("on")) {
            if (!tag) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});
            }

            if (tag2.features.split(",")[7] === "off") return interaction.reply({embeds: [embedDisabled]});

            

            const action = interaction.options.get('action').value;

            if (action === "view") {
                const embed = new MessageEmbed().setColor("BLUE").setTitle("Cours de la valeur du Bitcoin").addFields(
                    { name: "1 Bitcoin", value: `<:NitsuCoin:984446683284910080> ${tag3.btc}`, inline: true }, {name: "Vous", value: `${tag.btc} <:NitsuBitcoin:984447744208953384>`, inline: true }
                    )
                    .setFooter({text: "Les cours sont mis à jour à 9h et 19h", iconURL: "https://cdn.discordapp.com/emojis/984447744208953384.webp?size=256&quality=lossless"});
                interaction.reply({embeds: [embed]})
            }

            else if (action === "buy") {
                const number = Math.abs(interaction.options.getInteger("nombre")) || 1;
                
                const price = number * parseInt(tag3.btc);
                
                var btcs = tag.btc


                if (parseInt(tag.money.split(",")[0]) >= price) {
                    
                    btcs = parseInt(btcs) + number;

                    await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) - price},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
                    await TagsEconomyUsers.update({btc: btcs}, { where: { GUID: GUID } });

                    tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                    
                    const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Bitcoin(s) acheté(s)").setDescription(`Vous avez acheté ${number} Bitcoin(s) pour <:NitsuCoin:984446683284910080> ${price} \n\n**Total actuel :** <:NitsuBitcoin:984447744208953384> ${tag.btc}`);
                    interaction.reply({embeds: [embed]});
                }
                else {
                    const embed = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Impossible").setDescription(`Vous n’avez pas assez de cash !`);
                    interaction.reply({embeds: [embed]});
                }
            }


            else if (action === "sell") {
                const number = Math.abs(interaction.options.getInteger("nombre")) || 1;
                
                const price = number * parseInt(tag3.btc);
                
                var btcs = tag.btc


                if (parseInt(tag.btc) >= number) {
                    
                    btcs = parseInt(btcs) - number;

                    await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + price},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
                    await TagsEconomyUsers.update({btc: btcs}, { where: { GUID: GUID } });

                    tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                    
                    const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Bitcoin(s) revendu(s)").setDescription(`Vous avez renvendu ${number} Bitcoin(s) pour <:NitsuCoin:984446683284910080> ${price} \n\n**Total actuel :** <:NitsuBitcoin:984447744208953384> ${tag.btc}`);
                    interaction.reply({embeds: [embed]});
                }
                else {
                    const embed = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Impossible").setDescription(`Vous essayez de revendre plus de Bitcoin que vous n’en avez !`);
                    interaction.reply({embeds: [embed]});
                }
            }
        



            
            /*

            await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + wonMontant},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
            const embed = new MessageEmbed().setColor("GREEN").setTitle(":pick: Travail").setDescription(`${text} <:NitsuCoin:984446683284910080> ${wonMontant}`);
            interaction.reply({embeds: [embed]});

            await TagsEconomyUsers.update({cooldowns: `${actualTime},${tag.cooldowns.split(",")[1]},${tag.cooldowns.split(",")[2]},${tag.cooldowns.split(",")[3]}`}, { where: { GUID: GUID } });
                
            */
        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
        

    },
};



function randomIntFromInterval(mina, maxa) { 
    return Math.floor(Math.random() * (maxa - mina + 1) + mina)
}
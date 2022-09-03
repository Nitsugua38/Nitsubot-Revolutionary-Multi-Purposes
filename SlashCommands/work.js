const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js");
const { WorkResponses } = require("../Responses/work-responses.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Effectuer un petit boulot pour gagner de l’argent"),
    async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embedDisabled = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Commande désactivée").setDescription("Cette commande est désactivée. Demandez à un modérateur de faire la commande `/admin-economy Fonctionnalités` !")
        
        
        const i = randomIntFromInterval(0,WorkResponses.length-1);
        var text = WorkResponses[i].text;
        var averageAmount = WorkResponses[i].averageAmount;

        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });


        
        if (tag2?.features?.startsWith("on")) {
            if (!tag) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});
            }

            if (tag2.features.split(",")[1] === "off") return interaction.reply({embeds: [embedDisabled]});

            
            
            
            
            const actualTime = Math.floor(interaction.createdTimestamp / 1000);
            const workDelay = parseInt(tag2.work.split(",")[2]) * 3600;
            const lastDid = parseInt(tag.cooldowns.split(",")[0]);


            const embedNotNow = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Pas si vite !").setDescription(`Vous ne pourrez travailler que <t:${lastDid + workDelay}:R>`);
            
            if ((lastDid + workDelay) > actualTime) return interaction.reply({embeds: [embedNotNow], ephemeral: true});




            var min = parseInt(tag2.work.split(",")[0]);
            var max = parseInt(tag2.work.split(",")[1]);

            let number = parseInt( (averageAmount/100)*(max-min)+min );
            const amount = parseInt( randomIntFromInterval( number-(0.1*(max-min)) , number+(0.1*(max-min)) ) );

            var wonMontant;

            if (amount < min) {
                wonMontant = amount + (min-amount);
            } else if (amount > max) { 
                wonMontant = amount - (amount-max);
            } else {
                wonMontant = amount;
            }

            if (isNaN(wonMontant)) return
            

            await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + wonMontant},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
            const embed = new MessageEmbed().setColor("GREEN").setTitle(":pick: Travail").setDescription(`${text} <:NitsuCoin:984446683284910080> ${wonMontant}`);
            interaction.reply({embeds: [embed]});

            await TagsEconomyUsers.update({cooldowns: `${actualTime},${tag.cooldowns.split(",")[1]},${tag.cooldowns.split(",")[2]},${tag.cooldowns.split(",")[3]}`}, { where: { GUID: GUID } });
                

        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
        

    },
};



function randomIntFromInterval(mina, maxa) { 
    return Math.floor(Math.random() * (maxa - mina + 1) + mina)
}
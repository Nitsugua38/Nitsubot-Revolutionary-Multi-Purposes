const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("rob")
        .setDescription("Tentez de voler de l’argent à un autre membre")
        .addUserOption(option => option.setName('membre').setDescription("Le membre à qui tenter de voler").setRequired(true)),
    async execute(interaction) {
    
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embedDisabled = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Commande désactivée").setDescription("Cette commande est désactivée. Demandez à un modérateur de faire la commande `/admin-economy Fonctionnalités` !")
        
        const target = interaction.options.getMember("membre");

        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;
        const TargetGUID = guildID + "-" + target.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        var tag3 = await TagsEconomyUsers.findOne({ where: { GUID: TargetGUID } });

        if (tag2?.features?.startsWith("on")) {
            if (!tag) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});
            }

            if (!tag3) {
                tag3 = await TagsEconomyUsers.create({ GUID: TargetGUID,});
            }

            
            if (tag2.features.split(",")[3] === "off") return interaction.reply({embeds: [embedDisabled]});

            
            
            
            const actualTime = Math.floor(interaction.createdTimestamp / 1000);
            const workDelay = parseInt(tag2.rob) * 3600;
            const lastDid = parseInt(tag.cooldowns.split(",")[2]);


            const embedNotNow = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Pas si vite !").setDescription(`Vous ne pourrez tenter de cambrioler que <t:${lastDid + workDelay}:R>`);
            
            if ((lastDid + workDelay) > actualTime) return interaction.reply({embeds: [embedNotNow], ephemeral: true});


            var wonMontant = 0;

            const will = randomIntFromInterval(1,5);
            
            if (will === 1 && !isNeg(parseInt(tag3.money.split(",")[0]))) {

                const percentage = randomIntFromInterval(1,8);
                wonMontant = parseInt((percentage / 100) * parseInt(tag3.money.split(",")[0]));

                if (isNaN(wonMontant)) return
                

                await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + wonMontant},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
                await TagsEconomyUsers.update({money: `${parseInt(tag3.money.split(",")[0]) - wonMontant},${parseInt(tag3.money.split(",")[1])}`}, { where: { GUID: TargetGUID } });
            }


            
            if (wonMontant === 0) {
                const embed = new MessageEmbed().setColor("RED").setTitle(":man_police_officer: Vol").setDescription(`Vous avez essayé de cambrioler ${target}, cependant, celui-ci se trouvait chez lui au même moment ! <:NitsuCoin:984446683284910080> 0`)
                interaction.reply({embeds: [embed]});
            } else {
                const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuThief:986256352022237224> Vol").setDescription(`Vous avez pénétré chez ${target} et y avez dérobé <:NitsuCoin:984446683284910080> ${wonMontant}`);
                interaction.reply({embeds: [embed]});
            }

            

            await TagsEconomyUsers.update({cooldowns: `${tag.cooldowns.split(",")[0]},${tag.cooldowns.split(",")[1]},${actualTime},${tag.cooldowns.split(",")[3]}`}, { where: { GUID: GUID } });
                

        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
        

    },
};



function randomIntFromInterval(mina, maxa) { 
    return Math.floor(Math.random() * (maxa - mina + 1) + mina)
}

function isNeg(x) {
    if (x !== Math.abs(x)) return true
    else return false
}
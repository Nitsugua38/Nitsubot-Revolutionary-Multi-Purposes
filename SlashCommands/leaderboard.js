const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Voir le classement selon l’argent, les actions en bourse ou les Bitcoins")
        .addStringOption(option => option.setName("tri").setDescription("Trier selon...").setRequired(true).addChoice("🪙 Argent total", "money").addChoice("📈 Actions en bourse", "actions").addChoice("💎 Bitcoin", "btc")),
    async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
                
        
        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });

        
        if (tag2?.features?.startsWith("on")) {
            if (!tag) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});
            }

            await interaction.deferReply();

            const store = await TagsEconomyUsers.findAll({ attributes: ['GUID'] });
            const tagString = store.map(t => t.GUID).join(`,`) || "Aucun membre n’a d’argent";
            
            if (tagString) {
                if (tagString !== 'Aucun membre n’a d’argent') {
                    const tagArray = tagString.split(",").filter(user => user.startsWith(guildID));
                    
                    var tagObj = [];

                    
                    for (const user of tagArray) {
                        let userInfos = await TagsEconomyUsers.findOne({ where: { GUID: user } }) 
                        tagObj.push(userInfos);
                    }


                    const action = interaction.options.get('tri').value;

                    if (action === "money") {
                        const sortedTagObj = tagObj.sort(compareMoney).reverse().slice(0, 10);
                        var description = "";
                        sortedTagObj.forEach((object, index) => {
                            description += `\`${index+1}\` - <@${object.GUID.split("-")[1]}> : <:NitsuCoin:984446683284910080> ${parseInt(object.money.split(",")[0]) + parseInt(object.money.split(",")[1])} \n`
                        });

                        const embed = new MessageEmbed().setColor("AQUA").setTitle("Classement par Argent").setDescription(description)
                        var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setDisabled(true).setCustomId("ECOleaderboard:money:0-10"), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId("ECOleaderboard:money:10-20"));

                        if (tagObj.length <= 10) row.components[1].disabled = true;
                        interaction.editReply({embeds: [embed], components: [row]});
                    }

                    else if (action === "actions") {
                        const sortedTagObj = tagObj.sort(compareActions).reverse().slice(0, 10);
                        var description = "";
                        sortedTagObj.forEach((object, index) => {
                            const arrA = object.actions.split(",");
                            var Na = 0;
                            arrA.forEach(number => Na += parseInt(number));
                            description += `\`${index+1}\` - <@${object.GUID.split("-")[1]}> : <:NitsuCac40:984448948867575839> ${Na} \n`
                        });

                        const embed = new MessageEmbed().setColor("AQUA").setTitle("Classement par Actions").setDescription(description)
                        const row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setDisabled(true).setCustomId("ECOleaderboard:actions:0-10"), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId("ECOleaderboard:actions:10-20"));

                        if (tagObj.length <= 10) row.components[1].disabled = true;
                        interaction.editReply({embeds: [embed], components: [row]});
                    }

                    else if (action === "btc") {
                        const sortedTagObj = tagObj.sort(compareBitcoin).reverse().slice(0, 10);
                        var description = "";
                        sortedTagObj.forEach((object, index) => {
                            description += `\`${index+1}\` - <@${object.GUID.split("-")[1]}> : <:NitsuBitcoin:984447744208953384> ${object.btc} \n`
                        });

                        const embed = new MessageEmbed().setColor("AQUA").setTitle("Classement par Bitcoin").setDescription(description)
                        const row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setDisabled(true).setCustomId("ECOleaderboard:btc:0-10"), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId("ECOleaderboard:btc:10-20"));

                        if (tagObj.length <= 10) row.components[1].disabled = true;
                        interaction.editReply({embeds: [embed], components: [row]});
                    }

                    
                   
                } else {
                    const embedError = new MessageEmbed().setColor("RED").setTitle("Classement").setDescription("Aucun membre n’a d’argent");
                    interaction.editReply({embeds: [embedError]});
                };

            } else {
                const embedError = new MessageEmbed().setColor("RED").setTitle("Non trouvé").setDescription("Une erreur est survenue");
                interaction.editReply({embeds: [embedError]});
            };

        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
        

    },
};




function compareMoney(a, b) {
    const Na = parseInt(a.money.split(",")[0]) + parseInt(a.money.split(",")[1]);
    const Nb = parseInt(b.money.split(",")[0]) + parseInt(b.money.split(",")[1]);
    return Na - Nb;
}

function compareActions(a, b) {
    const arrA = a.actions.split(",");
    const arrB = b.actions.split(",");
    var Na = 0;
    var Nb = 0;
    arrA.forEach(number => Na += parseInt(number));
    arrB.forEach(number => Nb += parseInt(number));
    return Na - Nb;
}

function compareBitcoin(a, b) {
    const Na = a.btc;
    const Nb = b.btc;
    return Na - Nb;
}
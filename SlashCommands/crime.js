const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")
const { CrimeResponses } = require("../Responses/crime-responses.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("crime")
        .setDescription("Commettre un crime pour avoir une chance de gagner de l’argent"),
    async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embedDisabled = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Commande désactivée").setDescription("Cette commande est désactivée. Demandez à un modérateur de faire la commande `/admin-economy Fonctionnalités` !")
        


        const i = randomIntFromInterval(0,CrimeResponses.length-1);
        var text = CrimeResponses[i].text;
        var averageAmount = CrimeResponses[i].averageAmount;

        
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });


        
        if (tag2?.features?.startsWith("on")) {
            if (!tag) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});
            }

            if (tag2.features.split(",")[2] === "off") return interaction.reply({embeds: [embedDisabled]});


            const actualTime = Math.floor(interaction.createdTimestamp / 1000);
            const workDelay = parseInt(tag2.crime.split(",")[2]) * 3600;
            const lastDid = parseInt(tag.cooldowns.split(",")[1]);


            const embedNotNow = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Pas si vite !").setDescription(`Vous pourrez commettre votre prochain crime <t:${lastDid + workDelay}:R>`);
            
            if ((lastDid + workDelay) > actualTime) return interaction.reply({embeds: [embedNotNow], ephemeral: true});


            
            var wonMontant;
            
            var min = parseInt(tag2.crime.split(",")[0]);
            var max = parseInt(tag2.crime.split(",")[1]);
            
            if (averageAmount != 0) {

                if (isNeg(min) && isNeg(max)) {
                    var min2 = Math.abs(max);
                    var max2 = Math.abs(min);
                    averageAmount = Math.abs(averageAmount);
    
                    let number = parseInt( (averageAmount/100)*(max2-min2)+min2 );
                    const amount = -parseInt( randomIntFromInterval( number-(0.1*(max2-min2)) , number+(0.1*(max2-min2)) ) );
        
                    
        
                    if (amount < min) {
                        wonMontant = amount + (min-amount);
                    } else if (amount > max) { 
                        wonMontant = amount - (amount-max);
                    } else {
                        wonMontant = amount;
                    }
                
                } else if (isNeg(min) && !isNeg(max)) {
                    
                    if (!isNeg(averageAmount)) {
                        var min2 = 1;
                        var max2 = max;

                        let number = parseInt( (averageAmount/100)*(max2-min2)+min2 );
                        const amount = parseInt( randomIntFromInterval( number-(0.1*(max2-min2)) , number+(0.1*(max2-min2)) ) );
            
                        if (amount < min) {
                            wonMontant = amount + (min-amount);
                        } else if (amount > max) { 
                            wonMontant = amount - (amount-max);
                        } else {
                            wonMontant = amount;
                        }
                    } else {
                        var min2 = 1;
                        var max2 = Math.abs(min);
                        averageAmount = Math.abs(averageAmount);

                        let number = parseInt( (averageAmount/100)*(max2-min2)+min2 );
                        const amount = -parseInt( randomIntFromInterval( number-(0.1*(max2-min2)) , number+(0.1*(max2-min2)) ) );
            
                        if (amount < min) {
                            wonMontant = amount + (min-amount);
                        } else if (amount > max) { 
                            wonMontant = amount - (amount-max);
                        } else {
                            wonMontant = amount;
                        }
                    }

                } else {
                    averageAmount = Math.abs(averageAmount);
    
                    let number = parseInt( (averageAmount/100)*(max-min)+min );
                    const amount = parseInt( randomIntFromInterval( number-(0.1*(max-min)) , number+(0.1*(max-min)) ) );
        
                    if (amount < min) {
                        wonMontant = amount + (min-amount);
                    } else if (amount > max) { 
                        wonMontant = amount - (amount-max);
                    } else {
                        wonMontant = amount;
                    }   
                }

            } else {
                wonMontant = 0;
            }

            
            if (isNaN(wonMontant)) return
    
            

            await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + wonMontant},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
            
            var embed = new MessageEmbed().setColor("GREEN").setTitle(":dagger: Crime").setDescription(`${text} <:NitsuCoin:984446683284910080> ${wonMontant}`);
            if (isNeg(wonMontant)) embed.color = "RED";
            if (wonMontant === 0) embed.color = "GREY"

            interaction.reply({embeds: [embed]});

            await TagsEconomyUsers.update({cooldowns: `${tag.cooldowns.split(",")[0]},${actualTime},${tag.cooldowns.split(",")[2]},${tag.cooldowns.split(",")[3]}`}, { where: { GUID: GUID } });
                

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
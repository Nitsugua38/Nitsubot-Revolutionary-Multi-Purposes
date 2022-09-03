const { TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    EcoCmdName: "set-starting-money",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré le montant selon le format demandé. Veuillez réessayer **cette étape** !");
        
        
        const filterAmount = response => {
            if (response.author.id === interaction.user.id && !isNaN(parseInt(response.content))) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };


        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Montant").setDescription("Quelle somme d’argent voulez-vous définir comme argent de départ ? \n\n:bulb: Cet argent sera automatiquement donné quand un membre **rejoindra le serveur** ou qu’un membre **déja présent fera la commande `/money` pour la 1ère fois.**");
            interaction.reply({embeds: [embed]})
                .then(() => {
                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {
                            var montant = Math.abs(parseInt(collected.first().content));
                            
                            const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
                            
                            if (tag2?.features?.startsWith("on")) {
                                await TagsEconomyGuilds.update({startingMoney: montant}, { where: { guildId: interaction.guild.id } });

                                const embed = new MessageEmbed().setColor("GREEN").setDescription(`<:NitsuCoin:984446683284910080> ${montant} seront octroyés aux nouveaux membres !`);
                                interaction.channel.send({embeds: [embed]});
                            } else {
                                interaction.channel.send({embeds: [embedNotConfig]});
                            }

                        })
                        .catch(err => {
                            const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
                            interaction.followUp({embeds: [embedcant]});
                        });
                    });
    }
}
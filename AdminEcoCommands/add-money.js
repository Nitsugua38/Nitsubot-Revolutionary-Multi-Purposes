const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    EcoCmdName: "add-money",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré le montant selon le format demandé. Veuillez réessayer **cette étape** !");
        
        
        const filterUserAmount = response => {
            if (response.author.id === interaction.user.id && response.mentions.users?.first() && !isNaN(parseInt(response.content.substring(response.content.indexOf(">")+1)))) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };


        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Membre / Montant").setDescription("À qui voulez-vous ajouter quelle somme d’argent ? \nFormat: `<@membre> <montant>`")
            interaction.reply({embeds: [embed]})
                .then(() => {
                    interaction.channel.awaitMessages({filter: filterUserAmount, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {
                            const membre = collected.first().mentions.members.first();
                            const montant = parseInt(collected.first().content.substring(collected.first().content.indexOf(">")+1));
                            const GUID = interaction.guild.id + "-" + membre.id;
                            
                            var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                            const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
                            if (!tag) {
                                if (tag2?.features?.startsWith("on")) {
                                    tag = await TagsEconomyUsers.create({ GUID: GUID,});
                                    tag = await TagsEconomyUsers.update({money: `${montant},0`}, { where: { GUID: GUID } });

                                    const embed = new MessageEmbed().setColor("GOLD").setDescription(`<:NitsuCoin:984446683284910080> ${montant} ont été ajoutés au cash de ${membre.displayName}`);
                                    interaction.channel.send({embeds: [embed]});
                                } else {
                                    interaction.channel.send({embeds: [embedNotConfig]});
                                }
                            } else {
                                if (!tag2?.features?.startsWith("on")) return interaction.channel.send({embeds: [embedNotConfig]});

                                tag = await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + montant},${tag.money.split(",")[1]}`}, { where: { GUID: GUID } });

                                const embed = new MessageEmbed().setColor("GOLD").setDescription(`<:NitsuCoin:984446683284910080> ${montant} ont été ajoutés au cash de ${membre.displayName}`);
                                interaction.channel.send({embeds: [embed]});
                            }

                        })
                        .catch(err => {
                            const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
                            interaction.followUp({embeds: [embedcant]});
                        });
                    });
    }
}
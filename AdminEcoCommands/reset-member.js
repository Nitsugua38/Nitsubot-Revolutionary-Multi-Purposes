const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")


module.exports = {
    EcoCmdName: "reset-member",
    async exec(interaction) {

        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez mentionné personne. Veuillez réessayer **cette étape** !");
        
        
        const filterUser = response => {
            if (response.author.id === interaction.user.id && response.mentions.users?.first()) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };
        const filterUser2 = response => {
            return response.user.id === interaction.user.id
        };


        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Membre").setDescription("Qui voulez-vous réinitialiser ? \n\n:warning: Tout son argent, son inventaire, ses actions en bourse et ses bitcoins seront **définitivement supprimés**")
            interaction.reply({embeds: [embed]})
                .then(() => {
                    interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {
                            
                            const membre = collected.first().mentions.members.first();
                            const GUID = interaction.guild.id + "-" + membre.id;

                            const row = new MessageActionRow().addComponents(new MessageButton().setLabel("Oui").setStyle("DANGER").setCustomId("aaECORESETyes"), new MessageButton().setLabel("Annuler").setStyle("SUCCESS").setCustomId("aaECORESETno"))
                            const embedSure = new MessageEmbed().setColor("RED").setTitle(`Êtes-vous sûr ?`).setDescription(`Veuillez confirmer que vous voulez réinitialiser l’économie de ${membre.displayName} !`);
                            interaction.channel.send({embeds: [embedSure], components: [row] })
                                .then(() => {
                                    interaction.channel.awaitMessageComponent({filter: filterUser2, componentType: "BUTTON", max: 1, time: 60000, errors: ['time'] })
                                        .then(async interaction => {
                                            if (interaction.customId === "aaECORESETyes") {
                                                await TagsEconomyUsers.destroy({ where: { GUID: GUID } });
                                                const embedDONE = new MessageEmbed().setColor("DARK_RED").setTitle(`L’économie de ${membre.displayName} a bien été réinitialisée !`);
                                                interaction.reply({embeds: [embedDONE]})
                                            } else {
                                                const embedCancel = new MessageEmbed().setColor("YELLOW").setTitle(`:bulb: Commande annulée !`);
                                                interaction.reply({embeds: [embedCancel]})
                                            }
                                        })
                                        .catch(err => {
                                            const embedCancel = new MessageEmbed().setColor("YELLOW").setTitle(`:bulb: Commande annulée !`);
                                            interaction.followUp({embeds: [embedCancel]})
                                        });
                                });

                        })
                        .catch(err => {
                            const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
                            interaction.followUp({embeds: [embedcant]});
                        });
                    });
    }
}
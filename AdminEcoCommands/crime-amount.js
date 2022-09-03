const { TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    EcoCmdName: "crime-amount",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les montants selon le format demandé. Veuillez réessayer **cette étape** !");
        
        
        const filterAmount = response => {
            var montants = response.content.split(",");
            if (response.author.id === interaction.user.id && !isNaN(parseInt(montants[0])) && !isNaN(parseInt(montants[1])) && montants[1] !== "0" && montants[2] !== "0") {
                if (parseInt(montants[0]) < parseInt(montants[1])) return true
                else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
            }
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };


        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Revenu minimum / Revenu maximum").setDescription("Veuillez indiquer le montant minimum et le montant maximum (peuvent être négatifs) qu’il sera possible de gagner en faisant la commande `crime` **séparés par une virgule**");
            interaction.reply({embeds: [embed]})
                .then(() => {
                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {
                            var montants = collected.first().content.split(",");
                            montants[0] = parseInt(montants[0]);
                            montants[1] = parseInt(montants[1]);
                            
                            const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
                            if (tag2?.features?.startsWith("on")) {
                                const strR = montants.toString() + "," + tag2.crime.split(",")[2];

                                await TagsEconomyGuilds.update({crime: strR}, { where: { guildId: interaction.guild.id } });

                                const embed = new MessageEmbed().setColor("GREEN").setDescription(`Le revenu obtensible grâce à la commande \`crime\` est désormais compris entre <:NitsuCoin:984446683284910080> ${montants[0]} et <:NitsuCoin:984446683284910080> ${montants[1]}`);
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
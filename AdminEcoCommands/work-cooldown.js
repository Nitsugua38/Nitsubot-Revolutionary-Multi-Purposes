const { TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    EcoCmdName: "work-cooldown",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré le temps selon le format demandé. Veuillez réessayer **cette étape** !");
        
        
        const filterAmount = response => {
            if (response.author.id === interaction.user.id && !isNaN(parseInt(response.content))) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };


        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le temps en heures").setDescription("Quelle intervalle de temps (en h) voulez-vous définir entre chaque commande `work` ?");
            interaction.reply({embeds: [embed]})
                .then(() => {
                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {
                            var time = Math.abs(parseInt(collected.first().content));
                            
                            var tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
                            if (tag2?.features?.startsWith("on")) {
                                const strR = tag2.work.split(",")[0] + "," + tag2.work.split(",")[1] + "," + time;
                                
                                await TagsEconomyGuilds.update({work: strR}, { where: { guildId: interaction.guild.id } });

                                const embed = new MessageEmbed().setColor("GREEN").setDescription(`:clock4: Le temps entre chaque commande \`work\` a été défini sur ${time} heure(s)`);
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
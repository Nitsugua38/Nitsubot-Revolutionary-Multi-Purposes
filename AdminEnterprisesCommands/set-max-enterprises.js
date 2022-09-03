const { TagsEnterprisesGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    EnterprisesCmdName: "set-max-enterprises",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré le nombre selon le format demandé. Veuillez réessayer **cette étape** !");
        
        
        const filterAmount = response => {
            if (response.author.id === interaction.user.id && !isNaN(parseInt(response.content))) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };


        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Nombre").setDescription("Quelle nombre voulez-vous définir comme maximum d’entreprises possédables par chaque membre ? \n\n :bulb: Mettre `-1` pour illimité");
            interaction.reply({embeds: [embed]})
                .then(() => {
                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {
                            var montant = parseInt(collected.first().content);
                            if (montant != -1) { montant = Math.abs(montant);}
                            
                            const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: interaction.guild.id } });

                            var response = montant === -1 ? "autant d’entreprises qu’il le souhaite" : `jusqu’à ${montant} entreprises`;
                            
                            
                            if (tag2?.features?.startsWith("on")) {
                                await TagsEnterprisesGuilds.update({maxEnterprises: montant}, { where: { guildId: interaction.guild.id } });

                                const embed = new MessageEmbed().setColor("GREEN").setDescription(`Chaque membre pourra désormais posséder ${response}`);
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
const { TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js")

module.exports = {
    EcoCmdName: "create-role-salary",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        
        
        const filterRoleAmountSuffix = response => {
            if (response.author.id === interaction.user.id && response.mentions.roles?.first() && !isNaN(parseInt(response.content.substring(response.content.indexOf(">")+1)))) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };
        const filterUser = response => {
            if (response.user.id === interaction.user.id) return true
            
        };
        const filterAmount = response => {
            if (response.author.id === interaction.user.id && !isNaN(parseInt(response.content))) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };


        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
        if (tag2?.features?.startsWith("on")) {
            const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Rôle / Montant").setDescription("Veuillez mentionner le rôle et indiquer le montant associé (peut être négatif) **soit en cash soit en pourcentage, vous sera demandé après**");
                interaction.reply({embeds: [embed]})
                    .then(() => {
                        interaction.channel.awaitMessages({filter: filterRoleAmountSuffix, max: 1, time: 60000, errors: ['time'] })
                            .then(async collected => {
                                const role = collected.first().mentions.roles.first();
                                const montant = parseInt(collected.first().content.substring(collected.first().content.indexOf(">")+1));
                                
                                const rowPC = new MessageActionRow().addComponents(
                                    new MessageSelectMenu()
                                        .setCustomId("selectPC")
                                        .setPlaceholder("Veuillez sélectionner une option")
                                        .addOptions([
                                            {
                                                label: "Cash",
                                                description: `Montant fixe : $ ${montant}`,
                                                value: "$",
                                                emoji: "<:NitsuCoin:984446683284910080>"
                                            },
                                            {
                                                label: "Pourcentage de l’argent total",
                                                description: `Montant variable : ${montant} %`,
                                                value: "%",
                                                emoji: "<:NitsuPercent:987371318792032336>"
                                            },
                                        ])
                                );
                                const embedPC = new MessageEmbed().setColor("BLUE").setDescription("Choisissez ci dessous cash / pourcentage")
                                interaction.channel.send({embeds: [embedPC], components: [rowPC]})

                                .then(() => {
                                    interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                                        .then(async interaction => {
                                            const option = interaction.values[0];

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le Cooldown en heures").setDescription("Quelle intervalle de temps (en h) voulez-vous définir entre chaque salaire ?");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            const time = Math.abs(parseInt(collected.first().content));

                                                            var strR;

                                                            if (tag2.rolesSalaries && tag2.rolesSalaries !== "") {
                                                                strR = tag2.rolesSalaries + "," + role.id + "/" + montant + "/" + option + "/" + time;
                                                            
                                                            } else {
                                                                strR = role.id + "/" + montant + "/" + option + "/" + time;
                                                            }
                
                
                                                            const embedAlreadyIn = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Vous avez déjà ajouté un salaire pour ce rôle !").setDescription("Pour le modifier ou le supprimer, faites la commande `/admin-economy Modifier un salaire de rôle`");
                                                            if (tag2.rolesSalaries?.includes(role.id)) return interaction.followUp({embeds: [embedAlreadyIn]});

                                                            const embedMax = new MessageEmbed().setColor("RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Pour des raisons de performance et de limitations, seul 120 salaires de rôle peuvent être crées par serveur ! Essayez d’en supprimer`);
                                                            if (strR.split(",").length >= 120) return interaction.followUp({embeds: [embedMax]});
                
                                                            
                
                                                            await TagsEconomyGuilds.update({rolesSalaries: strR}, { where: { guildId: interaction.guild.id } });
                                
                                                            const embed = new MessageEmbed().setColor("GREEN").setDescription(`Le revenu du rôle ${role} est désormais défini sur ${montant} ${option} avec un cooldown de ${time} heure(s)`);
                                                            interaction.followUp({embeds: [embed]});
                                                        })
                                                        .catch(err => {
                                                            const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                            

                                        })
                                        .catch(err => {
                                            const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
                                            interaction.followUp({embeds: [embedcant]});
                                        });
                                });

                            })
                            .catch(err => {
                                const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
                                interaction.followUp({embeds: [embedcant]});
                            });
                        });
        } else {
            interaction.channel.send({embeds: [embedNotConfig]});
        }
    }
}
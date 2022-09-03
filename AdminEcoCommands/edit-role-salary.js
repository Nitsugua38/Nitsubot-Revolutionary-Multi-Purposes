const { TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js")

module.exports = {
    EcoCmdName: "edit-role-salary",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");

        
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

            if (tag2.rolesSalaries && tag2.rolesSalaries !== "") {
                const rolesSalaries = tag2.rolesSalaries.split(",")
                var rolesSalariesObj = [];
                rolesSalaries.forEach(role => {
                    const things = role.split("/")
                    const roleName = interaction.guild.roles.cache.get(things[0])?.name;
                    if (!roleName) return
                    rolesSalariesObj.push({label: roleName, description: `Revenu : ${things[1]} ${things[2]} | Cooldown : ${things[3]} h`, value: things[0],});
                });

                var rows = [];

                const chunkSize = 25;
                
                for (let i = 0; i < rolesSalariesObj.length; i += chunkSize) {
                    const chunk = rolesSalariesObj.slice(i, i + chunkSize);
                    const row = new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Liste de rôles").setCustomId(`selectRStoEdit${i}`).addOptions(chunk));
                    rows.push(row);
                }

                const embed = new MessageEmbed().setColor("DARK_VIVID_PINK").setTitle("Salaires de rôles").setDescription("Veuillez choisir un salaire de rôle à modifier");
                interaction.reply({embeds: [embed], components: rows})
                
                .then(() => {
                    interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                        .then(async interaction => {
                            const roleId = interaction.values[0];

                             
                            const rowChose = new MessageActionRow().addComponents(
                                new MessageSelectMenu()
                                    .setCustomId("choseWhatToEdit")
                                    .setPlaceholder("Sélectionnez...")
                                    .addOptions([
                                        {
                                            label: "Montant du revenu",
                                            value: "montant",
                                            emoji: "<:NitsuCoin:984446683284910080>"
                                        },
                                        {
                                            label: "Cash / Pourcentage",
                                            value: "CP",
                                            emoji: "📈"
                                        },
                                        {
                                            label: "Cooldown",
                                            value: "cooldown",
                                            emoji: "⏱️"
                                        },
                                        {
                                            label: "Supprimer le salaire de rôle",
                                            value: "roleSalDel",
                                            emoji: "<:NitsuRedTickRound:977520171734401054>"
                                        }
                                    ])
                            );
                            const embedChose = new MessageEmbed().setColor("LUMINOUS_VIVID_PINK").setDescription("Veuillez sélectionner la valeur à modifier")
                            interaction.reply({embeds: [embedChose], components: [rowChose]})

                            .then(() => {
                                interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                                    .then(async interaction => {
                                        const value = interaction.values[0];
                                        let rarray = tag2.rolesSalaries.split(",");
                                        var str2 = rarray.find(element => element.includes(roleId));
                                        var arr2 = str2.split("/");

                                        var strR = rarray.filter(element => element !== str2).toString();
                                        

                                        if (value === "montant") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le nouveau montant").setDescription("Veuillez entrer le nouveau revenu pour ce rôle");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const montant = parseInt(collected.first().content);

                                                            arr2[1] = montant;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Montant modifié").setDescription(`Le nouveau montant pour ce rôle est désormais de ${montant} ${arr2[2]}`);
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEconomyGuilds.update({rolesSalaries: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        } 
                                        

                                        else if (value === "CP") {

                                            if (arr2[2] === "$") {
                                                arr2[2] = "%";
                                                str2 = arr2.toString().replace(/,/g,"/");
                                                if (strR) strR = strR + "," + str2;
                                                else strR = str2;
    
                                                const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Format modifié").setDescription(`Le montant sera désormais versé en pourcentage de l’argent total`);
                                                await interaction.reply({embeds: [embedReply]});
                                                await TagsEconomyGuilds.update({rolesSalaries: strR}, { where: { guildId: interaction.guild.id } });
                                            }
                                            else {
                                                arr2[2] = "$";
                                                str2 = arr2.toString().replace(/,/g,"/");
                                                if (strR) strR = strR + "," + str2;
                                                else strR = str2;
    
                                                const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Format modifié").setDescription(`Le montant sera désormais versé en cash`);
                                                await interaction.reply({embeds: [embedReply]});
                                                await TagsEconomyGuilds.update({rolesSalaries: strR}, { where: { guildId: interaction.guild.id } });
                                            }
                                        }


                                        else if (value === "cooldown") {
                                        
                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le Cooldown en heures").setDescription("Quelle intervalle de temps (en h) voulez-vous définir entre chaque salaire ?");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const time = Math.abs(parseInt(collected.first().content));
                                                        
                                                            arr2[3] = time;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Cooldown modifié").setDescription(`Le nouveau cooldown pour ce rôle est désormais de ${time} h`);
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEconomyGuilds.update({rolesSalaries: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        }

                                        else {
                                            const rName = interaction.guild.roles.cache.get(roleId);
                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Salaire de rôle supprimé").setDescription(`Le rôle ${rName} ne recevra plus de salaire !`);
                                            await interaction.reply({embeds: [embedReply]});
                                            await TagsEconomyGuilds.update({rolesSalaries: strR}, { where: { guildId: interaction.guild.id } });
                                        }


                                    })
                                    .catch(err => {
                                        interaction.followUp({embeds: [embedcant]});
                                    });
                            })
                        })
                        .catch(err => {
                            interaction.followUp({embeds: [embedcant]});
                        });
                })
            } else {
                const embedN = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun salaire de rôle trouvé ! Veuillez en créer un d’abord !");
                interaction.reply({embeds : [embedN]});
            }
        } else {
            interaction.channel.send({embeds: [embedNotConfig]});
        }
    }
}
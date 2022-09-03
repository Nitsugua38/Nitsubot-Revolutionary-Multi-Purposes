const { TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js")

module.exports = {
    EcoCmdName: "edit-item",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");

        
        const filterRoleAmount = response => {
            if (response.author.id === interaction.user.id) {
                if (response.mentions.roles?.first() || response.content.startsWith("skip")) {
                    var cut = response.content.indexOf(">");
                    if (response.content.indexOf(">") === -1) cut = 3
                    if (!isNaN(parseInt(response.content.substring(cut+1))) || response.content.endsWith("skip")) return true
                    
                    else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
                } else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
            } else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };
        const filterRoleRole = response => {
            if (response.author.id === interaction.user.id) {
                if (response.mentions.roles?.first() || response.content.startsWith("skip")) {
                    
                    if (response.content.substring(4).includes("<@&") || response.content.endsWith("skip")) return true

                    else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
                } else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
            } else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };
        const filterUser = response => {
            if (response.author.id === interaction.user.id) return true
            
        };
        const filterUser2 = response => {
            if (response.user.id === interaction.user.id) return true
            
        };
        const filterAmount = response => {
            if (response.author.id === interaction.user.id && !isNaN(parseInt(response.content))) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };
        const filterAmountOrSkip = response => {
            if (response.author.id === interaction.user.id && (!isNaN(parseInt(response.content)) || response.content === "skip")) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };





        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
        if (tag2?.features?.startsWith("on")) {

            if (tag2.items && tag2.items !== "") {
                
                const itemsArray = tag2.items.split(",");

                var fields = [];
                for (const item of itemsArray) {
                    var itemInfos = item.split("/");

                    let field = {label: itemInfos[0], value: itemInfos[0]}
                    fields.push(field);
                }


                var rows = [];

                const chunkSize = 25;
                
                for (let i = 0; i < fields.length; i += chunkSize) {
                    const chunk = fields.slice(i, i + chunkSize);
                    const row = new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Liste d’objets").setCustomId(`selectITEMtoEdit${i}`).addOptions(chunk));
                    rows.push(row);
                }

                const embed = new MessageEmbed().setColor("DARK_VIVID_PINK").setTitle("Objets").setDescription("Veuillez choisir un objet à modifier");
                interaction.reply({embeds: [embed], components: rows})
                
                .then(() => {
                    interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', filter: filterUser2, max: 1, time: 60000, errors: ['time'] })
                        .then(async interaction => {
                            const itemName = interaction.values[0];

                             
                            const rowChose = new MessageActionRow().addComponents(
                                new MessageSelectMenu()
                                    .setCustomId("choseWhatItemToEdit")
                                    .setPlaceholder("Sélectionnez...")
                                    .addOptions([
                                        {
                                            label: "Prix",
                                            value: "price",
                                            emoji: "<:NitsuCoin:984446683284910080>"
                                        },
                                        {
                                            label: "Description",
                                            value: "description",
                                            emoji: "📝"
                                        },
                                        {
                                            label: "Temps utilisable",
                                            value: "time",
                                            emoji: "🕓"
                                        },
                                        {
                                            label: "Stock restant",
                                            value: "stock",
                                            emoji: "<:NitsuStock:988722945427910697>"
                                        },
                                        {
                                            label: "Rôle et argent total requis",
                                            value: "req",
                                            emoji: "📋"
                                        },
                                        {
                                            label: "Rôle donné / Rôle supprimé",
                                            value: "roles",
                                            emoji: "📥"
                                        },
                                        {
                                            label: "Supprimer l’objet",
                                            description: "Il sera aussi supprimé pour tous les membres",
                                            value: "objDel",
                                            emoji: "<:NitsuRedTickRound:977520171734401054>"
                                        }
                                    ])
                            );
                            const embedChose = new MessageEmbed().setColor("LUMINOUS_VIVID_PINK").setDescription("Veuillez sélectionner la valeur à modifier")
                            interaction.reply({embeds: [embedChose], components: [rowChose]})

                            .then(() => {
                                interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', filter: filterUser2, max: 1, time: 60000, errors: ['time'] })
                                    .then(async interaction => {
                                        const value = interaction.values[0];
                                        let itemArray = tag2.items.split(",");
                                        var str2 = itemArray.find(element => element.startsWith(`${itemName}/`));
                                        var arr2 = str2.split("/");

                                        var strR = itemArray.filter(element => element !== str2).toString();
                                        

                                        if (value === "price") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le nouveau prix").setDescription("Veuillez entrer le nouveau prix de cet objet");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const price = Math.abs(parseInt(collected.first().content));

                                                            arr2[2] = price;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Prix modifié").setDescription(`Le nouveau prix pour cet objet est désormais de <:NitsuCoin:984446683284910080> ${price}`);
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEconomyGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        } 

                                        else if (value === "description") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir la nouvelle description").setDescription("Veuillez entrer la nouvelle description de cet objet");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const description = collected.first().content.substring(0, 500).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"");

                                                            arr2[1] = description;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Description modifiée").setDescription(description);
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEconomyGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        }  

                                        else if (value === "time") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le temps d’utilisation").setDescription("Pendant combien de temps (en h) l’objet pourra-t-il être utilisé après achat ? \n\nRépondez `skip` pour illimité");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterAmountOrSkip, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            var time;
                                                            if (Math.abs(parseInt(collected.first().content))) time = 3600 * Math.abs(parseInt(collected.first().content));
                                                            else time = "skip";

                                                            arr2[3] = time;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Temps modifié");
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEconomyGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        }  

                                        else if (value === "stock") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le stock").setDescription("Combien de ces objets seront disponibles ? \n\nRépondez `skip` pour illimité");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterAmountOrSkip, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const stock = Math.abs(parseInt(collected.first().content)) || "skip";

                                                            arr2[4] = stock;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Stock modifié").setDescription(`Il reste maintenant ${stock} objets en stock`);
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEconomyGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        }  

                                        else if (value === "req") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le rôle requis et/ou la monnaie requise").setDescription("Y a-t-il un rôle nécessaire **et/ou** faut-il posséder une certaine somme d’argent avant de pouvoir acheter ? \n\nSyntaxe : `<@role> <montant>` ou `skip skip` pour aucune restriction");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterRoleAmount, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const rolereq = collected.first().mentions.roles?.first()?.id || "skip";
                                                            var cut = collected.first().content.indexOf(">");
                                                            if (cut === -1) cut = 3
                                                            const balreq = Math.abs(parseInt(collected.first().content.substring(cut+1))) || "skip";

                                                            arr2[5] = rolereq;
                                                            arr2[6] = balreq;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Rôle requis et/ou Monnaie requise modifiés");
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEconomyGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        }  

                                        else if (value === "roles") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le rôle donné et/ou le rôle supprimé").setDescription("Faut-il donner **et/ou** supprimer un rôle lorsque cet objet est *utilisé* ? \n\nSyntaxe : `<@role> <@role>` ou `skip skip` pour aucun");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterRoleRole, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const rolegiven = collected.first().mentions.roles?.first()?.id || "skip";
                                                            const roleremoved = collected.first().mentions.roles?.first(2)[1]?.id || "skip";

                                                            
                                                            arr2[7] = rolegiven;
                                                            arr2[8] = roleremoved;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Rôle donné et/ou rôle supprimé modifiés");
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEconomyGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        }
                                        
                                        else {
                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Objet supprimé").setDescription(`L’objet ${itemName} a bien été supprimé !`);
                                            await interaction.reply({embeds: [embedReply]});
                                            await TagsEconomyGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
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
                const embedN = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");
                interaction.reply({embeds : [embedN]});
            }
        } else {
            interaction.channel.send({embeds: [embedNotConfig]});
        }
    }
}
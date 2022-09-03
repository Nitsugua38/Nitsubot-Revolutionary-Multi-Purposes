const { TagsEnterprisesGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js")

module.exports = {
    EnterprisesCmdName: "edit-material",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’entreprises");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");

        
        const filterUser = response => {
            if (response.member.id === interaction.user.id) return true
            
        };
        const filterAmountOrSkip = response => {
            if (response.author.id === interaction.user.id && (!isNaN(parseInt(response.content)) || response.content === "skip")) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };





        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
        if (tag2?.features?.startsWith("on")) {

            if (tag2.materials && tag2.materials !== "") {
                
                const itemsArray = tag2.materials.split(",");

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
                    const row = new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Liste de matériaux").setCustomId(`selectITEMtoEdit${i}`).addOptions(chunk));
                    rows.push(row);
                }

                const embed = new MessageEmbed().setColor("DARK_VIVID_PINK").setTitle("Matériaux").setDescription("Veuillez choisir un matériau à modifier");
                interaction.reply({embeds: [embed], components: rows})
                
                .then(() => {
                    interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', filter: filterUser, max: 1, time: 60000, errors: ['time'] })
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
                                            label: "Supprimer le matériau",
                                            description: "Il sera aussi supprimé pour tous les membres",
                                            value: "objDel",
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
                                        let itemArray = tag2.materials.split(",");
                                        var str2 = itemArray.find(element => element.startsWith(`${itemName}/`));
                                        var arr2 = str2.split("/");

                                        var strR = itemArray.filter(element => element !== str2).toString();
                                        

                                        if (value === "price") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir le nouveau prix").setDescription("Veuillez entrer le nouveau prix de cet objet. \n\nRépondez `skip` si ce matériau pourra être uniquement **produit**");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterAmountOrSkip, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const price = Math.abs(parseInt(collected.first().content)) || "skip";

                                                            arr2[2] = price;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Prix modifié").setDescription(price === "skip" ? `Cet objet n’est plus disponible à l’achat : seulement productible par une entreprise` : `Le nouveau prix pour cet objet est désormais de <:NitsuCoin:984446683284910080> ${price}`);
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEnterprisesGuilds.update({materials: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        } 

                                        else if (value === "description") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir la nouvelle description").setDescription("Veuillez entrer la nouvelle description de ce matériau");
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
                                                            await TagsEnterprisesGuilds.update({materials: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        }  

                                        else {
                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Matériau supprimé").setDescription(`L’objet ${itemName} a bien été supprimé !`);
                                            await interaction.reply({embeds: [embedReply]});
                                            await TagsEnterprisesGuilds.update({materials: strR}, { where: { guildId: interaction.guild.id } });
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
                const embedN = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun matériau n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");
                interaction.reply({embeds : [embedN]});
            }
        } else {
            interaction.channel.send({embeds: [embedNotConfig]});
        }
    }
}
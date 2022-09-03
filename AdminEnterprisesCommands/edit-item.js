const { TagsEnterprisesGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js")

module.exports = {
    EnterprisesCmdName: "edit-item",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’entreprises");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
        const embedN = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun matériau n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");

        
        const filterUser = response => {
            if (response.member.id === interaction.user.id) return true
            
        };
        



        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
        if (tag2?.features?.startsWith("on")) {

            if (tag2.items && tag2.items !== "") {

                if (!tag2.materials || tag2.materials === "") return interaction.reply({embeds : [embedN]});
                
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
                    interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                        .then(async interaction => {
                            const itemName = interaction.values[0];

                             
                            const rowChose = new MessageActionRow().addComponents(
                                new MessageSelectMenu()
                                    .setCustomId("choseWhatItemToEdit")
                                    .setPlaceholder("Sélectionnez...")
                                    .addOptions([
                                        {
                                            label: "Matériaux requis",
                                            value: "price",
                                            emoji: "🧱"
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
                                        let itemArray = tag2.items.split(",");
                                        var str2 = itemArray.find(element => element.startsWith(`${itemName}/`));
                                        var arr2 = str2.split("/");

                                        var strR = itemArray.filter(element => element !== str2).toString();
                                        

                                        if (value === "price") {


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
                            
                                            rows.push(new MessageActionRow().addComponents(new MessageButton().setLabel("Terminer").setCustomId("finished").setStyle("SUCCESS")));
                                            var embed = new MessageEmbed().setColor("DARK_VIVID_PINK").setTitle("Matériaux").setDescription(`Veuillez cliquer autant de fois sur chaque matériau que leur nombre voulu puis, quand vous avez fini, cliquer sur *Terminer* \n\nMatériaux sélectionnés : `);
                                            await interaction.reply({embeds: [embed], components: rows})
                                            
                                           
                                            var materialsList = [];
                                            
                        
                                            const filterUser22 = async interaction => {
                                                if (interaction.customId !== "finished") {
                                                    let material = interaction.values[0]
                        
                                                    if (materialsList.find(item => item.startsWith(`${material}/`))) {
                        
                                                        var materialArr = materialsList.find(item => item.startsWith(`${material}/`)).split("/");
                                                        materialArr[1] = parseInt(materialArr[1]) + 1;
                        
                                                        var OthermaterialArr = materialsList.filter(item => !item.startsWith(`${material}/`)).toString();
                        
                                                        if (OthermaterialArr) materialsList = (OthermaterialArr + "," + materialArr.toString().replace(/,/g, "/")).split(",");
                                                        else materialsList =  materialArr.toString().replace(/,/g, "/").split(",");
                                                    
                                                    }
                                                    else {
                                                        materialsList.push(`${material}/1`);
                                                    }
                                                  
                                                    var description = `Veuillez cliquer autant de fois sur chaque matériau que leur nombre voulu puis, quand vous avez fini, cliquer sur *Terminer* \n\nMatériaux sélectionnés : `
                        
                                                    materialsList.forEach(material => {
                                                        let materialArr = material.split("/");
                                                        description += `${materialArr[1]} ${materialArr[0]}, `
                                                    })
                        
                                                    embed.description = description
                                                    await interaction.update({embeds: [embed]})
                                                    return false
                                                } 
                                                else return true;
                                            }
                                            
                             
                             
                                            await interaction.channel.awaitMessageComponent({ filter: filterUser22, max: 1, time: 120000, errors: ['time'] })
                                                .then(async interaction => {
                        
                        
                                                    if (materialsList.length === 0) return interaction.reply({embeds: [embedcant]});
                            
                            
                                                    arr2[2] = materialsList.toString().replace(/,/g, ";").replace(new RegExp("/","g"),"-")
                                                    str2 = arr2.toString().replace(/,/g,"/");
                                                    if (strR) strR = strR + "," + str2;
                                                    else strR = str2;
                            
                                                    var desfield = "";
                                                    materialsList.forEach(material => {
                                                        let materialArr = material.split("/");
                                                        desfield += `${materialArr[1]} ${materialArr[0]}, `
                                                    })
                            
                                                    const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Matériaux requis pour construire l’objet modifiés").setDescription(`Matériaux requis : ${desfield}`);
                                                    interaction.reply({embeds: [embed]});
                                                    await TagsEnterprisesGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });


                                                })
                                                .catch(err => {
                                                    interaction.followUp({embeds: [embedcant]});
                                                });
                                        }




                                        else if (value === "description") {

                                            const embedTime = new MessageEmbed().setColor("BLURPLE").setTitle("Définir la nouvelle description").setDescription("Veuillez entrer la nouvelle description de cet objet");
                                            interaction.reply({embeds: [embedTime]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                                                        .then(async collected => {
                                                            
                                                            const description = collected.first().content.substring(0, 500).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"").replace(/-/g, "").replace(/;/g,"");;

                                                            arr2[1] = description;
                                                            str2 = arr2.toString().replace(/,/g,"/");
                                                            if (strR) strR = strR + "," + str2;
                                                            else strR = str2;

                                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Description modifiée").setDescription(description);
                                                            await interaction.channel.send({embeds: [embedReply]});
                                                            await TagsEnterprisesGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
                                                        })
                                                        .catch(err => {
                                                            interaction.followUp({embeds: [embedcant]});
                                                        });
                                                });
                                        }  

                                        else {
                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Objet supprimé").setDescription(`L’objet ${itemName} a bien été supprimé !`);
                                            await interaction.reply({embeds: [embedReply]});
                                            await TagsEnterprisesGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
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
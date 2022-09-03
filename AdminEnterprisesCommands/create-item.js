const { TagsEnterprisesGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js")

module.exports = {
    EnterprisesCmdName: "create-item",
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

            if (!tag2.materials || tag2.materials === "") return interaction.reply({embeds : [embedN]});


            const embedName = new MessageEmbed().setColor("#EBECF0").setTitle(":one: Nom").setDescription("Quel nom voulez-vous donner à votre objet ? \n\n*Celui-ci ne devrait pas commencer par un chiffre*");
            const embedDescription = new MessageEmbed().setColor("#EBECF0").setTitle(":two: Description").setDescription("Quel description voulez-vous donner à votre objet ? Max : 500 caractères");
            const embedPrice = new MessageEmbed().setColor("#EBECF0").setTitle(":three: Fabrication").setDescription("Comment cet objet pourra-t-il être fabriqué ? \n\nChoisissez parmi les matériaux");

            await interaction.reply({embeds: [embedName]});
            interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const name = collected.first().content.substring(0, 50).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"").replace(/-/g, "").replace(/;/g,"");

                await interaction.channel.send({embeds: [embedDescription]});
                interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                .then(async collected => {
                    const description = collected.first().content.substring(0, 500).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"").replace(/-/g, "").replace(/;/g,"");

                    
                    
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
                    await interaction.followUp({embeds: [embed], components: rows})
                    
                   
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

                            var strR;

                            if (tag2.items && tag2.items !== "") {

                                strR = tag2.items + "," + name + "/" + description + "/" + materialsList.toString().replace(/,/g, ";").replace(new RegExp("/","g"),"-")
                            
                            } else {
                                strR = name + "/" + description + "/" + materialsList.toString().replace(/,/g, ";").replace(new RegExp("/","g"),"-")
                            }
    
    
                            const embedAlreadyIn = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Vous avez déjà créé un objet avec le même nom !").setDescription("Pour le modifier ou le supprimer, faites la commande `/admin-enterprises Modifier un matériau`");
                            if (tag2.items && tag2.items !== "" && tag2.items?.split(",").filter(item => item.startsWith(`${name}/`)).length !== 0) return interaction.followUp({embeds: [embedAlreadyIn]});
    
                            const embedMax = new MessageEmbed().setColor("RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Pour des raisons de performance et de limitations, seul 90 objets peuvent être crées par serveur ! Essayez d’en supprimer`);
                            if (strR.split(",").length >= 90) return interaction.followUp({embeds: [embedMax]});
                            
    
                            var desfield = "";
                            materialsList.forEach(material => {
                                let materialArr = material.split("/");
                                desfield += `${materialArr[1]} ${materialArr[0]}, `
                            })
    
                            const embed = {
                                color: "GREEN",
                                title: `<:NitsuGreenTickRound:977520117216862239> Objet créé : ${name}`,
                                description: description,
                                fields: [
                                    {name: "Matériaux requis", value: desfield},
                                ],
                            };
                            interaction.reply({embeds: [embed]});
                            await TagsEnterprisesGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });
                            

                            
                        })
                        .catch(err => {
                            interaction.followUp({embeds: [embedcant]});
                        });
                })
                .catch(err => {
                    interaction.followUp({embeds: [embedcant]});
                });
            })
            .catch(err => {
                interaction.followUp({embeds: [embedcant]});
            });


        } else {
            interaction.channel.send({embeds: [embedNotConfig]});
        }
    }
}
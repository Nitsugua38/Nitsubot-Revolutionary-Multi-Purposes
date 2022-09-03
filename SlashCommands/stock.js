const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEnterprisesGuilds, TagsEnterprisesUsers, TagsEconomyUsers } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("stock")
        .setDescription("Afficher les matériaux/objets que vous possédez ; acheter, construire, revendre des matériaux/objets")
        .addStringOption(option => option.setName("action").setDescription("L’action à faire").setRequired(true).addChoice("🧱 Afficher la liste de vos matériaux","materials-list").addChoice("🚀 Afficher la liste de vos objets","items-list").addChoice("🏗️ Acheter des matériaux","buy").addChoice("🤝 Revendre des matériaux","sell").addChoice("⛏️ Construire un objet","build").addChoice("💰 Revendre un objet","sell-items"))
        .addUserOption(option => option.setName("membre").setDescription("Le membre à qui afficher/revendre les matériaux/objets"))
        .addStringOption(option => option.setName('nom').setDescription("Le nom exact de l’objet ou du matériau à vendre/acheter/construire"))
        .addIntegerOption(option => option.setName("quantité").setDescription("La quantité de l’objet ou du matériau à vendre/acheter/construire. 1 par défaut")),
async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admin-enterprises fonctionnalités` puis de cliquer pour activer !");
        const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Soit aucun matériau/objet n’a été créée sur le serveur soit vous ou le membre cible ne possède pas de matériau/objet !");
        const embednotspec = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Vous n’avez pas spécifié de matériau/objet !");
        const embedDMR = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Achat impossible : vous n’avez pas assez le cash ou les matériaux requis !");
        const embedNP = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Vous ne possédez pas cette entreprise !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
        const embednotallowed = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Achat impossible").setDescription(`Soit ce matériau est en pénurie, soit il n’est pas autorisé à la vente !`);
        const embednotspec2 = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Vous ne pouvez pas vendre à vous-même !");
        const embedNope = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Vente impossible").setDescription("Le membre à qui vous essayez de vendre n’a pas assez de cash !");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");


        const action = interaction.options.get("action").value;
        const membre = interaction.options.getMember("membre") || interaction.member;
        const materialName = interaction.options.getString("nom");
        const quantity = interaction.options.getInteger("quantité") || 1;

        const guildID = interaction.guild.id;
        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: guildID } });

        const GUID = guildID + "-" + membre.id


        var tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });
        var tag3 = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });

        

        if (tag2?.features?.startsWith("on")) {
        
            if (action === "materials-list") {

                if (tag2.materials && tag2.materials !== "") {

                    if (!tag) {
                        tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                    }

                    if (!tag.materials || tag.materials === "") return interaction.reply({embeds : [embednotfound]});

                    const itemsArray = tag.materials.split(",");

                    if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});

                    let description = "";
    
                    for (const item of itemsArray) {
                        var itemInfos = item.split("/");
                        
                        if (parseInt(itemInfos[1]) !== 0) {
                            description += `${itemInfos[1]} ${itemInfos[0]} \n`
                        }
                    }
                    
                    description = description.substring(0, 4096);
                            
                    const embed = new MessageEmbed().setColor("PURPLE").setTitle(`Liste des matériaux de ${membre.displayName}`).setDescription(description);
                    interaction.reply({embeds: [embed]});
               
                } else {
                    interaction.reply({embeds : [embednotfound]});
                }

            }  
            
            
            
            
            else if (action === "items-list") {

                if (tag2.items && tag2.items !== "") {

                    if (!tag) {
                        tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                    }

                    if (!tag.items || tag.items === "") return interaction.reply({embeds : [embednotfound]});

                    const itemsArray = tag.items.split(",");

                    if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});

                    let description = "";
    
                    for (const item of itemsArray) {
                        var itemInfos = item.split("/");
                        
                        if (parseInt(itemInfos[1]) !== 0) {
                            description += `${itemInfos[1]} ${itemInfos[0]} \n`
                        }
                    }
                    
                    description = description.substring(0, 4096);
                            
                    const embed = new MessageEmbed().setColor("PURPLE").setTitle(`Liste des objets construits par ${membre.displayName}`).setDescription(description);
                    interaction.reply({embeds: [embed]});
               
                } else {
                    interaction.reply({embeds : [embednotfound]});
                }

            
            }
            
            
            
            
            
            
            else if (action === "buy") {
                const GUID = guildID + "-" + interaction.member.id
                tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });
                tag3 = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });

                if (!tag) {
                    tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                }
                if (!tag3) {
                    tag3 = await TagsEconomyUsers.create({ GUID: GUID,});
                }

                if (!tag2.materials || tag2.materials === "") return interaction.reply({embeds : [embednotfound]});


                
                        
                const nombreMaterial = quantity;
                const MaterialReq = materialName;

                if (!MaterialReq) return interaction.reply({embeds: [embednotspec]});

                
                const item22 = tag2.materials.split(",").filter(item => item.startsWith(`${MaterialReq}/`));
                
                const embednotfound2 = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Non trouvé / Imprécis").setDescription(`Soit ce matériau n’existe pas (veuillez d’abord le créer) soit plusieurs matériaux commençants avec le même nom ont été trouvés : \`${MaterialReq}\` Veuillez réessayez avec le nom exact ! (Avez-vous fait attention aux majuscules ?)`);
                if (item22.length !== 1) return interaction.reply({embeds: [embednotfound2]});

                const itemInfos = item22.toString().split("/");

                if (itemInfos[3] === "oui" || itemInfos[2] === "skip") return interaction.reply({embeds: [embednotallowed]});

                
                if ((parseInt(itemInfos[2]) * nombreMaterial) > parseInt(tag3.money.split(",")[0])) return interaction.reply({embeds: [embedDMR]});
                
                
                
                
                let materialposs = tag.materials?.split(",")?.find(item => item.startsWith(`${MaterialReq}/`))?.toString()?.split("/");
                if (!materialposs) materialposs = [MaterialReq, "0"];
                materialposs[1] = parseInt(materialposs[1]) + nombreMaterial


                let strR = tag.materials?.split(",")?.filter(element => element !== tag.materials?.split(",")?.find(item => item.startsWith(`${MaterialReq}/`))?.toString())?.toString();

                if (strR) strR = strR + "," + materialposs.toString().replace(/,/g,"/");
                else strR = materialposs.toString().replace(/,/g,"/");


                await TagsEconomyUsers.update({money: `${parseInt(tag3.money.split(",")[0]) - (parseInt(itemInfos[2]) * nombreMaterial)},${parseInt(tag3.money.split(",")[1])}`}, { where: { GUID: GUID } });
                await TagsEnterprisesUsers.update({materials: strR}, { where: { GUID: GUID } });

                const embedOk = new MessageEmbed().setColor("GREEN").setDescription(`Vous avez acheté ${nombreMaterial} ${MaterialReq} pour <:NitsuCoin:984446683284910080> ${parseInt(itemInfos[2]) * nombreMaterial}`);
                await interaction.reply({embeds: [embedOk]});

                    

            }








            else if (action === "sell") {
                const GUID = guildID + "-" + interaction.member.id
                tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });
                tag3 = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });

                if (!tag) {
                    tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                }
                if (!tag3) {
                    tag3 = await TagsEconomyUsers.create({ GUID: GUID,});
                }

                const seller = interaction.member;
                
                if (!tag2.materials || tag2.materials === "") return interaction.reply({embeds : [embednotfound]});
                if (!tag.materials || tag.materials === "") return interaction.reply({embeds : [embednotfound]});


                if (!materialName) return interaction.reply({embeds: [embednotspec]});
                if (membre.id === interaction.member.id) return interaction.reply({embeds: [embednotspec2]});
                
                
                const item = tag2.materials.split(",").filter(item => item.startsWith(`${materialName}/`));
                
                if (item.length !== 1) return interaction.reply({embeds: [embednotfound]});

                const itemInfos = item.toString().split("/");




                if (tag.materials && tag.materials !== "" && tag.materials.includes(`${materialName}/`) && parseInt(tag.materials.substring(tag.materials.indexOf(`${materialName}/`) + materialName.length + 1)) >= quantity) {


                    const priceUser = new MessageEmbed().setColor("BLUE").setTitle("Prix").setDescription(`À quel prix total voulez-vous vendre ${quantity} ${materialName} à ${membre} ?`);

                    const filterAmount = response => {
                        if (response.author.id === interaction.user.id && !isNaN(Math.abs(parseInt(response.content)))) return true
                        else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
                    };

                    await interaction.reply({embeds: [priceUser]});
                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {

                            const montant = parseInt(collected.first().content);
                            const TargetGUID = interaction.guild.id + "-" + membre.id;

                            var tag5 = await TagsEconomyUsers.findOne({ where: { GUID: TargetGUID } });
                            if (!tag5 || tag5?.money?.split(",")[0] < montant) return interaction.channel.send({embeds: [embedNope]});

                            var tag4 = await TagsEnterprisesUsers.findOne({ where: { GUID: TargetGUID } });


                            const ask = new MessageEmbed().setColor("BLUE").setDescription(`Voulez-vous acheter ${quantity} ${materialName} à ${interaction.member} pour <:NitsuCoin:984446683284910080> ${montant} ?`);
                            const row = new MessageActionRow().addComponents(new MessageButton().setLabel("Accepter").setStyle("SUCCESS").setCustomId("sellyes"), new MessageButton().setLabel("Refuser").setStyle("DANGER").setCustomId("sellno"));
        
                            await interaction.channel.send({content: `${membre}`, embeds: [ask], components: [row]});
        
        
                            const filterUser2 = response => {
                                return response.user.id === membre.id
                            };
        
        
                            interaction.channel.awaitMessageComponent({filter: filterUser2, componentType: "BUTTON", max: 1, time: 300000, errors: ['time'] })
                            .then(async interaction => {
        
                                if (interaction.customId === "sellyes") {

                                    
                                    //Seller
                                    var strR;

                                    let item_a = tag.materials.split(",")
                                    let item_b = item_a.filter(item => item.startsWith(`${materialName}/`)).toString()
                                    let item = item_b.split("/");
                                    
                                    item[1] = parseInt(item[1]) - quantity;
            
                                    if (isNeg(item[1]) || item[1] === 0) {
                                    
                                        var strR = item_a.filter(item => !item.startsWith(`${materialName}/`)).toString();
                                        
                                    } else {
                                        var strR = item_a.filter(item => !item.startsWith(`${materialName}/`)).toString();
                                        if (!strR) strR = item.toString().replace(/,/g,"/");
                                        else strR = strR + "," + item.toString().replace(/,/g,"/");
                                    }
            
            
                                    await TagsEnterprisesUsers.update({materials: strR}, { where: { GUID: GUID } });
                                    await TagsEconomyUsers.update({money: `${parseInt(tag3.money.split(",")[0]) + montant},${tag3.money.split(",")[1]}`}, { where: { GUID: GUID } });




                                    //Buyer
                                    var strR2;

                                    if (tag4.materials && tag4.materials !== "") {
                                        if (tag4.materials.includes(`${materialName}/`)) {
                                            let item_a = tag4.materials.split(",")
                                            let item_b = item_a.filter(item => item.startsWith(`${materialName}/`)).toString()
                                            let item = item_b.split("/");
                                            
                                            item[1] = parseInt(item[1]) + quantity;
                
                                            var strR2 = item_a.filter(item => !item.startsWith(`${materialName}/`)).toString();
                                            if (!strR2) strR2 = item.toString().replace(/,/g,"/");
                                            else strR2 = strR2 + "," + item.toString().replace(/,/g,"/");
                
                                        } else {
                                            strR2 = tag4.materials + "," + `${materialName}/${quantity}`
                                        }
                                    
                                    } else {
                                        strR2 = `${materialName}/${quantity}`
                                    }

                                    await TagsEnterprisesUsers.update({materials: strR2}, { where: { GUID: TargetGUID } });
                                    await TagsEconomyUsers.update({money: `${parseInt(tag5.money.split(",")[0]) - montant},${tag5.money.split(",")[1]}`}, { where: { GUID: TargetGUID } });



                                    //Confirmation
                                    const embed = new MessageEmbed().setColor("GREEN").setDescription(`${quantity} ${materialName} ont été vendus par ${seller} à ${membre} pour <:NitsuCoin:984446683284910080> ${montant}`);
                                    interaction.reply({embeds: [embed]});


                                } else {
                                    const embedCancel = new MessageEmbed().setColor("YELLOW").setTitle(`:bulb: Vente annulée, le membre a refusé !`);
                                    interaction.reply({embeds: [embedCancel]})
                                }
                            })
                            .catch(err => {
                                interaction.followUp({embeds: [embedcant]});
                            });

                        })
                        .catch(err => {
                            interaction.followUp({embeds: [embedcant]});
                        });
                
                } else {
                    const embed = new MessageEmbed().setColor("DARK_RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Vous ne possédez pas ${quantity} ${materialName}`);
                    interaction.reply({embeds: [embed]});
                }
                
            }
            
            




            else if (action === "sell-items") {
                const GUID = guildID + "-" + interaction.member.id
                tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });
                tag3 = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });

                if (!tag) {
                    tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                }
                if (!tag3) {
                    tag3 = await TagsEconomyUsers.create({ GUID: GUID,});
                }

                const seller = interaction.member;
                
                if (!tag2.items || tag2.items === "") return interaction.reply({embeds : [embednotfound]});
                if (!tag.items || tag.items === "") return interaction.reply({embeds : [embednotfound]});


                if (!materialName) return interaction.reply({embeds: [embednotspec]});
                if (membre.id === interaction.member.id) return interaction.reply({embeds: [embednotspec2]});
                
                
                const item = tag2.items.split(",").filter(item => item.startsWith(`${materialName}/`));
                
                if (item.length !== 1) return interaction.reply({embeds: [embednotfound]});

                const itemInfos = item.toString().split("/");




                if (tag.items && tag.items !== "" && tag.items.includes(`${materialName}/`) && parseInt(tag.items.substring(tag.items.indexOf(`${materialName}/`) + materialName.length + 1)) >= quantity) {


                    const priceUser = new MessageEmbed().setColor("BLUE").setTitle("Prix").setDescription(`À quel prix total voulez-vous vendre ${quantity} ${materialName} à ${membre} ?`);

                    const filterAmount = response => {
                        if (response.author.id === interaction.user.id && !isNaN(Math.abs(parseInt(response.content)))) return true
                        else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
                    };

                    await interaction.reply({embeds: [priceUser]});
                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {

                            const montant = parseInt(collected.first().content);
                            const TargetGUID = interaction.guild.id + "-" + membre.id;

                            var tag5 = await TagsEconomyUsers.findOne({ where: { GUID: TargetGUID } });
                            if (!tag5 || tag5?.money?.split(",")[0] < montant) return interaction.channel.send({embeds: [embedNope]});

                            var tag4 = await TagsEnterprisesUsers.findOne({ where: { GUID: TargetGUID } });


                            const ask = new MessageEmbed().setColor("BLUE").setDescription(`Voulez-vous acheter ${quantity} ${materialName} à ${interaction.member} pour <:NitsuCoin:984446683284910080> ${montant} ?`);
                            const row = new MessageActionRow().addComponents(new MessageButton().setLabel("Accepter").setStyle("SUCCESS").setCustomId("sellyes"), new MessageButton().setLabel("Refuser").setStyle("DANGER").setCustomId("sellno"));
        
                            await interaction.channel.send({content: `${membre}`, embeds: [ask], components: [row]});
        
        
                            const filterUser2 = response => {
                                return response.user.id === membre.id
                            };
        
        
                            interaction.channel.awaitMessageComponent({filter: filterUser2, componentType: "BUTTON", max: 1, time: 300000, errors: ['time'] })
                            .then(async interaction => {
        
                                if (interaction.customId === "sellyes") {

                                    
                                    //Seller
                                    var strR;

                                    let item_a = tag.items.split(",")
                                    let item_b = item_a.filter(item => item.startsWith(`${materialName}/`)).toString()
                                    let item = item_b.split("/");
                                    
                                    item[1] = parseInt(item[1]) - quantity;
            
                                    if (isNeg(item[1]) || item[1] === 0) {
                                    
                                        var strR = item_a.filter(item => !item.startsWith(`${materialName}/`)).toString();
                                        
                                    } else {
                                        var strR = item_a.filter(item => !item.startsWith(`${materialName}/`)).toString();
                                        if (!strR) strR = item.toString().replace(/,/g,"/");
                                        else strR = strR + "," + item.toString().replace(/,/g,"/");
                                    }
            
            
                                    await TagsEnterprisesUsers.update({items: strR}, { where: { GUID: GUID } });
                                    await TagsEconomyUsers.update({money: `${parseInt(tag3.money.split(",")[0]) + montant},${tag3.money.split(",")[1]}`}, { where: { GUID: GUID } });




                                    //Buyer
                                    var strR2;

                                    if (tag4.items && tag4.items !== "") {
                                        if (tag4.items.includes(`${materialName}/`)) {
                                            let item_a = tag4.items.split(",")
                                            let item_b = item_a.filter(item => item.startsWith(`${materialName}/`)).toString()
                                            let item = item_b.split("/");
                                            
                                            item[1] = parseInt(item[1]) + quantity;
                
                                            var strR2 = item_a.filter(item => !item.startsWith(`${materialName}/`)).toString();
                                            if (!strR2) strR2 = item.toString().replace(/,/g,"/");
                                            else strR2 = strR2 + "," + item.toString().replace(/,/g,"/");
                
                                        } else {
                                            strR2 = tag4.items + "," + `${materialName}/${quantity}`
                                        }
                                    
                                    } else {
                                        strR2 = `${materialName}/${quantity}`
                                    }

                                    await TagsEnterprisesUsers.update({items: strR2}, { where: { GUID: TargetGUID } });
                                    await TagsEconomyUsers.update({money: `${parseInt(tag5.money.split(",")[0]) - montant},${tag5.money.split(",")[1]}`}, { where: { GUID: TargetGUID } });



                                    //Confirmation
                                    const embed = new MessageEmbed().setColor("GREEN").setDescription(`${quantity} ${materialName} ont été vendus par ${seller} à ${membre} pour <:NitsuCoin:984446683284910080> ${montant}`);
                                    interaction.reply({embeds: [embed]});


                                } else {
                                    const embedCancel = new MessageEmbed().setColor("YELLOW").setTitle(`:bulb: Vente annulée, le membre a refusé !`);
                                    interaction.reply({embeds: [embedCancel]})
                                }
                            })
                            .catch(err => {
                                interaction.followUp({embeds: [embedcant]});
                            });

                        })
                        .catch(err => {
                            interaction.followUp({embeds: [embedcant]});
                        });
                
                } else {
                    const embed = new MessageEmbed().setColor("DARK_RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Vous ne possédez pas ${quantity} ${materialName}`);
                    interaction.reply({embeds: [embed]});
                }
                
            }






            else if (action === "build") {

                const GUID = guildID + "-" + interaction.member.id
                tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });
                tag3 = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });

                if (!tag) {
                    tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                }
                if (!tag3) {
                    tag3 = await TagsEconomyUsers.create({ GUID: GUID,});
                }

                
                
                if (!tag2.items || tag2.items === "") return interaction.reply({embeds : [embednotfound]});
                if (!tag2.materials || tag2.materials === "") return interaction.reply({embeds : [embednotfound]});
                if (!tag.materials || tag.materials === "") return interaction.reply({embeds : [embednotfound]});


                if (!materialName) return interaction.reply({embeds: [embednotspec]});



            
                const enterprise = tag2.items.split(",").filter(item => item.startsWith(`${materialName}/`));
                
                if (enterprise.length !== 1) return interaction.reply({embeds: [embednotfound]});

                const enterpriseInfos = enterprise.toString().split("/");


                const enterprisesPossesed = tag.items?.split(",");
                const materialsPossesed = tag.materials?.split(",");


                
                

                var Rmatnumber;
                var STRF = materialsPossesed;

                if (!materialsPossesed) return interaction.reply({embeds: [embedDMR]})

                let toCut = tag2.items.split(",").find(item => item.startsWith(`${materialName}/`)).toString();
                let requirements = toCut.substring(toCut.lastIndexOf("/") + 1).split(";")
                
                for (const requirement of requirements) {
                    let number = parseInt(requirement.split("-")[1]) * quantity;
                    let material = requirement.split("-")[0];


                    let materialReq = materialsPossesed.find(item => item.startsWith(`${material}/`))?.toString()?.split("/");

                    if (!materialReq) return interaction.reply({embeds: [embedDMR]});
                   
                    let strR = STRF.filter(element => element !== STRF.find(item => item.startsWith(`${material}/`))?.toString())?.toString();
                    

                    Rmatnumber = parseInt(materialReq[1]) - parseInt(number);

                    if (isNeg(Rmatnumber)) return interaction.reply({embeds: [embedDMR]});


                    materialReq[1] = Rmatnumber
                    var str2 = materialReq.toString().replace(/,/g,"/");
                    if (strR) STRF = strR + "," + str2;
                    else STRF = str2;

                    STRF = STRF.split(",");
                }
                STRF = STRF.toString();
                
                
                await TagsEnterprisesUsers.update({materials: STRF}, { where: { GUID: GUID } });    
                
 
                


                var strR;

                if (enterprisesPossesed && enterprisesPossesed.toString() !== "") {
                    if (tag.items.includes(`${materialName}/`)) {
                        let item_a = tag.items.split(",")
                        let item_b = item_a.filter(item => item.startsWith(`${materialName}/`)).toString()
                        let item = item_b.split("/");
                        
                        item[1] = parseInt(item[1]) + quantity;

                        strR = item_a.filter(item => !item.startsWith(`${materialName}/`)).toString();
                        if (!strR) strR = item.toString().replace(/,/g,"/");
                        else strR = strR + "," + item.toString().replace(/,/g,"/");

                    } else {
                        strR = tag.items + "," + `${materialName}/${quantity}`
                    }
                
                } else {
                    strR = `${materialName}/${quantity}`
                }
                
                await TagsEnterprisesUsers.update({items: strR}, { where: { GUID: GUID } });
                
                const embedreply = new MessageEmbed().setColor("GREEN").setDescription(`Vous avez construit ${quantity} ${materialName}`);
                interaction.reply({embeds: [embedreply]});
            }

                         
        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }

    },
};


function isNeg(x) {
    if (x !== Math.abs(x)) return true
    else return false
}
const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("item")
        .setDescription("Acheter, vendre, utiliser ou obtenir des infos sur les objets de la boutique")
        .addStringOption(option => option.setName('action').setDescription("L’action à faire").setRequired(true).addChoice("🛒 Acheter", "buy").addChoice("💰 Vendre", "sell").addChoice("🔍 Utiliser", "use").addChoice("🏷️ Afficher les informations", "info"))
        .addStringOption(option => option.setName('objet').setDescription("Le nom exact de l’objet").setRequired(true))
        .addIntegerOption(option => option.setName("quantité").setDescription("La quantité de l’objet à acheter, vendre ou utiliser. 1 par défaut")),
    async execute(interaction) {
        const itemSearch = interaction.options.getString("objet");
        const action = interaction.options.get("action").value;

        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embednotfound = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Non trouvé / Imprécis").setDescription("Soit cet objet n’existe pas soit plusieurs objets commençants avec le même nom ont été trouvés. Veuillez réessayez avec le nom exact ! (Avez-vous fait attention aux majuscules ?)");
        const embedMoney = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Achat impossible").setDescription("Vous n’avez pas assez de cash");
        const embedStock = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Achat impossible").setDescription("Cet objet n’est plus en stock ou vous essayez d’en acheter trop !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
        const embedNope = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Vente impossible").setDescription("Le membre à qui vous essayez de vendre n’a pas assez de cash !");
        const embednotspec2 = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Vous ne pouvez pas vendre à vous-même !");



        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        
        const actualTime = Math.floor(interaction.createdTimestamp / 1000);


        if (tag2?.features?.startsWith("on")) {
            if (tag2.items && tag2.items !== "") {

                if (action === "info") {
                    const item = tag2.items.split(",").filter(item => item.startsWith(`${itemSearch}/`));

                    if (item.length !== 1) return interaction.reply({embeds: [embednotfound]});

                    const itemInfos = item.toString().split("/");
                    const embed = {
                        color: "FUCHSIA",
                        title: itemInfos[0],
                        description: itemInfos[1],
                        fields: [
                            {name: "Prix", value: `<:NitsuCoin:984446683284910080> ${itemInfos[2]}`, inline: true},
                            {name: "\u200B", value: "\u200B", inline: true}, 
                            {name: "\u200B", value: "\u200B", inline: true},

                            itemInfos[3] === "skip" ? {name: ":clock4: Temps utilisable", value: "Illimité", inline: true} : {name: ":clock4: Temps utilisable", value: `${itemInfos[3] / 3600}h`, inline: true} , 
                            itemInfos[4] === "skip" ? {name: "<:NitsuStock:988722945427910697> Stock restant", value: "Illimité", inline: true} : {name: "<:NitsuStock:988722945427910697> Stock restant", value: `${itemInfos[4]}`, inline: true},
                            itemInfos[7] === "skip" ? {name: ":inbox_tray: Rôle donné", value: "Aucun", inline: true} : {name: ":inbox_tray: Rôle donné", value: `<@&${itemInfos[7]}>`, inline: true},

                            itemInfos[5] === "skip" ? {name: ":clipboard: Rôle requis", value:  "Aucun", inline: true} : {name: ":clipboard: Rôle requis", value: `<@&${itemInfos[5]}>`, inline: true},
                            itemInfos[6] === "skip" ? {name: ":moneybag: Argent total requis", value: "Aucun", inline: true} : {name: ":moneybag: Argent total requis", value: `${itemInfos[6]}`, inline: true},
                            itemInfos[8] === "skip" ? {name: ":outbox_tray: Rôle supprimé", value: "Aucun", inline: true} : {name: ":outbox_tray: Rôle supprimé", value: `<@&${itemInfos[8]}>`, inline: true}
                        ],
                    };
                    interaction.reply({embeds: [embed]});
                }







                else if (action === "buy") {
                
                    const membre = interaction.member;
                    const nombre = Math.abs(interaction.options.getInteger("quantité")) || 1;
                    
                    const GUID = interaction.guild.id + "-" + membre.id;

                    
                    var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                    const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                    
                    if (!tag) {
                        tag = await TagsEconomyUsers.create({ GUID: GUID,});
                    }

                    
                    const item = tag2.items.split(",").filter(item => item.startsWith(`${itemSearch}/`));
                    
                    if (item.length !== 1) return interaction.reply({embeds: [embednotfound]});

                    const itemInfos = item.toString().split("/");


                    
                    
                    if (parseInt(tag.money.split(",")[0]) < (parseInt(itemInfos[2]) * nombre)) return interaction.reply({embeds: [embedMoney]});
                    if (itemInfos[4] !== "skip" && itemInfos[4] < nombre) return interaction.reply({embeds: [embedStock]});

                    const embedReq = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Achat impossible").setDescription(`Vous ne possédez pas le rôle requis : <@&${itemInfos[5]}> ou l’argent total requis : <:NitsuCoin:984446683284910080> ${itemInfos[6]} pour pouvoir acheter cet objet`);
                    if (itemInfos[5] !== "skip" && !membre.roles.cache.some(role => role.id === itemInfos[5])) return interaction.reply({embeds: [embedReq]});
                    if (itemInfos[6] !== "skip" && ( ( parseInt(tag.money.split(",")[0]) + parseInt(tag.money.split(",")[1]) ) < parseInt(itemInfos[6]) )) return interaction.reply({embeds: [embedReq]});


                    
                    var strR;

                    if (tag.items && tag.items !== "" && tag.items !== "aucun") {
                        if (tag.items.includes(`${itemSearch}/`)) {
                            let item_a = tag.items.split(",")
                            let item_b = item_a.filter(item => item.startsWith(`${itemSearch}/`)).toString()
                            let item = item_b.split("/");
                            
                            item[1] = parseInt(item[1]) + nombre;
                            item[2] = actualTime;

                            var strR = item_a.filter(item => !item.startsWith(`${itemSearch}/`)).toString();
                            if (!strR) strR = item.toString().replace(/,/g,"/");
                            else strR = strR + "," + item.toString().replace(/,/g,"/");

                        } else {
                            strR = tag.items + "," + `${itemSearch}/${nombre}/${actualTime}`
                        }
                    
                    } else {
                        strR = `${itemSearch}/${nombre}/${actualTime}`
                    }
                    
                                              
                    await TagsEconomyUsers.update({items: strR}, { where: { GUID: GUID } });
                    await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) - (parseInt(itemInfos[2]) * nombre)},${tag.money.split(",")[1]}`}, { where: { GUID: GUID } });


                    if (itemInfos[4] !== "skip") {
                        let itemArray = tag2.items.split(",");
                        let str2 = itemArray.find(element => element.startsWith(`${itemSearch}/`));
                        var arr2 = str2.split("/");

                        var strR2 = itemArray.filter(element => element !== str2).toString();

                        arr2[4] = parseInt(arr2[4]) - nombre;
                        str2 = arr2.toString().replace(/,/g,"/");

                        if (strR2) strR2 = strR2 + "," + str2;
                        else strR2 = str2;

                        await TagsEconomyGuilds.update({items: strR2}, { where: { guildId: interaction.guild.id } });
                    }

                    const embed = new MessageEmbed().setColor("GREEN").setDescription(`<:NitsuGreenTickRound:977520117216862239> Vous avez acheté ${nombre} ${itemSearch} pour <:NitsuCoin:984446683284910080> ${parseInt(itemInfos[2]) * nombre}`);
                    interaction.reply({embeds: [embed]});

                }






                else if (action === "sell") {

                    const membre = interaction.member;
                    const nombre = Math.abs(interaction.options.getInteger("quantité")) || 1;
                    
                    const GUID = interaction.guild.id + "-" + membre.id;

                    
                    var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                    const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                    
                    if (!tag) {
                        tag = await TagsEconomyUsers.create({ GUID: GUID,});
                    }

                    
                    const item = tag2.items.split(",").filter(item => item.startsWith(`${itemSearch}/`));
                    
                    if (item.length !== 1) return interaction.reply({embeds: [embednotfound]});

                    const itemInfos = item.toString().split("/");




                    if (tag.items && tag.items !== "" && tag.items !== "aucun" && tag.items.includes(`${itemSearch}/`) && parseInt(tag.items.substring(tag.items.indexOf(`${itemSearch}/`) + itemSearch.length + 1)) >= nombre) {


                        const priceUser = new MessageEmbed().setColor("BLUE").setTitle("Membre / Prix").setDescription(`À qui voulez vous vendre ${nombre} ${itemSearch} et pour quel prix total ?`);

                        const filterUserAmount = response => {
                            if (response.author.id === interaction.user.id && response.mentions.users?.first() && !isNaN(parseInt(response.content.substring(response.content.indexOf(">")+1)))) return true
                            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
                        };

                        await interaction.reply({embeds: [priceUser]});
                        interaction.channel.awaitMessages({filter: filterUserAmount, max: 1, time: 60000, errors: ['time'] })
                            .then(async collected => {

                                const target = collected.first().mentions.members.first();
                                const montant = parseInt(collected.first().content.substring(collected.first().content.indexOf(">")+1));
                                const TargetGUID = interaction.guild.id + "-" + target.id;

                                if (membre.id === target.id) return interaction.reply({embeds: [embednotspec2]});

                                var tag3 = await TagsEconomyUsers.findOne({ where: { GUID: TargetGUID } });
                                if (!tag3 || tag3?.money?.split(",")[0] < montant) return interaction.channel.send({embeds: [embedNope]});




    
                                const ask = new MessageEmbed().setColor("BLUE").setDescription(`Voulez-vous acheter ${nombre} ${itemSearch} à ${membre} pour <:NitsuCoin:984446683284910080> ${montant} ?`);
                                const row = new MessageActionRow().addComponents(new MessageButton().setLabel("Accepter").setStyle("SUCCESS").setCustomId("sellyes"), new MessageButton().setLabel("Refuser").setStyle("DANGER").setCustomId("sellno"));
            
                                await interaction.channel.send({content: `${target}`, embeds: [ask], components: [row]});
            
            
                                const filterUser2 = response => {
                                    return response.user.id === target.id
                                };
            
            
                                interaction.channel.awaitMessageComponent({filter: filterUser2, componentType: "BUTTON", max: 1, time: 300000, errors: ['time'] })
                                .then(async interaction => {
            
                                    if (interaction.customId === "sellyes") {

                                        
                                        //Seller
                                        var strR;

                                        let item_a = tag.items.split(",")
                                        let item_b = item_a.filter(item => item.startsWith(`${itemSearch}/`)).toString()
                                        let item = item_b.split("/");
                                        
                                        item[1] = parseInt(item[1]) - nombre;
                
                                        if (isNeg(item[1]) || item[1] === 0) {
                                        
                                            var strR = item_a.filter(item => !item.startsWith(`${itemSearch}/`)).toString();
                                            
                                        } else {
                                            var strR = item_a.filter(item => !item.startsWith(`${itemSearch}/`)).toString();
                                            if (!strR) strR = item.toString().replace(/,/g,"/");
                                            else strR = strR + "," + item.toString().replace(/,/g,"/");
                                        }
                
                
                                        await TagsEconomyUsers.update({items: strR}, { where: { GUID: GUID } });
                                        await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + montant},${tag.money.split(",")[1]}`}, { where: { GUID: GUID } });




                                        //Buyer
                                        var strR2;

                                        if (tag3.items && tag3.items !== "" && tag3.items !== "aucun") {
                                            if (tag3.items.includes(`${itemSearch}/`)) {
                                                let item_a = tag3.items.split(",")
                                                let item_b = item_a.filter(item => item.startsWith(`${itemSearch}/`)).toString()
                                                let item = item_b.split("/");
                                                
                                                item[1] = parseInt(item[1]) + nombre;
                                                item[2] = actualTime;
                    
                                                var strR2 = item_a.filter(item => !item.startsWith(`${itemSearch}/`)).toString();
                                                if (!strR2) strR2 = item.toString().replace(/,/g,"/");
                                                else strR2 = strR2 + "," + item.toString().replace(/,/g,"/");
                    
                                            } else {
                                                strR2 = tag3.items + "," + `${itemSearch}/${nombre}/${actualTime}`
                                            }
                                        
                                        } else {
                                            strR2 = `${itemSearch}/${nombre}/${actualTime}`
                                        }

                                        await TagsEconomyUsers.update({items: strR2}, { where: { GUID: TargetGUID } });
                                        await TagsEconomyUsers.update({money: `${parseInt(tag3.money.split(",")[0]) - montant},${tag.money.split(",")[1]}`}, { where: { GUID: TargetGUID } });



                                        //Confirmation
                                        const embed = new MessageEmbed().setColor("GREEN").setDescription(`${nombre} ${itemSearch} ont été vendus par ${membre} à ${target} pour <:NitsuCoin:984446683284910080> ${montant}`);
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
                        const embed = new MessageEmbed().setColor("DARK_RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Vous ne possédez pas ${nombre} ${itemSearch}`);
                        interaction.reply({embeds: [embed]});
                    }


                } 







                else if (action === "use") {
                    
                    const membre = interaction.member;
                    const nombre = Math.abs(interaction.options.getInteger("quantité")) || 1;
                    
                    const GUID = interaction.guild.id + "-" + membre.id;

                    
                    var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                    const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                    
                    if (!tag) {
                        tag = await TagsEconomyUsers.create({ GUID: GUID,});
                    }

                    const item = tag2.items.split(",").filter(item => item.startsWith(`${itemSearch}/`));

                    if (item.length !== 1) return interaction.reply({embeds: [embednotfound]});

                    const itemInfos = item.toString().split("/");

                    if (tag.items && tag.items !== "" && tag.items !== "aucun" && tag.items.includes(`${itemSearch}/`) && parseInt(tag.items.substring(tag.items.indexOf(`${itemSearch}/`) + itemSearch.length + 1)) >= nombre) {

                        
                        
                        let itemPossesed = tag.items.split(",").filter(item => item.startsWith(`${itemSearch}/`)).toString().split("/");
                        var strR;

                        
                        if (itemInfos[3] !== "skip" && (parseInt(itemPossesed[2]) + parseInt(itemInfos[3]) < actualTime)) {
                            
                            strR = tag.items.split(",").filter(item => !item.startsWith(`${itemSearch}/`)).toString();

                            await TagsEconomyUsers.update({items: strR}, { where: { GUID: GUID } });

                            const embedTO = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Cet objet a déjà expiré depuis que vous l’avez acheté ! Vous ne le possédez plus !");
                            interaction.reply({embeds: [embedTO]});    
                            
                        } else {

                            itemPossesed[1] = parseInt(itemPossesed[1]) - nombre;
    
                            if (isNeg(itemPossesed[1]) || itemPossesed[1] === 0) {
                            
                                strR = tag.items.split(",").filter(item => !item.startsWith(`${itemSearch}/`)).toString();
                                
                            } else {
                                strR = tag.items.split(",").filter(item => !item.startsWith(`${itemSearch}/`)).toString();
                                if (!strR) strR = itemPossesed.toString().replace(/,/g,"/");
                                else strR = strR + "," + itemPossesed.toString().replace(/,/g,"/");
                            }

                            await TagsEconomyUsers.update({items: strR}, { where: { GUID: GUID } });

                            var description = `<:NitsuGreenTickRound:977520117216862239> ${membre} a utilisé ${nombre} ${itemSearch}`;

                            if (itemInfos[7] !== "skip") {
                                const roletoadd = interaction.guild.roles.cache.get(itemInfos[7]);
                                membre.roles.add(roletoadd);
                                description += ` et a obtenu le rôle ${roletoadd}`;
                            }
                            if (itemInfos[8] !== "skip") {
                                const roletoadd = interaction.guild.roles.cache.get(itemInfos[8]);
                                membre.roles.remove(roletoadd);
                                description += ` et a perdu le rôle ${roletoadd}`;
                            }

                            const embedR = new MessageEmbed().setColor("GREEN").setDescription(description);
                            interaction.reply({embeds: [embedR]});
                        }

                    }

                }


            } else {
                const embedN = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");
                interaction.reply({embeds : [embedN]});
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
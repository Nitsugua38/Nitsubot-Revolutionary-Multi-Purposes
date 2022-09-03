const { TagsEnterprisesGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js")

module.exports = {
    EnterprisesCmdName: "add-enterprise",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’entreprises");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");
        const embedN = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun matériau ni objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer d’abord !");

        
        const filterUser = response => {
            if (response.member.id === interaction.user.id) return true
            
        };
        const filterAmount = response => {
            if (response.author.id === interaction.user.id && !isNaN(parseInt(response.content))) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };
        const filterMaterial = response => {
            const nombre = Math.abs(parseInt(response.content));
            const objet = response.content.substring(response.content.indexOf(`${nombre} `) + nombre.toString().length + 1);
            if (response.author.id === interaction.user.id && ( (nombre && objet) || response.content === "skip" )) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };


        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
        if (tag2?.features?.startsWith("on")) {

            

            const embedName = new MessageEmbed().setColor("#EBECF0").setTitle(":one: Nom").setDescription("Quel nom voulez-vous donner à votre entreprise ? \n\n*Celui-ci ne devrait pas commencer par un chiffre et ne **doit pas** inclure le nom d’une autre entreprise*\n:warning: Une entreprise ne pourra pas être modifiée mais seulement supprimée après sa création !");
            const embedDescription = new MessageEmbed().setColor("#EBECF0").setTitle(":two: Description").setDescription("Quel description voulez-vous donner à votre entreprise ? Max : 500 caractères");
            const embedMaterials = new MessageEmbed().setColor("#EBECF0").setTitle(":three: Matériaux produits").setDescription(`Quel matériau sera produit par cette entreprise ? (Vous déciderez de sa quantité à la prochaine étape)`);
            const embedNumber = new MessageEmbed().setColor("#EBECF0").setTitle(":four: Quantité de matériaux produits").setDescription(`Quel quantité de ce matériau sera produite ? (Vous déciderez de sa fréquence à la prochaine étape)`);
            const embedTime = new MessageEmbed().setColor("#EBECF0").setTitle(":five: Définir le Cooldown en heures").setDescription("Quelle intervalle de temps (en h) voulez-vous définir entre chaque production ?");
            const embedPrice = new MessageEmbed().setColor("#EBECF0").setTitle(":six: Définir le prix (1/3) : en monnaie").setDescription("Quel prix voulez-vous définir en argent pour acheter cette entreprise ?");
            const embedPrice2 = new MessageEmbed().setColor("#EBECF0").setTitle(":seven: Définir le prix (2/3) : en matériau").setDescription("Additionnée au prix en argent, quelle quantité d’un matériau sera nécessaire (**1 seul type de matériau**) pour acheter cette entreprise ? \n\n**Syntaxe :** `<quantité> <matériau>` ou `skip` pour qu’elle ne coûte aucun matériau");
            const embedPrice3 = new MessageEmbed().setColor("#EBECF0").setTitle(":eight: Définir le prix (3/3) : en objet").setDescription("Additionnée au prix en argent et en matériau, quelle quantité d’un objet sera nécessaire (**1 seul type d’objet**) pour acheter cette entreprise ? \n\n**Syntaxe :** `<quantité> <objet>` ou `skip` pour qu’elle ne coûte aucun objet");

            if (!tag2.materials || tag2.materials === "") return interaction.reply({embeds : [embedN]});
            if (!tag2.items || tag2.items === "") return interaction.reply({embeds : [embedN]});



            await interaction.reply({embeds: [embedName]});
            interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                
                const name = collected.first().content.substring(0, 50).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"");

                await interaction.channel.send({embeds: [embedDescription]});
                interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                .then(async collected => {
                    
                    const description = collected.first().content.substring(0, 500).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"");

                    
                    
                    
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
    
                    await interaction.channel.send({embeds: [embedMaterials], components: rows})
                    interaction.channel.awaitMessageComponent({ filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                        .then(async interaction => {

                            const material = interaction.values[0];


                            await interaction.reply({embeds: [embedNumber]});
                            interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                            .then(async collected => {
                                
                                const number = Math.abs(parseInt(collected.first().content));
        
                                
                                await interaction.channel.send({embeds: [embedTime]})
                                interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                                    .then(async collected => {
                                        
                                        const time = Math.abs(parseInt(collected.first().content));


                                        await interaction.channel.send({embeds: [embedPrice]})
                                        interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                                            .then(async collected => {
                                                
                                                const amount = Math.abs(parseInt(collected.first().content));


                                                await interaction.channel.send({embeds: [embedPrice2]})
                                                interaction.channel.awaitMessages({filter: filterMaterial, max: 1, time: 60000, errors: ['time'] })
                                                    .then(async collected => {
                                                        
                                                        const nombreMaterial = Math.abs(parseInt(collected.first().content.substring(collected.first().content.indexOf(">")+1))) || "skip";
                                                        const MaterialReq = nombreMaterial === "skip" ? "skip" : collected.first().content.substring(collected.first().content.indexOf(`${nombreMaterial} `) + nombreMaterial.toString().length + 1);

                                                        

                                                        const item22 = tag2.materials?.split(",").filter(item => item.startsWith(`${MaterialReq}/`));

                                                        const embednotfound = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Non trouvé / Imprécis").setDescription(`Soit ce matériau n’existe pas (veuillez d’abord le créer) soit plusieurs matériaux commençants avec le même nom ont été trouvés : \`${MaterialReq}\` Veuillez réessayez avec le nom exact ! (Avez-vous fait attention aux majuscules ?)`);
                                                        if (MaterialReq !== "skip" && item22.length !== 1) return interaction.channel.send({embeds: [embednotfound]});




                                                        await interaction.channel.send({embeds: [embedPrice3]})
                                                        interaction.channel.awaitMessages({filter: filterMaterial, max: 1, time: 60000, errors: ['time'] })
                                                            .then(async collected => {
                                                                
                                                                const nombreObjet = Math.abs(parseInt(collected.first().content.substring(collected.first().content.indexOf(">")+1))) || "skip";
                                                                const objetReq = nombreObjet === "skip" ? "skip" : collected.first().content.substring(collected.first().content.indexOf(`${nombreObjet} `) + nombreObjet.toString().length + 1);



                                                                const item23 = tag2.items?.split(",").filter(item => item.startsWith(`${objetReq}/`));

                                                                const embednotfound2 = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Non trouvé / Imprécis").setDescription(`Soit cet objet n’existe pas (veuillez d’abord le créer) soit plusieurs matériaux commençants avec le même nom ont été trouvés : \`${objetReq}\` Veuillez réessayez avec le nom exact ! (Avez-vous fait attention aux majuscules ?)`);
                                                                if (objetReq !== "skip" && item23.length !== 1) return interaction.channel.send({embeds: [embednotfound2]});





                                                                var strR;
        
                                                                if (tag2.enterprises && tag2.enterprises !== "") {
                                                                    strR = tag2.enterprises + "," + name + "/" + description + "/" + material + "/" + number + "/" + time + "/" + amount + "/" + nombreMaterial + "/" + MaterialReq + "/" + nombreObjet + "/" + objetReq;
                                                                
                                                                } else {
                                                                    strR = name + "/" + description + "/" + material + "/" + number + "/" + time + "/" + amount + "/" + nombreMaterial + "/" + MaterialReq + "/" + nombreObjet + "/" + objetReq;
                                                                }
                                        
                                        
                                                                const embedAlreadyIn = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Vous avez déjà créé une entreprise avec le même nom !").setDescription("Pour la modifier ou la supprimer, faites la commande `/admin-enterprises Modifier une entreprise`");
                                                                if (tag2.enterprises && tag2.enterprises !== "" && tag2.enterprises?.split(",").filter(item => item.startsWith(`${name}/`)).length !== 0) return interaction.followUp({embeds: [embedAlreadyIn]});
                                        
                                                                const embedMax = new MessageEmbed().setColor("RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Pour des raisons de performance et de limitations, seul 90 entreprises peuvent être crées par serveur ! Essayez d’en supprimer`);
                                                                if (strR.split(",").length >= 90) return interaction.followUp({embeds: [embedMax]});
                                                                
                                        
                                        
                                                                
                                                                const embed = {
                                                                    color: "GREEN",
                                                                    title: `<:NitsuGreenTickRound:977520117216862239> Entreprise créée : ${name}`,
                                                                    description: description,
                                                                    fields: [
                                                                        {name: "Prix", value: `<:NitsuCoin:984446683284910080> ${amount}`, inline: true},
                                                                        MaterialReq === "skip" ? {name: "Matériau requis", value: `Aucun`, inline: true} : {name: "Matériau requis", value: `${nombreMaterial} ${MaterialReq}`, inline: true},
                                                                        objetReq === "skip" ? {name: "Objet requis", value: `Aucun`, inline: true} : {name: "Objet requis", value: `${nombreObjet} ${objetReq}`, inline: true},
                                                                        
                                                                        {name: "\u200B", value: "\u200B", inline: true}, 
                                                                        {name: "Production", value: `${number} ${material} toutes les ${time} heure(s)`, inline: true},
                                                                        {name: "\u200B", value: "\u200B", inline: true}, 
                                                                    ],
                                                                };
                                                                interaction.followUp({embeds: [embed]});
                                                                await TagsEnterprisesGuilds.update({enterprises: strR}, { where: { guildId: interaction.guild.id } });

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
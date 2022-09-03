const { TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    EcoCmdName: "create-item",
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

            

            const embedName = new MessageEmbed().setColor("#EBECF0").setTitle(":one: Nom").setDescription("Quel nom voulez-vous donner à votre objet ? \n\n*Celui-ci ne devrait pas commencer par un chiffre*");
            const embedDescription = new MessageEmbed().setColor("#EBECF0").setTitle(":two: Description").setDescription("Quel description voulez-vous donner à votre objet ? Max : 500 caractères");
            const embedPrice = new MessageEmbed().setColor("#EBECF0").setTitle(":three: Prix").setDescription("Quel sera le prix de l’objet");
            const embedTime = new MessageEmbed().setColor("#EBECF0").setTitle(":four: Durée en heures").setDescription("Pendant combien de temps (en h) l’objet pourra-t-il être utilisé après achat ? \n\nRépondez `skip` pour illimité");
            const embedStock = new MessageEmbed().setColor("#EBECF0").setTitle(":five: Stock").setDescription("Combien de ces objets seront disponibles ? \n\nRépondez `skip` pour illimité");
            const embedRequired = new MessageEmbed().setColor("#EBECF0").setTitle(":six: Rôle requis / Monnaie requise").setDescription("Y a-t-il un rôle nécessaire **et/ou** faut-il posséder une certaine somme d’argent avant de pouvoir acheter ? \n\nSyntaxe : `<@role> <montant>` ou `skip skip` pour aucune restriction");
            const embedGivenRemoved = new MessageEmbed().setColor("#EBECF0").setTitle(":seven: Rôle donné / Rôle supprimé").setDescription("Faut-il donner **et/ou** supprimer un rôle lorsque cet objet est *utilisé* ? \n\nSyntaxe : `<@role> <@role>` ou `skip skip` pour aucun");

            await interaction.reply({embeds: [embedName]});
            interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const name = collected.first().content.substring(0, 50).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"");

                await interaction.channel.send({embeds: [embedDescription]});
                interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                .then(async collected => {
                    const description = collected.first().content.substring(0, 500).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"");

                    await interaction.channel.send({embeds: [embedPrice]});
                    interaction.channel.awaitMessages({filter: filterAmount, max: 1, time: 60000, errors: ['time'] })
                    .then(async collected => {
                        const price = Math.abs(parseInt(collected.first().content));

                        await interaction.channel.send({embeds: [embedTime]});
                        interaction.channel.awaitMessages({filter: filterAmountOrSkip, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {
                            var time;
                            if (Math.abs(parseInt(collected.first().content))) time = 3600 * Math.abs(parseInt(collected.first().content));
                            else time = "skip";

                            await interaction.channel.send({embeds: [embedStock]});
                            interaction.channel.awaitMessages({filter: filterAmountOrSkip, max: 1, time: 60000, errors: ['time'] })
                            .then(async collected => {
                                const stock = Math.abs(parseInt(collected.first().content)) || "skip";
                
                                await interaction.channel.send({embeds: [embedRequired]});
                                interaction.channel.awaitMessages({filter: filterRoleAmount, max: 1, time: 60000, errors: ['time'] })
                                .then(async collected => {
                                    const rolereq = collected.first().mentions.roles?.first()?.id || "skip";
                                    var cut = collected.first().content.indexOf(">");
                                    if (cut === -1) cut = 3
                                    const balreq = Math.abs(parseInt(collected.first().content.substring(cut+1))) || "skip";
                
                                    await interaction.channel.send({embeds: [embedGivenRemoved]});
                                    interaction.channel.awaitMessages({filter: filterRoleRole, max: 1, time: 60000, errors: ['time'] })
                                    .then(async collected => {
                                        const rolegiven = collected.first().mentions.roles?.first()?.id || "skip";
                                        const roleremoved = collected.first().mentions.roles?.first(2)[1]?.id || "skip";


                                        var strR;

                                        if (tag2.items && tag2.items !== "") {
                                            strR = tag2.items + "," + name + "/" + description + "/" + price + "/" + time + "/" + stock + "/" + rolereq + "/" + balreq + "/" + rolegiven + "/" + roleremoved;
                                        
                                        } else {
                                            strR = name + "/" + description + "/" + price + "/" + time + "/" + stock + "/" + rolereq + "/" + balreq + "/" + rolegiven + "/" + roleremoved;
                                        }


                                        const embedAlreadyIn = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Vous avez déjà créé un objet avec le même nom !").setDescription("Pour le modifier ou le supprimer, faites la commande `/admin-economy Modifier un objet`");
                                        if (tag2.items && tag2.items.split(",").find(item => item.startsWith(`${name}/`))) return interaction.followUp({embeds: [embedAlreadyIn]});

                                        const embedMax = new MessageEmbed().setColor("RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Pour des raisons de performance et de limitations, seul 120 salaires de rôle peuvent être crées par serveur ! Essayez d’en supprimer`);
                                        if (strR.split(",").length >= 120) return interaction.followUp({embeds: [embedMax]});
                                        


                                        const embed = {
                                            color: "GREEN",
                                            title: `<:NitsuGreenTickRound:977520117216862239> Objet créé : ${name}`,
                                            description: description,
                                            fields: [
                                                {name: "Prix", value: `<:NitsuCoin:984446683284910080> ${price}`, inline: true},
                                                {name: "\u200B", value: "\u200B", inline: true}, 
                                                {name: "\u200B", value: "\u200B", inline: true},

                                                time === "skip" ? {name: ":clock4: Temps utilisable", value: "Illimité", inline: true} : {name: ":clock4: Temps utilisable", value: `${time / 3600}h`, inline: true} , 
                                                stock === "skip" ? {name: "<:NitsuStock:988722945427910697> Stock restant", value: "Illimité", inline: true} : {name: "<:NitsuStock:988722945427910697> Stock restant", value: `${stock}`, inline: true},
                                                rolegiven === "skip" ? {name: ":inbox_tray: Rôle donné", value: "Aucun", inline: true} : {name: ":inbox_tray: Rôle donné", value: `<@&${rolegiven}>`, inline: true},

                                                rolereq === "skip" ? {name: ":clipboard: Rôle requis", value:  "Aucun", inline: true} : {name: ":clipboard: Rôle requis", value: `<@&${rolereq}>`, inline: true},
                                                balreq === "skip" ? {name: ":moneybag: Argent total requis", value: "Aucun", inline: true} : {name: ":moneybag: Argent total requis", value: `${balreq}`, inline: true},
                                                roleremoved === "skip" ? {name: ":outbox_tray: Rôle supprimé", value: "Aucun", inline: true} : {name: ":outbox_tray: Rôle supprimé", value: `<@&${roleremoved}>`, inline: true}
                                            ],
                                        };
                                        interaction.followUp({embeds: [embed]});
                                        await TagsEconomyGuilds.update({items: strR}, { where: { guildId: interaction.guild.id } });


                                    })
                                    .catch(err => {interaction.followUp({embeds: [embedcant]});});
                                })
                                .catch(err => {interaction.followUp({embeds: [embedcant]});});
                            })
                            .catch(err => {interaction.followUp({embeds: [embedcant]});});
                        })
                        .catch(err => {interaction.followUp({embeds: [embedcant]});});
                    })
                    .catch(err => {interaction.followUp({embeds: [embedcant]});});
                })
                .catch(err => {interaction.followUp({embeds: [embedcant]});});
            })
            .catch(err => {interaction.followUp({embeds: [embedcant]});});


        } else {
            interaction.channel.send({embeds: [embedNotConfig]});
        }
    }
}
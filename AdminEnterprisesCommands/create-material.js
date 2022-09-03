const { TagsEnterprisesGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    EnterprisesCmdName: "create-material",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’entreprises");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");

        
        const filterUser = response => {
            if (response.author.id === interaction.user.id) return true
            
        };
        const filterAmountOrSkip = response => {
            if (response.author.id === interaction.user.id && (!isNaN(parseInt(response.content)) || response.content === "skip")) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };


        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
        if (tag2?.features?.startsWith("on")) {

            

            const embedName = new MessageEmbed().setColor("#EBECF0").setTitle(":one: Nom").setDescription("Quel nom voulez-vous donner à votre matériau ? \n\n*Celui-ci ne devrait pas commencer par un chiffre*");
            const embedDescription = new MessageEmbed().setColor("#EBECF0").setTitle(":two: Description").setDescription("Quel description voulez-vous donner à votre matériau ? Max : 500 caractères");
            const embedPrice = new MessageEmbed().setColor("#EBECF0").setTitle(":three: Prix").setDescription("Quel sera le prix du matériau ? \n\n(Il pourra soit être produit par une **entreprise** soit acheté à ce prix). Répondez `skip` si ce matériau pourra être uniquement **produit**");

            await interaction.reply({embeds: [embedName]});
            interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const name = collected.first().content.substring(0, 50).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"");

                await interaction.channel.send({embeds: [embedDescription]});
                interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                .then(async collected => {
                    const description = collected.first().content.substring(0, 500).replace(new RegExp(",","g"),"").replace(new RegExp("/","g"),"");

                    await interaction.channel.send({embeds: [embedPrice]});
                    interaction.channel.awaitMessages({filter: filterAmountOrSkip, max: 1, time: 60000, errors: ['time'] })
                    .then(async collected => {
                        const price = Math.abs(parseInt(collected.first().content)) || "skip";

                        
                        var strR;

                        if (tag2.materials && tag2.materials !== "") {
                            strR = tag2.materials + "," + name + "/" + description + "/" + price + "/non";
                        
                        } else {
                            strR = name + "/" + description + "/" + price + "/non";
                        }


                        const embedAlreadyIn = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Vous avez déjà créé un matériau avec le même nom !").setDescription("Pour le modifier ou le supprimer, faites la commande `/admin-enterprises Modifier un matériau`");
                        if (tag2.materials && tag2.materials !== "" && tag2.materials?.split(",").filter(item => item.startsWith(`${name}/`)).length !== 0) return interaction.followUp({embeds: [embedAlreadyIn]});

                        const embedMax = new MessageEmbed().setColor("RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Pour des raisons de performance et de limitations, seul 90 matériaux peuvent être crées par serveur ! Essayez d’en supprimer`);
                        if (strR.split(",").length >= 90) return interaction.followUp({embeds: [embedMax]});
                        


                        const embed = {
                            color: "GREEN",
                            title: `<:NitsuGreenTickRound:977520117216862239> Matériau créé : ${name}`,
                            description: description,
                            fields: [
                                price === "skip" ? {name: "Prix", value: `Pas disponible à l’achat : seulement productible par une entreprise `, inline: true} : {name: "Prix", value: `<:NitsuCoin:984446683284910080> ${price}`, inline: true},
                                {name: "\u200B", value: "\u200B", inline: true}, 
                                {name: "État", value: "En abondance", inline: true},
                            ],
                        };
                        interaction.followUp({embeds: [embed]});
                        await TagsEnterprisesGuilds.update({materials: strR}, { where: { guildId: interaction.guild.id } });
                                    
                                    
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
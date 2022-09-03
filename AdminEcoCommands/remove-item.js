const { TagsEconomyGuilds, TagsEconomyUsers } = require("../index.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    EcoCmdName: "remove-item",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’économie");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien envoyé").setColor("YELLOW");

        
        const filterUser = response => {
            const membre = response.mentions.members?.first();
            const nombre = Math.abs(parseInt(response.content.substring(response.content.indexOf(">")+1)));
            const objet = response.content.substring(response.content.indexOf(`${nombre} `) + nombre.toString().length + 1);
            if (response.author.id === interaction.user.id && membre && nombre && objet) return true
            else if (response.author.id === interaction.user.id) {response.channel.send({embeds: [embedInvalid]}); return false};
        };

        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
        if (tag2?.features?.startsWith("on")) {

            const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Membre / Quantité / Objet").setDescription("À qui voulez-vous enlever quel objet ? \n**Format:** `<@membre> <quantité> <objet>`")
            interaction.reply({embeds: [embed]})
                .then(() => {
                    interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                        .then(async collected => {
                            const membre = collected.first().mentions.members.first();
                            const nombre = Math.abs(parseInt(collected.first().content.substring(collected.first().content.indexOf(">")+1)));
                            const objet = collected.first().content.substring(collected.first().content.indexOf(`${nombre} `) + nombre.toString().length + 1);
                            
                            const GUID = interaction.guild.id + "-" + membre.id;

                            
                            var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
                            const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
                            if (!tag) {
                                tag = await TagsEconomyUsers.create({ GUID: GUID,});
                            }
                               

                            const item = tag2.items.split(",").filter(item => item.startsWith(`${objet}/`));

                            const embednotfound = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Non trouvé / Imprécis").setDescription(`Soit cet objet n’existe pas (veuillez d’abord le créer) soit plusieurs objets commençants avec le même nom ont été trouvés : \`${objet}\` Veuillez réessayez avec le nom exact ! (Avez-vous fait attention aux majuscules ?)`);
                            if (item.length !== 1) return interaction.channel.send({embeds: [embednotfound]});

                            
                            var strR;

                            if (tag.items && tag.items !== "" && tag.items !== "aucun" && tag.items.includes(`${objet}/`)) {
                                
                                let item_a = tag.items.split(",")
                                let item_b = item_a.filter(item => item.startsWith(`${objet}/`)).toString()
                                let item = item_b.split("/");
                                
                                item[1] = parseInt(item[1]) - nombre;

                                if (isNeg(item[1]) || item[1] === 0) {
                                
                                    var strR = item_a.filter(item => !item.startsWith(`${objet}/`)).toString();
                                    
                                } else {
                                    var strR = item_a.filter(item => !item.startsWith(`${objet}/`)).toString();
                                    if (!strR) strR = item.toString().replace(/,/g,"/");
                                    else strR = strR + "," + item.toString().replace(/,/g,"/");
                                }


                                await TagsEconomyUsers.update({items: strR}, { where: { GUID: GUID } });

                                const embed = new MessageEmbed().setColor("GREEN").setDescription(`${nombre} ${objet} ont été retirés de l’inventaire de ${membre.displayName}`);
                                interaction.channel.send({embeds: [embed]});
                            
                            } else {
                                const embed = new MessageEmbed().setColor("DARK_RED").setDescription(`<:NitsuRedTickRound:977520171734401054> ${membre.displayName} ne possède pas cet objet : ${objet}`);
                                interaction.channel.send({embeds: [embed]});
                            }

                        })
                        .catch(err => {
                            interaction.followUp({embeds: [embedcant]});
                        });
                    });


        } else {
            interaction.channel.send({embeds: [embedNotConfig]});
        }
    }
}

function isNeg(x) {
    if (x !== Math.abs(x)) return true
    else return false
}
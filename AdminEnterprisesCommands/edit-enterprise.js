const { TagsEnterprisesGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js")

module.exports = {
    EnterprisesCmdName: "edit-enterprise",
    async exec(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Veuillez d’abord activer le système d’entreprises");
        const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré les valeurs selon le format demandé. Veuillez réessayer **cette étape** !");
        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setColor("YELLOW");

        
        const filterUser = response => {
            if (response.member.id === interaction.user.id) return true
            
        };
        


        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: interaction.guild.id } });
                            
        if (tag2?.features?.startsWith("on")) {

            if (tag2.enterprises && tag2.enterprises !== "") {
                
                const itemsArray = tag2.enterprises.split(",");

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
                    const row = new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder("Liste d’entreprises").setCustomId(`selectITEMtoEdit${i}`).addOptions(chunk));
                    rows.push(row);
                }

                const embed = new MessageEmbed().setColor("DARK_VIVID_PINK").setTitle("Entreprises").setDescription("Veuillez choisir une entreprise à modifier");
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
                                            label: "Supprimer l’entreprise",
                                            description: "Elle sera aussi supprimée pour tous les membres",
                                            value: "enDel",
                                            emoji: "<:NitsuRedTickRound:977520171734401054>"
                                        },
                                        {
                                            label: "Annuler",
                                            value: "cancel",
                                            emoji: "💡"
                                        },
                                    ])
                            );
                            const embedChose = new MessageEmbed().setColor("LUMINOUS_VIVID_PINK").setDescription("Veuillez sélectionner la valeur à modifier")
                            interaction.reply({embeds: [embedChose], components: [rowChose]})

                            .then(() => {
                                interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', filter: filterUser, max: 1, time: 60000, errors: ['time'] })
                                    .then(async interaction => {
                                        const value = interaction.values[0];

                                        let itemArray = tag2.enterprises.split(",");
                                        var str2 = itemArray.find(element => element.startsWith(`${itemName}/`));

                                        var strR = itemArray.filter(element => element !== str2).toString();
                                        

                                        if (value === "cancel") {

                                            interaction.reply({embeds: [embedcant]});
                                                       
                                        }  

                                        else {
                                            const embedReply = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Entreprise supprimée").setDescription(`L’entreprise ${itemName} a bien été supprimée !`);
                                            await interaction.reply({embeds: [embedReply]});
                                            await TagsEnterprisesGuilds.update({enterprises: strR}, { where: { guildId: interaction.guild.id } });
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
                const embedN = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucune entreprise n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer une d’abord !");
                interaction.reply({embeds : [embedN]});
            }
        } else {
            interaction.channel.send({embeds: [embedNotConfig]});
        }
    }
}
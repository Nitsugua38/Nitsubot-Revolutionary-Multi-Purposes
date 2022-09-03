const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyGuilds, TagsEconomyUsers } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Afficher l’inventaire de vos objets ou de ceux d’un membre")
        .addUserOption(option => option.setName("membre").setDescription("Le membre dont il faut afficher l’inventaire")),
    async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");
        const embednotfounduser = new MessageEmbed().setColor("DARK_RED").setDescription(":bulb: Ce membre ne possède aucun objet !");

        
        const guildID = interaction.guild.id;
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        
        const membre = interaction.options.getMember("membre") || interaction.member;
        const GUID = guildID + "-" + membre.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        

        if (tag2?.features?.startsWith("on")) {

            if (!tag) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});
            }
        
            if (tag2.items && tag2.items !== "") {

                if (tag.items && tag.items !== "") {



                    const itemsArray = tag2.items.split(",").filter(item => tag.items.includes(`${item.substring(0, item.indexOf("/"))}/`));
                    const itemsInvalid = tag.items.split(",").filter(item => !tag2.items.includes(`${item.substring(0, item.indexOf("/"))}/`));
                
                    if (itemsInvalid.length !== 0) {
                        var newArray = tag.items.split(",").filter(item => !itemsInvalid.toString().includes(item)).toString();
                        await TagsEconomyUsers.update({items: newArray}, { where: { GUID: GUID } });
                    }

                    if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfounduser]});
    
                    var fields = [];
                    for (const item of itemsArray) {
                        var itemInfos = item.split("/");
                        var itemPossesed = tag.items.split(",").filter(item => item.startsWith(`${itemInfos[0]}/`)).toString().split("/");
    
                        let field = {name: `${itemInfos[0]} – ${itemPossesed[1]}`, value: itemInfos[1]}
                        fields.push(field);
                    }
                    const sortedFields = fields.slice(0, 10);
                            
                    const embed = {
                        color: "PURPLE",
                        title: `Inventaire de ${membre.displayName}`,
                        description: "Pour utiliser un objet, faites la commande `/item Utiliser` \nPour en savoir plus sur l’un des objets,\nfaites la commande `/item Afficher les infos`",
                        fields: sortedFields,
                    };
    
                    var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setDisabled(true).setCustomId(`ECOinv:${membre.id}:0-10`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`ECOinv:${membre.id}:10-20`));
    
                    if (fields.length <= 10) row.components[1].disabled = true;
                    
                    interaction.reply({embeds: [embed], components: [row]});




                } else {
                    interaction.reply({embeds : [embednotfounduser]});
                }

            } else {
                interaction.reply({embeds : [embednotfound]});
            }
                    
        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }

    },
};
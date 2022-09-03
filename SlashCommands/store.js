const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEnterprisesGuilds, TagsEnterprisesUsers } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("store")
        .setDescription("Afficher la boutique des objets du serveur dans le système d’entreprise"),
    async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admin-enterprises fonctionnalités` puis de cliquer pour activer !");
        const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");

        
        const guildID = interaction.guild.id;
        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: guildID } });
        
        const GUID = guildID + "-" + interaction.member.id
        var tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });

        if (!tag) {
            tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
        }

        

        if (tag2?.features?.startsWith("on")) {
        
            if (tag2.items && tag2.items !== "") {

                const itemsArray = tag2.items.split(",");

                if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});

                var fields = [];
                for (const item of itemsArray) {
                    var itemInfos = item.split("/");

                    let itemPossesed = tag.items?.split(",")?.find(item => item.startsWith(`${itemInfos[0]}/`))?.toString()?.split("/");
                    
                    var ch3 = itemPossesed ? `– ${itemPossesed[1]} Construit <:NitsuGreenTickRound:977520117216862239>` : ""

                    let field = {name: `${itemInfos[0]} ${ch3}`, value: `Matériaux requis : ${itemInfos[2].replace(/;/g, ", ").replace(/-/g, " : ")} \n*${itemInfos[1]}*`}
                    fields.push(field);
                }
                const sortedFields = fields.slice(0, 10);
                        
                const embed = {
                    color: "PURPLE",
                    title: `Boutique de ${interaction.guild.name}`,
                    description: "Pour construire un objet, faites la commande `/build`",
                    fields: sortedFields,
                };

                var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setDisabled(true).setCustomId(`eNstore:0-10`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`eNstore:10-20`));

                if (fields.length <= 10) row.components[1].disabled = true;
                
                interaction.reply({embeds: [embed], components: [row]});
                

            } else {
                interaction.reply({embeds : [embednotfound]});
            }
                    
        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }

    },
};
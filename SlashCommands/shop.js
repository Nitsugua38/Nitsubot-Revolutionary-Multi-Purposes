const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Afficher la boutique des objets du serveur dans le système d’économie"),
    async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");

        
        const guildID = interaction.guild.id;
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        

        if (tag2?.features?.startsWith("on")) {
        
            if (tag2.items && tag2.items !== "") {

                const itemsArray = tag2.items.split(",");

                if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});

                var fields = [];
                for (const item of itemsArray) {
                    var itemInfos = item.split("/");
                    itemInfos[5] = itemInfos[5] === "skip" ? "" : `+ Rôle ${interaction.guild.roles.cache.get(itemInfos[5]).name}`;
                    itemInfos[4] = itemInfos[4] === "skip" ? "" : `– <:NitsuStock:988722945427910697> ${itemInfos[4]}`;


                    let field = {name: `${itemInfos[0]} – <:NitsuCoin:984446683284910080> ${itemInfos[2]} ${itemInfos[5]} ${itemInfos[4]}`, value: itemInfos[1]}
                    fields.push(field);
                }
                const sortedFields = fields.sort(compareActions).slice(0, 10);
                        
                const embed = {
                    color: "PURPLE",
                    title: `Boutique de ${interaction.guild.name}`,
                    description: "Pour acheter un objet, faites la commande `/item Acheter` \nPour en savoir plus sur l’un des objets,\nfaites la commande `/item Afficher les infos`",
                    fields: sortedFields,
                };

                var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setDisabled(true).setCustomId("ECOshop:0-10"), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId("ECOshop:10-20"));

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

function compareActions(a, b) {
    const A = parseInt(a.name.substring(a.name.indexOf("<:NitsuCoin:984446683284910080>") + 31));
    const B = parseInt(b.name.substring(b.name.indexOf("<:NitsuCoin:984446683284910080>") + 31));
    return A - B;
}
const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEnterprisesGuilds, TagsEnterprisesUsers, TagsEconomyUsers } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("enterprise")
        .setDescription("Afficher la liste des entreprises du serveur, en acheter, revendre")
        .addStringOption(option => option.setName("action").setDescription("L’action à faire").setRequired(true).addChoice("🏬 Afficher la liste des entreprises","view").addChoice("🤝 Acheter une entreprise","buy").addChoice("💰 Revendre une entreprise","sell"))
        .addStringOption(option => option.setName("entreprise").setDescription("Le nom de l’entreprise à acheter ou revendre")),
async execute(interaction) {

        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admin-enterprises fonctionnalités` puis de cliquer pour activer !");
        const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Soit aucune entreprise n’a été créée sur le serveur soit l’entreprise spécifiée n’a pas été trouvée !");
        const embedalready = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Vous possédez déjà cette entreprise !");
        const embedDMR = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Impossible d’acheter l’entreprise : vous n’avez pas assez le cash/matériau/objets requis !");
        const embedNP = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Vous ne possédez pas cette entreprise !");


        const action = interaction.options.get("action").value;
        const enterpriseName = interaction.options.getString("entreprise");

        const guildID = interaction.guild.id;
        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: guildID } });

        const GUID = guildID + "-" + interaction.member.id

    

        var tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });
        var tag3 = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        

        if (tag2?.features?.startsWith("on")) {
        
            if (tag2.enterprises && tag2.enterprises !== "") {




                if (action === "view") {

                    if (!tag) {
                        tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                    }

                    const itemsArray = tag2.enterprises?.split(",");

                    if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});
    
                    var fields = [];
                    for (const item of itemsArray) {
                        var itemInfos = item.split("/");
                        var ch1 = itemInfos[6] === "skip" ? "" : `– ${itemInfos[6]} ${itemInfos[7]}`
                        var ch2 = itemInfos[8] === "skip" ? "" : `– ${itemInfos[8]} ${itemInfos[9]}`

                        if (tag.enterprises?.includes(",")) var ch3 = tag.enterprises?.includes(`${itemInfos[0]},`) ? `– Acquise <:NitsuGreenTickRound:977520117216862239>` : ""
                        else var ch3 = tag.enterprises === itemInfos[0] ? `– Acquise <:NitsuGreenTickRound:977520117216862239>` : ""

                        
    
                        let field = {name: `${itemInfos[0]} – Produit ${itemInfos[3]} ${itemInfos[2]} toutes les ${itemInfos[4]} heure(s) ${ch3}`, value: `Prix : <:NitsuCoin:984446683284910080> ${itemInfos[5]} ${ch1} ${ch2} \n*${itemInfos[1]}*`}
                        fields.push(field);
                    }
                    const sortedFields = fields.slice(0, 10);
                            
                    const embed = {
                        color: "PURPLE",
                        title: `Liste des entreprises de ${interaction.guild.name}`,
                        description: "Pour acheter ou revendre une entreprise, faites la commande `/enterprise`",
                        fields: sortedFields,
                    };
    
                    var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setDisabled(true).setCustomId(`eNenterprise:0-10`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`eNenterprise:10-20`));
    
                    if (fields.length <= 10) row.components[1].disabled = true;
                    
                    interaction.reply({embeds: [embed], components: [row]});
               
                }
                

                else if (action === "buy") {
                    if (!tag) {
                        tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                    }
                    if (!tag3) {
                        tag3 = await TagsEconomyUsers.create({ GUID: GUID,});
                    }

                    if (!enterpriseName) return interaction.reply({embeds: [embednotfound]})

                    const itemsArray = tag2.enterprises?.split(",");

                    if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});


                    const enterprise = tag2.enterprises.split(",").find(item => item.startsWith(`${enterpriseName}/`));
                    

                    const enterpriseInfos = enterprise.toString().split("/");


                    const enterprisesPossesed = tag.enterprises?.split(",");
                    const materialsPossesed = tag.materials?.split(",");
                    const itemsPossessed = tag.items?.split(",");

                    if (enterprisesPossesed && enterprisesPossesed !== "" && enterprisesPossesed.filter(item => item.startsWith(`${enterpriseName},`)).length !== 0) return interaction.reply({embeds: [embedalready]});
                   
                   
                    const embedtoomuch = new MessageEmbed().setColor("DARK_RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Vous avez atteint le max d’entreprises possédables sur ce serveur ! (défini sur ${tag2.maxEnterprises})`);
                    if (tag2.maxEnterprises != -1 && tag.enterprises && tag.enterprises !== "" && tag.enterprises.split(",").length >= tag2.maxEnterprises) return interaction.reply({embeds: [embedtoomuch]});

                    
                    
                    const Rmoney = parseInt(tag3.money.split(",")[0]) - parseInt(enterpriseInfos[5]);
                    var Rmatnumber;
                    var Ritemnumber;
                    var STRF;
                    var STRF2;

                    if ((enterpriseInfos[6] !== "skip" && !materialsPossesed) || (enterpriseInfos[8] !== "skip" && !itemsPossessed)) return interaction.reply({embeds: [embedDMR]})
                    
                    if (enterpriseInfos[6] !== "skip") {
                        let number = enterpriseInfos[6]
                        let material = enterpriseInfos[7]

                        
                        let materialReq = materialsPossesed.find(item => item.startsWith(`${material}/`))?.toString()?.split("/");

                        if (!materialReq) return interaction.reply({embeds: [embedDMR]});

                        let strR = materialsPossesed.filter(element => element !== materialsPossesed.find(item => item.startsWith(`${material}/`))?.toString())?.toString();

                        Rmatnumber = parseInt(materialReq[1]) - parseInt(number);

                        materialReq[1] = Rmatnumber
                        var str2 = materialReq.toString().replace(/,/g,"/");
                        if (strR) STRF = strR + "," + str2;
                        else STRF = str2;
                    }

                    if (enterpriseInfos[8] !== "skip") {
                        let number = enterpriseInfos[8]
                        let material = enterpriseInfos[9]
                        
                        let materialReq = itemsPossessed.find(item => item.startsWith(`${material}/`))?.toString()?.split("/");

                        if (!materialReq) return interaction.reply({embeds: [embedDMR]});

                        let strR = itemsPossessed.filter(element => element !== itemsPossessed.find(item => item.startsWith(`${material}/`))?.toString())?.toString();

                        Ritemnumber = parseInt(materialReq[1]) - parseInt(number);

                        materialReq[1] = Ritemnumber
                        var str2 = materialReq.toString().replace(/,/g,"/");
                        if (strR) STRF2 = strR + "," + str2;
                        else STRF2 = str2;
                    }


                    if (isNeg(Rmoney) || (enterpriseInfos[6] !== "skip" && isNeg(Rmatnumber)) || (enterpriseInfos[8] !== "skip" && isNeg(Ritemnumber))) return interaction.reply({embeds: [embedDMR]});


                    await TagsEconomyUsers.update({money: `${Rmoney},${parseInt(tag3.money.split(",")[1])}`}, { where: { GUID: GUID } });

                    if (enterpriseInfos[6] !== "skip") {
                        await TagsEnterprisesUsers.update({materials: STRF}, { where: { GUID: GUID } });
                    }
                    if (enterpriseInfos[8] !== "skip") {
                        await TagsEnterprisesUsers.update({items: STRF2}, { where: { GUID: GUID } });
                    }

                    

                    var strR;
                    if (enterprisesPossesed && enterprisesPossesed.toString() !== "") {
                        strR = enterprisesPossesed + "," + enterpriseName;
                    } else {
                        strR = enterpriseName;
                    }
                    
                    await TagsEnterprisesUsers.update({enterprises: strR}, { where: { GUID: GUID } });
                    
                    const embedreply = new MessageEmbed().setColor("GREEN").setDescription(`Vous avez acheté l’entreprise ${enterpriseName}`);
                    interaction.reply({embeds: [embedreply]});

                }








                else if (action === "sell") {
                    if (!tag) {
                        tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
                    }
                    if (!tag3) {
                        tag3 = await TagsEconomyUsers.create({ GUID: GUID,});
                    }

                    if (!enterpriseName) return interaction.reply({embeds: [embednotfound]})

                    const itemsArray = tag2.enterprises?.split(",");

                    if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});


                    const enterprise = tag2.enterprises.split(",").find(item => item.startsWith(`${enterpriseName}/`));
                    const enterpriseInfos = enterprise.toString().split("/");

                    
                    if (!tag.enterprises) return interaction.reply({embeds: [embedNP]});

                    if (!tag.enterprises?.includes(enterpriseName)) return interaction.reply({embeds: [embedNP]});

                    
                    var enterprisesPossesed = tag.enterprises.split(",").filter(element => element !== tag.enterprises.split(",").find(item => item.startsWith(enterpriseName))?.toString())?.toString();

                    
                    await TagsEconomyUsers.update({money: `${parseInt(tag3.money.split(",")[0]) + parseInt(enterpriseInfos[5])},${parseInt(tag3.money.split(",")[1])}`}, { where: { GUID: GUID } });

                    await TagsEnterprisesUsers.update({enterprises: enterprisesPossesed}, { where: { GUID: GUID } });
                    
                    const embedreply = new MessageEmbed().setColor("GREEN").setDescription(`Vous avez revendu l’entreprise ${enterpriseName} pour <:NitsuCoin:984446683284910080> ${enterpriseInfos[5]}`).setFooter({text: "Les matériaux et objets ne sauraient être remboursés"});
                    interaction.reply({embeds: [embedreply]});

                }

            } else {
                interaction.reply({embeds : [embednotfound]});
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
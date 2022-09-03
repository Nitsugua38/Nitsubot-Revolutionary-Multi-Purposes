const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("pile-ou-face")
        .setDescription("Jouer à pile ou face avec un autre membre ou seul pour tenter de gagner le double de votre mise !")
        .addIntegerOption(option => option.setName("mise").setDescription("Le montant que vous et l’autre joueur pariez").setRequired(true))
        .addUserOption(option => option.setName('membre').setDescription("Le membre avec qui vous voulez jouer")),
    async execute(interaction) {
    
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        const embedNope = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTick:939475841803505664> Action impossible").setDescription("Vous ou le membre cible n’a pas assez de cash !");
        const embedDisabled = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Commande désactivée").setDescription("Cette commande est désactivée. Demandez à un modérateur de faire la commande `/admin-economy Fonctionnalités` !")


        var amount = Math.abs(parseInt(interaction.options.getInteger("mise")));
        var user = interaction.options.getMember("membre");
        var first = interaction.member;

        if (!user) user = "bot";
        if (user.id === interaction.member.id) user = "bot";


        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;
        const TargetGUID = guildID + "-" + user?.id;

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        
    
        
        if (tag) {
            if (tag2?.features?.startsWith("on")) {

                if (tag2.features.split(",")[5] === "off") return interaction.reply({embeds: [embedDisabled]});

                if (parseInt(tag.money.split(",")[0]) < amount) return interaction.reply({embeds: [embedNope]});

                var j1; 
                var j2;

                if (randomIntFromInterval(1,2) === 1) { j1 = amount * 2; j2 = - (amount * 2) }
                else { j1 = - (amount * 2); j2 = amount * 2 };




                if (user === "bot") {
                    var embedReply;
                    
                    if (isNeg(j1)) embedReply = new MessageEmbed().setColor("RED").setTitle("Perdu !").setDescription(`<:NitsuCoin:984446683284910080> ${j1} \nVous aurez peut-être plus de chance la prochaine fois !`).setThumbnail("https://i.imgur.com/ljmp5il.png")
                    else embedReply = new MessageEmbed().setColor("GREEN").setTitle("Gagné !").setDescription(`<:NitsuCoin:984446683284910080> ${j1}`).setThumbnail("https://cdn.discordapp.com/emojis/984446683284910080.webp?size=256&quality=lossless");
                    
                    interaction.reply({embeds: [embedReply]});
                
                    await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + j1},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
                }



                else {
                    var tag3 = await TagsEconomyUsers.findOne({ where: { GUID: TargetGUID } });
                    if (!tag3 || tag3?.money?.split(",")[0] < amount) return interaction.reply({embeds: [embedNope]});

                    const ask = new MessageEmbed().setColor("BLUE").setTitle("Voulez vous jouer à pile ou face ?").setDescription(`Mise : <:NitsuCoin:984446683284910080> ${amount} \nAvec : ${interaction.member}`);
                    const row = new MessageActionRow().addComponents(new MessageButton().setLabel("Jouer").setStyle("SUCCESS").setCustomId("pileoufaceyes"), new MessageButton().setLabel("Refuser").setStyle("DANGER").setCustomId("pileoufaceno"));

                    await interaction.reply({content: `${user}`, embeds: [ask], components: [row]});


                    const filterUser2 = response => {
                        return response.user.id === user.id
                    };


                    interaction.channel.awaitMessageComponent({filter: filterUser2, componentType: "BUTTON", max: 1, time: 120000, errors: ['time'] })
                    .then(async interaction => {

                        if (interaction.customId === "pileoufaceyes") {

                            var embedReply = [];
                    
                            if (isNeg(j1)) embedReply = [new MessageEmbed().setColor("RED").setTitle(`${first.displayName} a perdu !`).setDescription(`<:NitsuCoin:984446683284910080> ${j1} \nVous aurez peut-être plus de chance la prochaine fois !`).setThumbnail("https://i.imgur.com/ljmp5il.png"), new MessageEmbed().setColor("GREEN").setTitle(`${interaction.member.displayName} a gagné !`).setDescription(`<:NitsuCoin:984446683284910080> ${j2}`).setThumbnail("https://cdn.discordapp.com/emojis/984446683284910080.webp?size=256&quality=lossless") ]
                            else embedReply = [new MessageEmbed().setColor("GREEN").setTitle(`${first.displayName} a gagné !`).setDescription(`<:NitsuCoin:984446683284910080> ${j1}`).setThumbnail("https://cdn.discordapp.com/emojis/984446683284910080.webp?size=256&quality=lossless"), new MessageEmbed().setColor("RED").setTitle(`${interaction.member.displayName} a perdu !`).setDescription(`<:NitsuCoin:984446683284910080> ${j2} \nVous aurez peut-être plus de chance la prochaine fois !`).setThumbnail("https://i.imgur.com/ljmp5il.png")];
                            
                            interaction.reply({embeds: embedReply});
                        
                            await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + j1},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
                            await TagsEconomyUsers.update({money: `${parseInt(tag3.money.split(",")[0]) + j2},${parseInt(tag3.money.split(",")[1])}`}, { where: { GUID: TargetGUID } });
                            
                        } else {
                            const embedCancel = new MessageEmbed().setColor("YELLOW").setTitle(`:bulb: Lancer annulé, le membre a refusé !`);
                            interaction.reply({embeds: [embedCancel]})
                        }
                    })
                    .catch(err => {
                        const embedCancel = new MessageEmbed().setColor("YELLOW").setTitle(`:bulb: Lancer annulé, le membre n’a pas répondu !`);
                        interaction.followUp({embeds: [embedCancel]})
                    });

                }





                
                

            } else {
                interaction.reply({embeds: [embedNotConfig]});
            }
        } else {
            const embed = new MessageEmbed().setColor("GOLD").setTitle(`<:NitsuRedTickRound:977520171734401054> Action impossible`).setDescription("Vous n’avez pas de cash !");
            interaction.reply({embeds: [embed]});
        }

    },
};


function isNeg(x) {
    if (x !== Math.abs(x)) return true
    else return false
}

function randomIntFromInterval(mina, maxa) { 
    return Math.floor(Math.random() * (maxa - mina + 1) + mina)
}
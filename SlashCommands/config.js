const { SlashCommandBuilder } = require("@discordjs/builders");
const { Tags } = require("../index.js");
const { Permissions } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Configure la base de données du bot")
        .addStringOption(option => option
            .setName('arg')
            .setDescription("Ce qu’il faut configurer")
            .setRequired(true)
            .addChoice("tempchannel", "tempchannel")
            .addChoice("replies", "replies")
            .addChoice("contact", "contact")),
    async execute(interaction) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS)){
            const guildID = interaction.guild.id;
            const tagtoinit = await Tags.findOne({ where: { guildid: guildID } });
            if (tagtoinit) {
                const argoption = interaction.options.get('arg').value;
                if (argoption === "tempchannel"){
                    interaction.reply(`${interaction.member} Veuillez tapez le nom exact de la catégorie où créer les Temp Channels (SANS guillemets ni autre!)`)
                    .then(() => {
                        interaction.channel.awaitMessages({ max: 1, time: 60000, errors: ['time'] })
                            .then(collected => {
                                const categorytoadd = collected.first();
                                const categoryName = interaction.guild.channels.cache.find(channel => channel.name == `${categorytoadd}` && channel.type == "GUILD_CATEGORY");
                                if (categoryName) {
                                    Tags.update({tccateg: categoryName.id}, { where: { guildid: guildID } });
                                    interaction.followUp(`:white_check_mark: ${categoryName} a bien été défini pour les Temp Channels.`);
                                } else {interaction.followUp(":x: Erreur : Impossible d’assigner cette catégorie. Peut-être qu’elle n’existe pas !");}
                            })
                            .catch(collected => {interaction.followUp(':x: Erreur : Temps écoulé, commande annulée');});
                    });
                } else {interaction.reply("Fonctionnalité à venir !")}
            } else {interaction.reply(":negative_squared_cross_mark: Erreur, la base de données du bot n’a pas encore été initialisée ! Tapez `/setup` pour réparer.")}
        } else {interaction.reply(":negative_squared_cross_mark: Vous ne pouvez pas configurer la base de données du bot car vous n’avez pas la permission de gérer les salons !");}
    },
};
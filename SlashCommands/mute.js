const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
const { client } = require("..");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Empêche quelqu’un de parler pendant un temps défini")
        .addUserOption(option => option.setName('membre').setDescription("L’utilisateur à mute").setRequired(true))
        .addIntegerOption(option => option.setName('temps').setDescription("Le temps en MINUTES").setRequired(true))
        .addStringOption(option => option.setName('raison').setDescription("La raison pour laquelle l’utilisateur est mute")),
    async execute(interaction, ImportedMember) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {

            const usertomute = interaction.options?.getMember('membre') || interaction.guild.members.cache.get(ImportedMember);
            const timetomute = interaction.options?.getInteger('temps') * 60000 || 3600000;
            const reason = interaction.options?.getString('raison')?.substring(0,3000) || "Aucune raison donnée";

            const embedinvalid = new MessageEmbed().setColor("RED").setTitle("Valeur incorrecte").setDescription("Veuillez rentrer une valeur comprise entre 1 et 10080 (1 semaine)");
            if ((timetomute / 60000) > 10080 || (timetomute / 60000) < 1) return interaction.reply({embeds: [embedinvalid]});

            if ((interaction.member.roles.highest.position > usertomute.roles.highest.position || interaction.member.id === interaction.guild.ownerId) && client.guilds.cache.get(interaction.guild.id).me.roles.highest.position > usertomute.roles.highest.position) {
                
                usertomute.timeout(timetomute);

                const embedok = new MessageEmbed().setColor("RED").setTitle(`:mute: ${usertomute.user.tag} a été mute pour ${(timetomute / 60000)} minutes`).setDescription(`par ${interaction.user}`).setThumbnail(`${usertomute.displayAvatarURL({dynamic: true})}`).addField(':memo: Raison', `${reason}`, true);
                interaction.reply({embeds: [embedok]});
            
            } else {
                const embedcannotkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Mute refusé").setDescription("Le membre que vous essayer de mute est supérieur à vous ou à moi dans la hiérarchie (pensez à placer le rôle du bot le plus haut possible).").setColor("DARK_RED");
                interaction.reply({embeds: [embedcannotkick]});
            }

            
        } else {
            const embedcantkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Permission manquante").setDescription("Modérer les membres").setColor("DARK_RED");
            interaction.reply({embeds: [embedcantkick]});
        };
    },
};
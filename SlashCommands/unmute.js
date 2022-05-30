const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
const { client } = require("..");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Réautorise quelqu’un à parler")
        .addUserOption(option => option.setName('membre').setDescription("L’utilisateur à unmute").setRequired(true)),
        async execute(interaction) {
            if (interaction.memberPermissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
    
                const usertomute = interaction.options.getMember('membre');
    
                if ((interaction.member.roles.highest.position > usertomute.roles.highest.position || interaction.member.id === interaction.guild.ownerId) && client.guilds.cache.get(interaction.guild.id).me.roles.highest.position > usertomute.roles.highest.position) {
                    
                    usertomute.timeout(0);
    
                    const embedok = new MessageEmbed().setColor("RED").setTitle(`:loud_sound: ${usertomute.user.tag} a été réautorisé à parler`).setDescription(`par ${interaction.user}`).setThumbnail(`${usertomute.displayAvatarURL({dynamic: true})}`);
                    interaction.reply({embeds: [embedok]});
                
                } else {
                    const embedcannotkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Unmute refusé").setDescription("Le membre que vous essayer d’unmute est supérieur à vous ou à moi dans la hiérarchie (pensez à placer le rôle du bot le plus haut possible).").setColor("DARK_RED");
                    interaction.reply({embeds: [embedcannotkick]});
                }
    
                
            } else {
                const embedcantkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Permission manquante").setDescription("Modérer les membres").setColor("DARK_RED");
                interaction.reply({embeds: [embedcantkick]});
            };
        },
    };
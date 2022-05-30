const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
const { client } = require("..");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Banni quelqu’un en lui envoyant un message")
        .addUserOption(option => option.setName('membre').setDescription("L’utilisateur à bannir").setRequired(true))
        .addStringOption(option => option.setName('message').setDescription("Le message à lui envoyer")),
    async execute(interaction) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            const usertokick = interaction.options.getUser('membre');
            const messagetosend = interaction.options.getString('message')?.substring(0,3000) || "Aucun message";

            if (usertokick) {
                const targetMember = interaction.guild.members.cache.get(usertokick.id);

                if ((interaction.member.roles.highest.position > targetMember.roles.highest.position || interaction.member.id === interaction.guild.ownerId) && client.guilds.cache.get(interaction.guild.id).me.roles.highest.position > targetMember.roles.highest.position) {
                    const embedok = new MessageEmbed().setColor("RED").setTitle(`${usertokick.tag} a été banni`).setDescription(`par ${interaction.user}`).setThumbnail(`${usertokick.displayAvatarURL({dynamic: true})}`).addField(':envelope: Message envoyé à l’utilisateur', `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                    const embedtosend = new MessageEmbed().setColor("RED").setTitle(`<:NitsuRedTick:939475841803505664> Vous avez été banni de ${interaction.guild.name}`).setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField(':envelope: Message : ', `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                    const embederrsend = new MessageEmbed().setTitle("<:NitsuRedTick:939475841803505664> Impossible d’envoyer le message").setDescription("L’utilisateur a bloqué les DM").setColor("DARK_RED");
                    const embederrkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Impossible de bannir le membre").setColor("RED");

                    targetMember.send({embeds: [embedtosend] }).catch(error => {
                        interaction.channel.send({embeds: [embederrsend]});
                    });

                    targetMember.roles.remove(targetMember.roles.cache).then(() => {
                        targetMember.ban()
                            .then(() => {
                                interaction.reply({embeds: [embedok] });
                            })
                            .catch(error => {
                                interaction.reply({embeds: [embederrkick]});
                            });
                    });
                } else {
                    const embedcannotkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Bannissement refusé").setDescription("Le membre que vous essayer de bannir est supérieur à vous ou à moi dans la hiérarchie (pensez à placer le rôle du bot le plus haut possible).").setColor("DARK_RED");
                    interaction.reply({embeds: [embedcannotkick]});
                }
            }  
        } else {
            const embedcantkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Permission manquante").setDescription("Bannir des membres").setColor("DARK_RED");
            interaction.reply({embeds: [embedcantkick]});
        };
    },
};
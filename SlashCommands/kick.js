const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
const { client } = require("..");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Expulse quelqu’un en lui envoyant un message")
        .addUserOption(option => option.setName('membre').setDescription("L’utilisateur à expulser").setRequired(true))
        .addStringOption(option => option.setName('message').setDescription("Le message à lui envoyer")),
    async execute(interaction, ImportedMember) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            const usertokick = interaction.options?.getMember('membre') || interaction.guild.members.cache.get(ImportedMember);

            const messagetosend = interaction.options?.getString('message')?.substring(0,3000) || "Aucun message";

            if (usertokick) {
                const targetMember = usertokick;

                if ((interaction.member.roles.highest.position > targetMember.roles.highest.position || interaction.member.id === interaction.guild.ownerId) && client.guilds.cache.get(interaction.guild.id).me.roles.highest.position > targetMember.roles.highest.position) {
                    const embedok = new MessageEmbed().setColor("YELLOW").setTitle(`${usertokick.user.tag} a été expulsé`).setDescription(`par ${interaction.user}`).setThumbnail(`${usertokick.displayAvatarURL({dynamic: true})}`).addField(':envelope: Message envoyé à l’utilisateur', `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                    const embedtosend = new MessageEmbed().setColor("YELLOW").setTitle(`<:NitsuRedTick:939475841803505664> Vous avez été expulsé de ${interaction.guild.name}`).setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField(':envelope: Message : ', `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                    const embederrsend = new MessageEmbed().setTitle("<:NitsuRedTick:939475841803505664> Impossible d’envoyer le message").setDescription("L’utilisateur a bloqué les DM").setColor("DARK_RED");
                    const embederrkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Impossible d’expulser le membre").setColor("RED");

                    targetMember.send({embeds: [embedtosend] }).catch(error => {
                        interaction.channel.send({embeds: [embederrsend]});
                    });

                    targetMember.roles.remove(targetMember.roles.cache).then(() => {
                        targetMember.kick()
                            .then(() => {
                                interaction.reply({embeds: [embedok] });
                            })
                            .catch(error => {
                                interaction.reply({embeds: [embederrkick]});
                            });
                    });
                } else {
                    const embedcannotkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Expulsion refusée").setDescription("Le membre que vous essayer d’expulser est supérieur à vous ou à moi dans la hiérarchie (pensez à placer le rôle du bot le plus haut possible).").setColor("DARK_RED");
                    interaction.reply({embeds: [embedcannotkick]});
                }
            }  
        } else {
            const embedcantkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Permission manquante").setDescription("Expulser des membres").setColor("DARK_RED");
            interaction.reply({embeds: [embedcantkick]});
        };
    },
};
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Banni quelqu’un en lui envoyant un message")
        .addUserOption(option => option.setName('cible').setDescription("L’utilisateur à bannir").setRequired(true)),
    async execute(interaction) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            var noerroroccured = true;
            const usertokick = interaction.options.getUser('cible');
            if (usertokick) {
            const usertokickid = usertokick.id;
            interaction.reply(`${interaction.user} Tapez le message à envoyer à l’utilisateur à bannir : raison ou autres (Max : 1000 caractères)`)
                .then(() => {
                    interaction.channel.awaitMessages({ max: 1, time: 60000, errors: ['time'] })
                        .then(collected => {
                            const messagetosend = collected.first().toString().substring(0,1000);
                            const targetMember = interaction.guild.members.cache.get(usertokickid);
                            const embedok = new MessageEmbed().setColor('FF0000').setTitle(`:no_entry: ${usertokick.username} a été banni`).setDescription(`par ${interaction.user}`).setAuthor('Log :', `${interaction.user.displayAvatarURL({dynamic: true})}`).setThumbnail(`${usertokick.displayAvatarURL({dynamic: true})}`).addField(':envelope: Message envoyé à l’utilisateur', `${messagetosend}`, true).setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                            const embedtosend = new MessageEmbed().setColor('FF0000').setTitle(`:no_entry: Vous avez été banni de ${interaction.guild.name}`).setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField(':envelope: Message : ', `${messagetosend}`, true).setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                            targetMember.send({embeds: [embedtosend] }).catch(error => { interaction.followUp(":negative_squared_cross_mark: Impossible d’envoyer le message, l’utilisateur a bloqué les DM");})
                                .then(() => targetMember.ban({reason: [`${messagetosend}`]}).catch(error => { interaction.followUp(":x: Impossible de bannir le membre. Vous ne pouvez pas bannir des admins."); noerroroccured = false;}))
                                .then(() =>{if (noerroroccured) {interaction.followUp({embeds: [embedok] });}});
                        })
                        .catch(collected => {interaction.followUp(':x: Erreur : Temps écoulé, commande annulée');});
                });
            } else {interaction.reply(":negative_squared_cross_mark: Vous n’avez mentionné personne !");};
        } else {interaction.reply(":negative_squared_cross_mark: Vous n’avez pas la permission de bannir des gens, demandez à monter en grade et rééssayez !");};
    },
};
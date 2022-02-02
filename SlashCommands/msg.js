const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, Permissions, MessageEmbed, MessageSelectMenu, MessageButton } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("msg")
        .setDescription("Envoie un message à un utilisateur en toute sécurité")
        .addUserOption(option => option.setName('cible').setDescription("L’utilisateur à envoyer le message").setRequired(true)),
    async execute(interaction) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_MESSAGES)){
            const usertosend = interaction.options.getUser('cible');
            if (usertosend) {
                interaction.reply({content: `Tapez le message à envoyer à l’utilisateur (Max : 1000 caractères)`, ephemeral: true})
                    .then(() => {
                        interaction.channel.awaitMessages({ max: 1, time: 60000, errors: ['time'] })
                            .then(collected => {
                                const messagetosend = collected.first().toString().substring(0,1000);
                                const sendrow = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("sendoptionsselector").setPlaceholder("Veuillez sélectionner").addOptions([
                                    {
                                        label: "Mode Visible",
                                        description: "L’utilisateur verra votre tag et le nom du serveur",
                                        value: "visiblemode",
                                    },
                                    {
                                        label: "Mode Dark",
                                        description: "L’utilisateur verra seulement le nom du serveur",
                                        value: "darkmode",
                                    },
                                    {
                                        label: "Mode Top Secret",
                                        description: "L’utilisateur verra le messsage de manière anonyme",
                                        value: "topsecretmode",
                                    },]),);
                                collected.first().delete();
                                interaction.followUp({ content: `${interaction.member} Options d’envoi`, components: [sendrow], ephemeral: true})
                                .then(() => {
                                    interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', time: 60000 })
                                        .then(interaction => {
                                            
                                            const target = interaction.guild.members.cache.get(usertosend.id);
                                            var embedok = 0;
                                            var embedtosend = 0;
                                            if (interaction.values[0] === 'visiblemode') {
                                                embedtosend = new MessageEmbed().setColor("#40A0FF").setTitle(":incoming_envelope: On vous a envoyé un message !").setDescription(`de **${interaction.user}** depuis le serveur **${interaction.guild.name}**`).setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter('Messenger Bot. Made by Nitsugua38', 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png');
                                                embedok = new MessageEmbed().setColor("#00FF00").setTitle(":green_circle: Votre message a bien été remis en mode visible !").setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter('Messenger Bot. Made by Nitsugua38', 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png');
                                            } else if (interaction.values[0] === 'darkmode') {
                                                embedtosend = new MessageEmbed().setColor("#0080FF").setTitle(":incoming_envelope: On vous a envoyé un message !").setDescription(`d’un modérateur du serveur **${interaction.guild.name}**`).setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                                                embedok = new MessageEmbed().setColor("#228B22").setTitle(":spy: Votre message a bien été remis en mode Dark !").setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                                            } else if (interaction.values[0] === 'topsecretmode') {
                                                embedtosend = new MessageEmbed().setColor("#0066CC").setTitle(":incoming_envelope: On vous a envoyé un message !").setDescription(`de manière anonyme`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                                                embedok = new MessageEmbed().setColor("006400").setTitle(":question: Votre message a bien été remis en mode Anonyme !").addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                                            };
                                            const rowb = new MessageActionRow().addComponents(new MessageButton().setCustomId("deleteme").setLabel("Cacher ce message !").setStyle("DANGER").setEmoji('✖'),);
                                            interaction.reply({embeds: [embedok], ephemeral: true});
                                            target.send({embeds: [embedtosend]});
                                    }).catch(err => interaction.followUp({content: `:x: Erreur : Vous n’avez rien sélectionné, commande annulée ${err}`, ephemeral: true}));
                                });
                            }).catch(collected => {interaction.followUp(':x: Erreur : Temps écoulé, commande annulée');});
                    });
            } else {interaction.reply(":negative_squared_cross_mark: Vous n’avez mentionné personne !")};
        } else {interaction.reply(":negative_squared_cross_mark: Vous n’avez pas la permission de gérer les messages !")};
    },
};
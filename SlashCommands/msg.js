const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, Permissions, MessageEmbed, MessageSelectMenu } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("msg")
        .setDescription("Envoie un message à un utilisateur en toute sécurité")
        .addUserOption(option => option.setName('membre').setDescription("L’utilisateur à qui envoyer le message").setRequired(true))
        .addStringOption(option => option.setName('message').setDescription("Le message à envoyer").setRequired(true)),
    async execute(interaction, ImportedMember, ImportedMsg) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            const usertosend = interaction.options?.getUser('membre') || interaction.guild.members.cache.get(ImportedMember);
            const messagetosend = interaction.options?.getString('message')?.substring(0,3900) || ImportedMsg?.substring(0,3900);
            const embederrsend = new MessageEmbed().setTitle("<:NitsuRedTick:939475841803505664> Impossible d’envoyer le message").setDescription("L’utilisateur a bloqué les DM").setColor("DARK_RED");
            
            const sendrow = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("sendoptionsselector").setPlaceholder("Veuillez sélectionner").addOptions([
                    {
                        label: "Mode Visible",
                        description: "L’utilisateur verra votre tag et le nom du serveur",
                        value: "visiblemode",
                        emoji: "🟢",
                    },
                    {
                        label: "Mode Dark",
                        description: "L’utilisateur verra seulement le nom du serveur",
                        value: "darkmode",
                        emoji: "🕵️",
                    },
                    {
                        label: "Mode Top Secret",
                        description: "L’utilisateur verra le messsage de manière anonyme",
                        value: "topsecretmode",
                        emoji: "❓",
                    },]),);
                const embedchose = new MessageEmbed().setColor("BLURPLE").setDescription("Veuillez choisir votre option d’envoi");
                if (ImportedMember) await interaction.channel.send({ content: `${interaction.member}`, components: [sendrow], embeds: [embedchose], ephemeral: true})

                else await interaction.reply({ content: `${interaction.member}`, components: [sendrow], embeds: [embedchose], ephemeral: true})
                
                
                interaction.channel.awaitMessageComponent({ componentType: 'SELECT_MENU', time: 60000 })
                .then(interaction => {
                    
                    const target = interaction.guild.members.cache.get(usertosend.id);
                    var embedok = 0;
                    var embedtosend = 0;
                    if (interaction.values[0] === 'visiblemode') {
                        embedtosend = new MessageEmbed().setColor("#40A0FF").setTitle(":incoming_envelope: On vous a envoyé un message !").setDescription(`de **${interaction.user}** depuis le serveur **${interaction.guild.name}**`).setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                        embedok = new MessageEmbed().setColor("#00FF00").setTitle(":green_circle: Votre message a bien été remis en mode visible !").setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                    } else if (interaction.values[0] === 'darkmode') {
                        embedtosend = new MessageEmbed().setColor("#0080FF").setTitle(":incoming_envelope: On vous a envoyé un message !").setDescription(`d’un modérateur du serveur **${interaction.guild.name}**`).setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                        embedok = new MessageEmbed().setColor("#228B22").setTitle(":spy: Votre message a bien été remis en mode Dark !").setThumbnail(`${interaction.guild.iconURL({dynamic: true})}`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                    } else if (interaction.values[0] === 'topsecretmode') {
                        embedtosend = new MessageEmbed().setColor("#0066CC").setTitle(":incoming_envelope: On vous a envoyé un message !").setDescription(`de manière anonyme`).addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                        embedok = new MessageEmbed().setColor("006400").setTitle(":question: Votre message a bien été remis en mode Anonyme !").addField("Contenu du message", `${messagetosend}`, true).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
                    };
                    
                    target.send({embeds: [embedtosend]}).then(()=> {
                        interaction.reply({embeds: [embedok], ephemeral: true});
                    }).catch(error => {
                        return interaction.reply({embeds: [embederrsend], ephemeral: true});
                    });
                            

                    }).catch(err => {
                        const embedcant = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Commande annulée").setDescription("Vous n’avez rien sélectionné").setColor("YELLOW");
                        interaction.followUp({embeds: [embedcant], ephemeral: true});
                    });
                
        } else {
            const embedcantkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Permission manquante").setDescription("Gérer le serveur").setColor("DARK_RED");
            interaction.reply({embeds: [embedcantkick]});
        };
    },
};
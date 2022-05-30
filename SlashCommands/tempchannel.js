const { SlashCommandBuilder } = require("@discordjs/builders");
const { Tags } = require("../index.js");
const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("tempchannel")
        .setDescription("Crée un salon vocal temporaire"),
    async execute(interaction) {

        const embedCantCreate = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Utilisation des Temp Channels refusée").setDescription("Vous n’avez pas la permission de créer des Temp Channels, demandez à un modérateur de vous assignez le rôle requis !");
        const embedTooMuch = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Maximum atteind").setDescription("Vous avez atteint **votre** maximum de salon vocaux temporaires (3) **simultanés**. Supprimez-en !");
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Impossible de créer les Temp Channels").setDescription("Les Temp Channels n’ont pas encore été configurés ! Demandez à un modérateur de faire la commande `/setup` !");
        const embedError = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTick:939475841803505664> Une erreur est survenue").setDescription("Une erreur est survenue lors de la création du salon. Veuillez réessayer ! (Il se peut que le nombre maximum de salons sur le serveur (500) soit atteint)");

        
        const guildID = interaction.guild.id;
        const tag = await Tags.findOne({ where: { guildid: guildID } });
        var tag2;
        var tag3;
        if (tag) {tag2 = tag.tccateg; tag3 = tag.tcrole} else {tag2 = false; tag3 = false}
        if (tag && tag2 && tag3) {
            if (tag3 != "everyone" && !interaction.member.roles.cache.some(role => role.id === tag3)) return interaction.reply({embeds: [embedCantCreate], ephemeral: true});

            if (interaction.guild.channels.cache.find(channel => channel.name == `Salon de ${interaction.member.user.username} - 2`)) {
                return interaction.reply({embeds: [embedTooMuch], ephemeral: true});
            } else if (interaction.guild.channels.cache.find(channel => channel.name == `Salon de ${interaction.member.user.username} - 1`)) {
                var channelname = `Salon de ${interaction.member.user.username} - 2`;
            } else if (interaction.guild.channels.cache.find(channel => channel.name == `Salon de ${interaction.member.user.username}`)) {
                var channelname = `Salon de ${interaction.member.user.username} - 1`;
            } else {var channelname = `Salon de ${interaction.member.user.username}`;}
            if (channelname) {
                interaction.guild.channels.create(channelname, {
                    type: "GUILD_VOICE",
                    permissionOverwrites: [{
                        id: interaction.member.id,
                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK", "STREAM", "CREATE_INSTANT_INVITE", "DEAFEN_MEMBERS", "MUTE_MEMBERS"]
                    },
                    {
                        id: interaction.guild.roles.everyone.id,
                        allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK", "STREAM"]
                    }],
                }).then(() => {
                    let categorytoadd = interaction.guild.channels.cache.get(tag.tccateg),
                    channel = interaction.guild.channels.cache.find(channel => channel.name == `${channelname}`);
                    if (categorytoadd && channel) {
                        channel.setParent(categorytoadd, {lockPermissions : false});
                        const rowtemp = new MessageActionRow().addComponents(new MessageButton().setCustomId(`${interaction.guild.channels.cache.find(channel => channel.name === channelname)}`).setLabel("Cliquez pour suprimer ce salon").setStyle("DANGER").setEmoji('✖'),);
                        const embedSucces = new MessageEmbed().setColor("GREEN").setTitle(`<:NitsuGreenTickRound:977520117216862239> Le salon vocal temporaire **${channelname}** a été créé !`);
                        interaction.reply({ embeds: [embedSucces] , components: [rowtemp] });
                    } else {interaction.reply({embeds: [embedError]})}
                });
            }
        } else {interaction.reply({embeds: [embedNotConfig]})}
    },
};
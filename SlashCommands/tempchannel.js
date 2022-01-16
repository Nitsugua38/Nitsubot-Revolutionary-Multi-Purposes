const { SlashCommandBuilder } = require("@discordjs/builders");
const Tags = require("../client/Tags.js");
const { MessageButton, MessageActionRow } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("tempchannel")
        .setDescription("Crée un salon vocal temporaire"),
    async execute(interaction) {
        const guildID = interaction.guild.id;
        const tag = await Tags.findOne({ where: { guildid: guildID } });
        if (tag) {tag2 = tag.tccateg;} else {tag2 = false;}
        if (tag && tag2) {
            if (interaction.guild.channels.cache.find(channel => channel.name == `Salon de ${interaction.member.user.username} - 2`)) {
                return interaction.reply(":negative_squared_cross_mark: Vous avez atteint votre maximum de salon vocaux temporaires (3) simultanés. Supprimez-en !");
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
                        interaction.reply({ content: `:white_check_mark: Le salon vocal temporaire **${channelname}** a été créé !`, components: [rowtemp] });
                    } else {interaction.reply(":x: Erreur : Le Salon vocal n’a pas été créé")}
                });
            } else {interaction.reply(":negative_squared_cross_mark: Vous n’avez pas donné de nom pour votre salon vocal temporaire !");};
        } else {interaction.reply(":negative_squared_cross_mark: Erreur, la base de données du bot n’a pas encore été initialisée ! Tapez `/setup` ou `/config tempchannel` pour réparer.")}
    },
};
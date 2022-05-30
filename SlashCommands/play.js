const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { player } = require("../index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Joue une musique dans un vocal sinon l’ajoute à la file d’attente")
        .addStringOption(option => option.setName('nom').setDescription("Nom de la musique").setRequired(true)),
    async execute(interaction) {
        const channeltoconnect = interaction.member.voice.channel;

        const embednc = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Vous devez être connecté à un salon vocal pour que je puisse jouer de la musique !");
        if (!channeltoconnect) {return interaction.reply({embeds: [embednc]})};
        if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) {return interaction.reply({embeds: [embednc]})};
        interaction.reply("<:NitsuGreenTickRound:977520117216862239> Je cherche la musique...");
        const query = interaction.options.getString('nom');
        const queue = await player.createQueue(interaction.guild, {metadata: {channel: interaction.channel}});
        try {
            if (!queue.connection) {await queue.connect(channeltoconnect)};
        } catch {
            queue.destroy();
            const embednope = new MessageEmbed().setColor("RED").setTitle("Erreur").setDescription("<:NitsuRedTick:939475841803505664> Impossible de rejoindre votre salon vocal !");
            return interaction.reply({embeds: [embednope]});
        }
        
        const track = await player.search(query, { requestedBy: interaction.user}).then(x => x.tracks[0]);

        const embednopea = new MessageEmbed().setColor("RED").setTitle("Erreur").setDescription(`<:NitsuRedTick:939475841803505664> Musique ${query} non trouvée !`);
        if (!track) {return interaction.followUp({embeds: [embednopea]})};

        interaction.deleteReply();
        if (!queue.playing) {
            queue.play(track);
        } else {
            queue.addTrack(track);
        }
    },
};
const { SlashCommandBuilder } = require("@discordjs/builders");
const player = require("../index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Joue une musique dans un vocal sinon l’ajoute à la file d’attente")
        .addStringOption(option => option.setName('nom').setDescription("Nom de la musique").setRequired(true)),
    async execute(interaction) {
        const channeltoconnect = interaction.member.voice.channel;
        if (!channeltoconnect) {return interaction.reply(":negative_squared_cross_mark: Vous devez être connecté à un salon vocal pour que je puisse jouer de la musique !")};
        if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) {return interaction.reply(":negative_squared_cross_mark: Vous devez être connecté à un salon vocal pour que je puisse jouer de la musique !")};
        interaction.reply(":white_check_mark: Je cherche la musique...");
        const query = interaction.options.getString('nom');
        const queue = player.createQueue(interaction.guild, {metadata: {channel: interaction.channel}});
        try {
            if (!queue.connection) {await queue.connect(channeltoconnect)};
        } catch {
            queue.destroy();
            return interaction.reply(":x: Erreur : impossible de rejoindre votre salon vocal !");
        }
        
        const track = await player.search(query, { requestedBy: interaction.user}).then(x => x.tracks[0]);
        if (!track) {return interaction.followUp(`:x: Musique ${query} non trouvée !`)};

        interaction.deleteReply();
        if (!queue.playing) {
            queue.play(track);
        } else {
            queue.addTrack(track);
        }
    },
};
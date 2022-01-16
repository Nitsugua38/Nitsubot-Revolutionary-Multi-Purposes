const fs = require("fs");
const { Client, Intents, Collection, MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const { token } = require("./config.json");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
module.exports = client;

const Tags = require("./client/Tags");

var isplaying = false;
const { Player } = require("discord-player");
const player = new Player(client);
module.exports = player;

const rowmusique = new MessageActionRow().addComponents(new MessageButton().setCustomId("playermusic").setLabel("Play / Pause").setStyle("PRIMARY").setEmoji("⏯️"), new MessageButton().setCustomId("playerskip").setLabel("Skip").setStyle("SECONDARY").setEmoji("⏭️"), new MessageButton().setCustomId("playerstop").setLabel("Arrêter").setStyle("DANGER").setEmoji("⏹️"), new MessageButton().setCustomId("playersee").setLabel("Voir la file d’attente").setStyle("SECONDARY").setEmoji("🕓"), new MessageButton().setCustomId("playerlyrics").setLabel("Voir les paroles").setStyle("SECONDARY").setEmoji("📜"));
player.on("trackStart", (queue, track) => {
    const embedmusique = new MessageEmbed().setColor("#00FF00").setTitle(`:musical_note: Je joue ${track.title}`).setDescription(`de *${track.author}* \n${queue.createProgressBar()}`).setThumbnail(`${track.thumbnail}`).setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
    queue.metadata.channel.send( { embeds: [embedmusique] , components: [rowmusique] });
    isplaying = true;
});
player.on("trackEnd", (queue, track) => {
    isplaying = false;
});
player.on("error", (queue, track) => {
    isplaying = false;
    queue.metadata.channel.send(":x: Une erreur est survenue, musique arrêtée !");
});
player.on("trackAdd", (queue, track) => {
    queue.metadata.channel.send(`:notes: ${track.title} a été ajouté à la file d’attente`);
});



const axios = require("axios");
const getLyrics = (title) => new Promise(async (ful, rej) => {
    const url = new URL("https://some-random-api.ml/lyrics");
    url.searchParams.append("title", title);
    try {
        const { data } = await axios.get(url.href);
        ful(data);
    } catch (error) {
        rej(error);
    }
});
const substring = (length,value) => {
    const replaced = value.replace(/\n/g, "--");
    const regex = `.{1,${length}}`;
    const lines = replaced.match(new RegExp(regex, "g")).map((line) => line.replace(/--/g, "\n"));
    return lines;
};
const createResponse = async (title) => {
    try {
        const data = await getLyrics(title);
        const embeds = substring(4096, data.lyrics).map((value, index) => {
            const isFirst = index === 0;
            return new MessageEmbed({
                title: isFirst ? `${data.title} - ${data.author}` : null,
                thumbnail: isFirst ? { url: data.thumbnail.genius } : null,
                description: value
            });
        });
        return { embeds };
    } catch (error) {
        return "Pas de sous titres trouvés :(";
    }
};




client.commands = new Collection();
const commandFiles = fs.readdirSync("./SlashCommands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./SlashCommands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    Tags.sync();
    console.log(`Connecté ! ${client.user.tag}`);
});



client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand() && !interaction.isButton() && !interaction.isSelectMenu()) return;

    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            return interaction.reply("Erreur : Impossible d’exécuter la commande");
        }
    }

    else if (interaction.isButton()) {
        if (interaction.customId.startsWith("<#")) {
            var chantodelid = interaction.customId.replace(/[><#]/g, "");
            var chantodel = interaction.guild.channels.cache.get(chantodelid);
            chantodel.delete();
            interaction.message.delete();
        } 
        else if (interaction.customId === "playermusic") {
            const queue = player.getQueue(interaction.guildId);
            if (!queue?.playing) {return interaction.reply(":negative_squared_cross_mark: Pas de musique en cours de lecture à mettre en pause !");};
            if (isplaying) {
                queue.setPaused(true);
                isplaying = false;
                interaction.reply("Mis en pause");
                interaction.deleteReply();
            } else {
                queue.setPaused(false);
                isplaying = true;
                interaction.reply("Mis en play");
                interaction.deleteReply();
            }
        } 
        else if (interaction.customId === "playerskip") {
            const queue = player.getQueue(interaction.guildId);
            if (!queue?.playing) {return interaction.reply(":negative_squared_cross_mark: Pas de musique en cours de lecture à passer !");};
            await queue.skip();
            interaction.reply(":track_next: Musique passée");
            interaction.deleteReply();
        }
        else if (interaction.customId === "playerstop") {
            const queue = player.getQueue(interaction.guildId);
            if (!queue?.playing) {return interaction.reply(":negative_squared_cross_mark: Pas de musique en cours de lecture à arrêter !");};
            await queue.stop();
            interaction.reply(":stop_button: Lecture arrêtée");
            interaction.message.delete();
        }
        else if (interaction.customId === "playersee") {
            const queue = player.getQueue(interaction.guildId);
            if (!queue?.playing) {return interaction.reply(":negative_squared_cross_mark: Pas de musique en cours de lecture !");};
            const currentTrack = queue.current;
            const tracks = queue.tracks.slice(0, 10).map((m, i) => {
                return `${i + 1}. [**${m.title}**](${m.url}) - ${
                    m.requestedBy.tag
                }`;
            });
            const embedqueue = new MessageEmbed().setTitle("File d’attente des musiques").setDescription(`${tracks.join("\n")}${queue.tracks.length > tracks.length? `\n...${queue.tracks.length - tracks.length === 1? `${queue.tracks.length - tracks.length} more track`: `${queue.tracks.length - tracks.length} more tracks`}`: ""}`).setColor("RANDOM").addField("Musique actuelle", `🎶 | [**${currentTrack.title}**](${currentTrack.url}) - ${currentTrack.requestedBy.tag}`,);
            interaction.reply({embeds: [embedqueue]});
        }
        else if (interaction.customId === "playerlyrics") {
            const queue = player.getQueue(interaction.guildId);
            const title = queue.current.title
            const sendLyrics = (songTitle) => {return createResponse(songTitle).then((res) => {interaction.reply(res);}).catch((err) => console.log({ err }));};
            if (!title) {return interaction.reply(":negative_squared_cross_mark: Pas de musique en cours de lecture !");};
            sendLyrics(title);
        }
    }
});


process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', function(err) {
    console.log('process.on handler');
    console.log(err);
});

client.login(token).then(() => {
    client.user.setPresence({ activities: [{name: 'Développé par Nitsugua38', type: 'PLAYING'}], status: 'online'});
});
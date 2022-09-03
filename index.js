const token = "YOUR TOKEN HERE"; //INSERER VOTRE TOKEN ICI

const fs = require("fs");
var moment = require("moment");
const Sequelize = require("sequelize");
const { Player } = require("discord-player");
const axios = require("axios");
const cron = require("node-cron");
const { Client, Intents, Collection, MessageButton, MessageActionRow, MessageEmbed, Permissions, MessageSelectMenu } = require('discord.js');

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS] });


// Player
var isplaying = false;
const player = new Player(client);


const rowmusique = new MessageActionRow().addComponents(new MessageButton().setCustomId("playermusic").setLabel("Play / Pause").setStyle("PRIMARY").setEmoji("⏯️"), new MessageButton().setCustomId("playerskip").setLabel("Skip").setStyle("SECONDARY").setEmoji("⏭️"), new MessageButton().setCustomId("playerstop").setLabel("Arrêter").setStyle("DANGER").setEmoji("⏹️"), new MessageButton().setCustomId("playersee").setLabel("Voir la file d’attente").setStyle("SECONDARY").setEmoji("🕓"), new MessageButton().setCustomId("playerlyrics").setLabel("Voir les paroles").setStyle("SECONDARY").setEmoji("📜"));
player.on("trackStart", (queue, track) => {
    const embedmusique = new MessageEmbed().setColor("#00FF00").setTitle(`:musical_note: Je joue ${track.title}`).setDescription(`de *${track.author}* \n${queue.createProgressBar()}`).setThumbnail(`${track.thumbnail}`).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
    queue.metadata.channel.send( { embeds: [embedmusique] , components: [rowmusique] });
    isplaying = true;
});
player.on("trackEnd", (queue, track) => {
    isplaying = false;
});
player.on("error", (queue, track) => {
    isplaying = false;
    const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Une erreur est survenue, musique arrêtée !");
    queue.metadata.channel.send({embeds: [embederror]});
});
player.on("trackAdd", (queue, track) => {
    const embedadded = new MessageEmbed().setColor("BLUE").setDescription(`:notes: ${track.title} a été ajouté à la file d’attente`);
    queue.metadata.channel.send({embeds: [embedadded]});
});


// Player - Lyrics
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
        return "Pas de paroles trouvés :(";
    }
};



// Database 1

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'db1.sqlite',
});

const Tags = sequelize.define('tags', {
    guildid: {
        type: Sequelize.STRING,
        unique: true,
    },
    tccateg: {
        type: Sequelize.TEXT,
    },
    tcrole: {
        type: Sequelize.TEXT,
    },
    wheretoreply: {
        type: Sequelize.TEXT,
    },
    wheretocontactstaff: {
        type: Sequelize.TEXT,
    },
    maxtickets: {
        type: Sequelize.INTEGER,
    },
    enableautomod: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
    },
    timermute: {
        type: Sequelize.INTEGER,
    },
    allowedadschannels: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
    },
    raidmode: {
        type: Sequelize.BOOLEAN,
    },

});


//Database Economy Users

const sequelize2 = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'dbEcoUsers.sqlite',
});

const TagsEconomyUsers = sequelize2.define('tags', {
    GUID: {
        type: Sequelize.STRING,
        unique: true,
    },
    money: {
        type: Sequelize.TEXT,
        defaultValue: "0,0",
		allowNull: false,
    },
    items: {
        type: Sequelize.TEXT,
        defaultValue: "aucun",
		allowNull: false,
    },
    cooldowns: {
        type: Sequelize.TEXT,
        defaultValue: "0,0,0,0",
		allowNull: false,
    },
    cooldownsRoles: {
        type: Sequelize.TEXT,
    },
    actions: {
        type: Sequelize.TEXT,
        defaultValue: "0,0,0,0,0,0,0,0,0,0",
		allowNull: false,
    },
    btc: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
		allowNull: false,
    },
});


//Database Economy Guilds

const sequelize3 = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'dbEcoGuilds.sqlite',
});

const TagsEconomyGuilds = sequelize3.define('tags', {
    guildId: {
        type: Sequelize.STRING,
        unique: true,
    },
    features: {
        type: Sequelize.TEXT,
        defaultValue: "on,on,on,off,on,on,on,on",
		allowNull: false,
    },
    work: {
        type: Sequelize.TEXT,
        defaultValue: "0,1000,2",
		allowNull: false,
    },
    crime: {
        type: Sequelize.TEXT,
        defaultValue: "-1000,1000,5",
		allowNull: false,
    },
    rob: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
		allowNull: false,
    },
    chat: {
        type: Sequelize.TEXT,
        defaultValue: "0,0,5",
		allowNull: false,
    },
    rolesSalaries: {
        type: Sequelize.TEXT,
    },
    items: {
        type: Sequelize.TEXT,
    },
    startingMoney: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    maxBank: {
        type: Sequelize.INTEGER,
        defaultValue: -1,
        allowNull: false,
    },
    btc: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
		allowNull: false,
    },
    cac: {
        type: Sequelize.TEXT,
        defaultValue: "non",
		allowNull: false,
    },
});



//Database Entreprise Users

const sequelize4 = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'dbEnterprisesUsers.sqlite',
});

const TagsEnterprisesUsers = sequelize4.define('tags', {
    GUID: {
        type: Sequelize.STRING,
        unique: true,
    },
    enterprises: {
        type: Sequelize.TEXT,
    },
    materials: {
        type: Sequelize.TEXT,
    },
    items: {
        type: Sequelize.TEXT,
    },
    cooldownsMaterials: {
        type: Sequelize.TEXT,
    },
});


//Database Enterprise Guilds

const sequelize5 = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'dbEnterprisesGuilds.sqlite',
});

const TagsEnterprisesGuilds = sequelize5.define('tags', {
    guildId: {
        type: Sequelize.STRING,
        unique: true,
    },
    features: {
        type: Sequelize.TEXT,
        defaultValue: "on",
		allowNull: false,
    },
    enterprises: {
        type: Sequelize.TEXT,
    },
    materials: {
        type: Sequelize.TEXT,
    },
    items: {
        type: Sequelize.TEXT,
    },
    maxEnterprises: {
        type: Sequelize.INTEGER,
        defaultValue: -1,
        allowNull: false,
    },
});


//Exportation

module.exports = {
    client: client,
    Tags: Tags,
    player: player,
    TagsEconomyUsers: TagsEconomyUsers,
    TagsEconomyGuilds: TagsEconomyGuilds,
    TagsEnterprisesUsers: TagsEnterprisesUsers,
    TagsEnterprisesGuilds: TagsEnterprisesGuilds
};


//Anti-Raid
const AntiSpam = require("discord-anti-spam");

const antiSpam = new AntiSpam({
    warnThreshold: 15,
    muteThreshold: 20,
    kickThreshold: 23,
    banThreshold: 30,
    maxInterval: 25000,
    maxDuplicatesInterval: 25000,
    warnMessage: "{@user}, Merci d’arrêter de spammer !",
    kickMessage: "**{user_tag}** a été expulsé pour spam",
    muteMessage: "**{user_tag}** a été réduit au silence pendant `10` minutes pour spam",
    banMessage: "**{user_tag}** a été banni pour spam",
    maxDuplicatesWarn: 3,
    maxDuplicatesKick: 15,
    maxDuplicatesBan: 18,
    maxDuplicatesMute: 6,
    ignoredPermissions: ["MANAGE_CHANNELS"],
    ignoreBots: true,
    verbose: true,
    ignoredMembers: [],
    unMuteTime: 10,
    removeMessages: true,
    modLogsEnabled: true,
    modLogsChannelName: "mod-logs",
    modLogsMode: "message",
    errorMessages: true,
    kickErrorMessage: "Erreur: impossible d’expulser **{user_tag}** (Permissions manquantes ou le membre est un admin)",
    banErrorMessage: "Erreur: impossible de bannir **{user_tag}** (Permissions manquantes ou le membre est un admin)",
    muteErrorMessage: "Erreur: impossible de faire taire **{user_tag}** (Permissions manquantes ou le membre est un admin)",
    warnEnabled: true,
    kickEnabled: true,
    banEnabled: true,
    muteEnabled: true,
    deleteMessagesAfterBanForPastDays: 1,
    MultipleSanctions: true
});

// Discord

client.commands = new Collection();
const commandFiles = fs.readdirSync("./SlashCommands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./SlashCommands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    Tags.sync();
    TagsEconomyGuilds.sync();
    TagsEconomyUsers.sync();
    TagsEnterprisesGuilds.sync();
    TagsEnterprisesUsers.sync();
    console.log(`Connecté ! ${client.user.tag}`);
});


//Carrefour, Airbus, Bouygues, Renault, TotalEnergies, Danone, LVMH, BNP Paribas, Engie, Michelin

//CRON JOB

cron.schedule("0 9,19 * * *", async () => {
    
    var tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: "ADMIN" } });
    if (!tag2) {
        tag2 = await TagsEconomyGuilds.create({ guildId: "ADMIN", cac: "210,400,150,300,250,800,1000,421,350,503", btc: 20000});
    }


    var cac = tag2.cac.split(",");
    for (let i = 0; i < cac.length; i++) {
        cac[i] = Math.abs( parseInt( randomIntFromInterval( parseInt(cac[i])-(0.05 * parseInt(cac[i])) , parseInt(cac[i])+(0.05 * parseInt(cac[i])) ) ) );
    }


    var btc = tag2.btc;

    const url = new URL("http://api.coinlayer.com/api/live");
    url.searchParams.append("access_key", "YOUR TOKEN HERE"); // INSERER VOTRE TOKEN ICI
    url.searchParams.append("symbols", "BTC")
    try {
        const { data } = await axios.get(url.href);
        if (data.rates.BTC) {
            btc = parseInt(data.rates.BTC)
        }
        client.channels.cache.get("987431967836479528").send("Cours du bitcoin et du CAC mis à jour !")

    } catch (error) {
        client.channels.cache.get("987431967836479528").send(`Cours du CAC uniquement mis à jour ! <@595655955572719646> Log erreur BTC : ${error}`)
    }
    
    await TagsEconomyGuilds.update({cac: `${cac.toString()}`}, { where: { guildId: "ADMIN" } });
    await TagsEconomyGuilds.update({btc: btc}, { where: { guildId: "ADMIN" } });



}, {
    scheduled: true,
    timezone: "Europe/Paris"
});









client.on("inviteCreate", async invite => {
    var tagcheck = await Tags.findOne({ where: { guildid: invite.guild.id } })
    if (tagcheck?.raidmode === true) {
        invite.delete();
    }
});


client.on("guildMemberAdd", async member => {
    let GUID = member.guild.id + "-" + member.id;
    
    try {
        await TagsEconomyUsers.create({ GUID: GUID,});
        
        let tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: member.guild.id } });
        if (tag2.startingMoney) {
            await TagsEconomyUsers.update({money: `${tag2.startingMoney},0`}, { where: { GUID: GUID } });
        }
    } catch (err) {
        const noop = () => {};
        noop();
    }
})


client.on("messageUpdate", async (oldmsg, message) => {

    
    if (message.author.bot) return;

    var tagcheck = await Tags.findOne({ where: { guildid: message.guild?.id } })
    if (tagcheck) {

        //If mentions detection enabled
        if (tagcheck?.enableautomod?.substring(4,7) === "oui") {
            if(message.mentions.everyone && !message.member.permissions.has("MANAGE_MESSAGES")) {
                const toSay = "`" + message.content.substring(0, 2000) + "`";
                const EmbedWarnEveryone = new MessageEmbed().setColor("RED").setTitle(`${message.author.username} a essayé de mentionner tous les membres ! `).setDescription(`**Il essayait de dire :** ${toSay}`).addField(":exclamation: Sanction :", `Mute pendant \`${tagcheck.timermute}\` minutes`).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
                message.channel.send({embeds: [EmbedWarnEveryone]});
                message.member.timeout(tagcheck.timermute * 60000);
                message.delete();
            };
        
            if(message.content.includes(`<@&`) && !message.member.permissions.has("MANAGE_MESSAGES")) {
                if (message.content.replace("<@&", "").replace("<@&", "").includes("<@&")) {
                    const toSay = "`" + message.content.substring(0, 2000) + "`";
                    const EmbedWarnMentions = new MessageEmbed().setColor("RED").setTitle(`${message.author.username} a essayé de mentionner plus de 3 rôles ! `).setDescription(`**Il essayait de dire :** ${toSay}`).addField(":exclamation: Sanction :", `Mute pendant \`${tagcheck.timermute}\` minutes`).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
                    message.channel.send({embeds: [EmbedWarnMentions]});
                    message.member.timeout(tagcheck.timermute * 60000);
                    message.delete();
                }
            }
        }

        //If bad language detection enabled
        if (tagcheck?.enableautomod?.substring(8,11) === "oui") {
            const badword = "nike ta mère,nik ta mère,nique ta mère,fils de pute,sale chien,anal,anus,arse,ass,ballsack,bastard,bitch,biatch,blowjob,blow job,bollock,bollok,boob,boobs,boobies,butt,buttplug,clitoris,cock,coon,crap,cunt,dick,dildo,dyke,fag,feck,fellate,fellatio,felching,fuck,f u c k,fudgepacker,fudge packer,flange,goddamn,god damn,goddamn,godamn,jerk,jizz,knobend,knob end,labia,muff,nigger,nigga,penis,piss,prick,pube,pussy,queer,scrotum,shit,s hit,sh1t,slut,smegma,spunk,tit,tosser,turd,twat,vagina,wank,whore,cul,nibard,boob,nichon,godemiché,godemicher,pédé,putain,fellation,merde,bride,sperme,manchon,nègre,négro,negre,negro,negros,pussy,pénis,pisse,pubis,scrotum,salope,saloppe,vagin,branler,branleur,branlo,nique,nik,enculé,pute,prostituée,prostituer,ntm,fdp,connard,connasse,conne,con,bite,salaud,salo,encule,poufiase,poufiasse,enfoiré,pd,salot,motherfucker,porn,mother fucker,porno,p0rn,p0rn0,porn0,gang bang,gangbang,gang-bang,cilitbang,cilit bang,cilit-bang".split(",");
            var nmc = message.content.toLowerCase()
            const original = nmc;

            if (badword.some(word => nmc.includes(word))) {
                badword.forEach(word => {
                    if (nmc.includes(word)){

                        function getIndicesOf(searchStr, str) {
                            var searchStrLen = searchStr.length;
                            if (searchStrLen == 0) {
                                return [];
                            }
                            var startIndex = 0, index, indices = [];
                            
                            while ((index = str.indexOf(searchStr, startIndex)) > -1) {
                                if (!str.substring(str.indexOf(searchStr, startIndex)+searchStr.length,str.indexOf(searchStr, startIndex)+searchStr.length+1).match(/^[a-z0-9]+$/g) && !str.substring(str.indexOf(searchStr, startIndex)-1,str.indexOf(searchStr, startIndex)).match(/^[a-z0-9]+$/g)) {
                                    indices.push(index);
                                }
                                startIndex = index + searchStrLen;
                            }
                            return indices;
                        }
                        ief = getIndicesOf(word,nmc)                        
                        
                        for (let i = 0; i < ief.length; i++) {
                            nmc = (nmc.substring(0,ief[i]+(32-word.length)*i) + " :face_with_symbols_over_mouth: " + nmc.substring(ief[i]+(32-word.length)*i + word.length))
                        }
                    }
                });
                if (original !== nmc) {
                    const embedbad = new MessageEmbed().setDescription("Message censuré par Nitsubot Auto-Mod");
                    sendwebhook(message.channel,message.member.displayName,message.member.displayAvatarURL(),nmc,embedbad);
                    message.delete();
                }
            }
        }


        //If ads detection enabled and not in allowed channel
        if (tagcheck?.enableautomod?.substring(12,15) === "oui") {
            var allowed = tagcheck.allowedadschannels.split(",")
            var responseOk = "notAllowed";
            const link = ["discord.gg","discord.com/invite","discordapp.com/invite"]

            allowed.forEach(element => {
                if (element === message.channel.id) responseOk = "allowedAd"
            });

            if (responseOk === "allowedAd") return
            else if (link.some(word => message.content.includes(word))) {
                if (!message.member.permissions.has("MANAGE_CHANNELS")) {
                    const embedpub = new MessageEmbed().setDescription("La publicité est interdite dans ce salon !");
                    var newmessagecontent = message.content;
                    link.forEach(word => {
                        if (newmessagecontent.includes(word)) {
                            var linktocensor = newmessagecontent.substring(newmessagecontent.indexOf(word),newmessagecontent.indexOf(word)+word.length+7);    
                            newmessagecontent = newmessagecontent.replace(new RegExp(linktocensor,"g")," :link: ");
                        }
                    });
                    sendwebhook(message.channel,message.member.displayName,message.member.displayAvatarURL(),newmessagecontent,embedpub);
                    message.delete();
                }
            };
        }
    }
});

client.on("messageCreate", async message => {

    if (message.author.bot) return;

    var tagcheck = await Tags.findOne({ where: { guildid: message.guild?.id } })
    if (tagcheck) {

        //If spam detection enabled
        if (tagcheck?.enableautomod?.substring(0,3) === "oui") {
            antiSpam.message(message);
        }

        //If mentions detection enabled
        if (tagcheck?.enableautomod?.substring(4,7) === "oui") {
            if(message.mentions.everyone && !message.member.permissions.has("MANAGE_MESSAGES")) {
                const toSay = "`" + message.content.substring(0, 2000) + "`";
                const EmbedWarnEveryone = new MessageEmbed().setColor("RED").setTitle(`${message.author.username} a essayé de mentionner tous les membres ! `).setDescription(`**Il essayait de dire :** ${toSay}`).addField(":exclamation: Sanction :", `Mute pendant \`${tagcheck.timermute}\` minutes`).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
                message.channel.send({embeds: [EmbedWarnEveryone]});
                message.member.timeout(tagcheck.timermute * 60000);
                message.delete();
            };
        
            if(message.content.includes(`<@&`) && !message.member.permissions.has("MANAGE_MESSAGES")) {
                if (message.content.replace("<@&", "").replace("<@&", "").includes("<@&")) {
                    const toSay = "`" + message.content.substring(0, 2000) + "`";
                    const EmbedWarnMentions = new MessageEmbed().setColor("RED").setTitle(`${message.author.username} a essayé de mentionner plus de 3 rôles ! `).setDescription(`**Il essayait de dire :** ${toSay}`).addField(":exclamation: Sanction :", `Mute pendant \`${tagcheck.timermute}\` minutes`).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
                    message.channel.send({embeds: [EmbedWarnMentions]});
                    message.member.timeout(tagcheck.timermute * 60000);
                    message.delete();
                }
            }
        }

        //If bad language detection enabled
        if (tagcheck?.enableautomod?.substring(8,11) === "oui") {
            const badword = "nike ta mère,nik ta mère,nique ta mère,fils de pute,sale chien,anal,anus,arse,ass,ballsack,bastard,bitch,biatch,blowjob,blow job,bollock,bollok,boob,boobs,boobies,bugger,butt,buttplug,clitoris,cock,coon,crap,cunt,dick,dildo,dyke,fag,feck,fellate,fellatio,felching,fuck,f u c k,fudgepacker,fudge packer,flange,goddamn,god damn,goddamn,godamn,jerk,jizz,knobend,knob end,labia,muff,nigger,nigga,penis,piss,prick,pube,pussy,queer,scrotum,shit,s hit,sh1t,slut,smegma,spunk,tit,tosser,turd,twat,vagina,wank,whore,cul,nibard,boob,nichon,godemiché,godemicher,pédé,putain,fellation,merde,bride,sperme,manchon,nègre,négro,negre,negro,negros,pussy,pénis,pisse,pubis,scrotum,salope,saloppe,vagin,branler,branleur,branlo,nique,nik,enculé,pute,prostituée,prostituer,ntm,fdp,connard,connasse,conne,con,bite,salaud,salo,encule,poufiase,poufiasse,enfoiré,pd,salot,motherfucker,porn,mother fucker,porno,p0rn,p0rn0,porn0,gang bang,gangbang,gang-bang,cilitbang,cilit bang,cilit-bang".split(",");
            var nmc = message.content.toLowerCase()
            const original = nmc;

            if (badword.some(word => nmc.includes(word))) {
                badword.forEach(word => {
                    if (nmc.includes(word)){

                        function getIndicesOf(searchStr, str) {
                            var searchStrLen = searchStr.length;
                            if (searchStrLen == 0) {
                                return [];
                            }
                            var startIndex = 0, index, indices = [];
                            
                            while ((index = str.indexOf(searchStr, startIndex)) > -1) {

                                if (!str.substring(str.indexOf(searchStr, startIndex)+searchStr.length,str.indexOf(searchStr, startIndex)+searchStr.length+1).match(/^[a-z0-9]+$/g) && !str.substring(str.indexOf(searchStr, startIndex)-1,str.indexOf(searchStr, startIndex)).match(/^[a-z0-9]+$/g)) {
                                    indices.push(index);
                                }
                                startIndex = index + searchStrLen;
                            }
                            return indices;
                        }
                        ief = getIndicesOf(word,nmc)                        
                        
                        for (let i = 0; i < ief.length; i++) {
                            nmc = (nmc.substring(0,ief[i]+(32-word.length)*i) + " :face_with_symbols_over_mouth: " + nmc.substring(ief[i]+(32-word.length)*i + word.length))
                        }
                    }
                });
                if (original !== nmc) {
                    const embedbad = new MessageEmbed().setDescription("Message censuré par Nitsubot Auto-Mod");
                    sendwebhook(message.channel,message.member.displayName,message.member.displayAvatarURL(),nmc,embedbad);
                    message.delete();
                }
            }
        }


        //If ads detection enabled and not in allowed channel
        if (tagcheck?.enableautomod?.substring(12,15) === "oui") {
            var allowed = tagcheck.allowedadschannels.split(",")
            var responseOk = "notAllowed";
            const link = ["discord.gg","discord.com/invite","discordapp.com/invite"]

            allowed.forEach(element => {
                if (element === message.channel.id) responseOk = "allowedAd"
            });

            if (responseOk === "allowedAd") return
            else if (link.some(word => message.content.includes(word))) {
                if (!message.member.permissions.has("MANAGE_CHANNELS")) {
                    const embedpub = new MessageEmbed().setDescription("La publicité est interdite dans ce salon !");
                    var newmessagecontent = message.content;
                    link.forEach(word => {
                        if (newmessagecontent.includes(word)) {
                            var linktocensor = newmessagecontent.substring(newmessagecontent.indexOf(word),newmessagecontent.indexOf(word)+word.length+7);    
                            newmessagecontent = newmessagecontent.replace(new RegExp(linktocensor,"g")," :link: ");
                        }
                    });
                    sendwebhook(message.channel,message.member.displayName,message.member.displayAvatarURL(),newmessagecontent,embedpub);
                    message.delete();
                }
            };
        }
    }


    //Economy - Chat Money

    const guildID = message.guild.id;
    const GUID = guildID + "-" + message.member.id;

    var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
    const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });


    
    if (tag2?.features?.startsWith("on")) {

        var MinMaxTime = tag2.chat.split(",");
        MinMaxTime[0] = parseInt(MinMaxTime[0]);
        MinMaxTime[1] = parseInt(MinMaxTime[1]);
        MinMaxTime[2] = parseInt(MinMaxTime[2]);
        
        if (MinMaxTime[1] === 0) return;

        if (!tag) {
            tag = await TagsEconomyUsers.create({ GUID: GUID,});
        }

                
        const actualTime = Math.floor(message.createdTimestamp / 1000);
        const workDelay = MinMaxTime[2] * 60;
        const lastDid = parseInt(tag.cooldowns.split(",")[3]);

        if ((lastDid + workDelay) > actualTime) return;

        
        const will = randomIntFromInterval(1,3);
        if (will === 1) {
            const percentage = randomIntFromInterval(1,100);
            const wonMontant = parseInt( (percentage / 100 ) * (MinMaxTime[1]-MinMaxTime[0])+MinMaxTime[0] );

            if (isNaN(wonMontant)) return;

            await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + wonMontant},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
        }
        
        await TagsEconomyUsers.update({cooldowns: `${tag.cooldowns.split(",")[0]},${tag.cooldowns.split(",")[1]},${tag.cooldowns.split(",")[2]},${actualTime}`}, { where: { GUID: GUID } });
    }
    

    

    
    // ADMIN COMMANDS
    
    if (message.content === "=helpadmin1" && message.author.id === "595655955572719646") {
        message.channel.send('Liste commandes admin du bot : \n:arrow_right: =setstatus1 [`WATCHING, STREAMING, PLAYING, COMPETING, LISTENING`] "`status`" \n:arrow_right: =viewstats1 \n:arrow_right: =get1 \n:arrow_right: =send1 [`111`,`222`] <`COLOR`> |`title`| "`description`" \n:arrow_right: =fetchInvite1 <`guildId`> |`channelId`| \n:arrow_right: =initCACBTC1 "`CAC`"');

    }

    if (message.content.startsWith("=setstatus1") && message.author.id === "595655955572719646") {
        const type = message.content.substring(
            message.content.indexOf("[") + 1,
            message.content.indexOf("]")
        );
        const status = message.content.substring(
            message.content.indexOf('"') + 1,
            message.content.lastIndexOf('"')
        );
        client.user.setPresence({ activities: [{name: `${status}`, type: `${type}`}], status: 'online'}); 
    }

    if (message.content === "=viewstats1" && message.author.id === "595655955572719646") {
        var strresult = `Nb de serveurs : ${client.guilds.cache.size}\n`;

        client.guilds.cache.forEach(guild => {
            strresult += `**${guild.name}** -- \`${guild.id}\` -- \`${guild.icon}\` -- ${guild.memberCount} membres -- Rejoint : *${moment(guild.joinedTimestamp).utcOffset("+0100").format("DD/MM/YYYY HH:mm")}* -- Owner : \`${guild.ownerId}\` \n`;
        });

        const noop = () => {};
        fs.writeFile("messageover.md", strresult, noop);
            message.channel.send({
                files: [{
                    attachment: "messageover.md",
                    name: "messageover.md"
                    }],
                content: "Résultat :",
        });
    }

    if (message.content.startsWith("=send1") && message.author.id === "595655955572719646") {
        const channels = message.content.substring(
            message.content.indexOf("[") + 1,
            message.content.indexOf("]")
        ).split(",");
        
        const color = message.content.substring(
            message.content.indexOf('<') + 1,
            message.content.indexOf('>')
        );
        const title = message.content.substring(
            message.content.indexOf('|') + 1,
            message.content.lastIndexOf('|')
        );
        const description = message.content.substring(
            message.content.indexOf('"') + 1,
            message.content.lastIndexOf('"')
        );

        const embedToSend = new MessageEmbed().setColor(color).setTitle(title).setDescription(description).setTimestamp().setFooter({ text : 'NitsuBot - RMP — Annonce officielle', iconURL: 'https://i.imgur.com/CMSbBqr.png'});

        channels.forEach(channel => {
            client.channels.cache.get(channel).send({embeds: [embedToSend]});
        });
    }

    if (message.content === "=get1" && message.author.id === "595655955572719646") {
        var strresult = "Salons :"

        for (i = 0; i < client.guilds.cache.size; i++) {
            let guild = client.guilds.cache.at(i);
            var tagguild = await Tags.findOne({ where: { guildid: guild.id } })
            strresult += `\n**${guild.id} - ${guild.name}**\n`
            strresult += `Modo : ${tagguild?.wheretoreply || "Aucun"} - ${client.channels.cache.get(tagguild?.wheretoreply)?.name || "Aucun"} |`;
            guild.channels.cache.forEach(channel => {
                if (channel.isText() && channel.type != "GUILD_CATEGORY") {
                    strresult += `| ${channel.name} - ${channel.id} `;
                }
            });
        }
        
        

        const noop = () => {};
        fs.writeFile("messageover.md", strresult, noop);
            message.channel.send({
                files: [{
                    attachment: "messageover.md",
                    name: "messageover.md"
                }],
                content: "Résultat :",
            });
    }


    if (message.content.startsWith("=fetchInvite1") && message.author.id === "595655955572719646") {
        
        const guildtosearch = message.content.substring(
            message.content.indexOf("<") + 1,
            message.content.indexOf(">")
        );
        const channel = message.content.substring(
            message.content.indexOf("|") + 1,
            message.content.lastIndexOf("|")
        );
        const guild = client.guilds.cache.get(guildtosearch);


        guild.invites.create(channel).then(invite => {
            message.channel.send(invite.url);
        });
    }

    if (message.content.startsWith("=initCACBTC1") && message.author.id === "595655955572719646") {

        const cac = message.content.substring(
            message.content.indexOf(`"`) + 1,
            message.content.lastIndexOf(`"`)
        );

        let tag222 = await TagsEconomyGuilds.findOne({ where: { guildId: "ADMIN" } });
        if (!tag222) {
            tag222 = await TagsEconomyGuilds.create({ guildId: "ADMIN", cac: "210,400,150,300,250,800,1000,421,350,503", btc: 20000});
        }
    
    
        var btc = tag2.btc;
    
        const url = new URL("http://api.coinlayer.com/api/live");
        url.searchParams.append("access_key", "YOUR TOKEN HERE"); // INSERER VOTRE TOKEN ICI
        url.searchParams.append("symbols", "BTC")
        try {
            const { data } = await axios.get(url.href);
            if (data.rates.BTC) {
                btc = parseInt(data.rates.BTC)
            }
            client.channels.cache.get("987431967836479528").send("Cours du bitcoin et du CAC mis à jour !")
    
        } catch (error) {
            client.channels.cache.get("987431967836479528").send(`Cours du CAC uniquement mis à jour ! <@595655955572719646> Log erreur BTC : ${error}`)
        }
        
        await TagsEconomyGuilds.update({cac: cac}, { where: { guildId: "ADMIN" } });
        await TagsEconomyGuilds.update({btc: btc}, { where: { guildId: "ADMIN" } });
    }
    
});






client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand() && !interaction.isButton() && !interaction.isSelectMenu()) return;

    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Erreur : impoosible d’exécuter cette commande, si cette erreur persiste, veuillez contacter le support : https://discord.gg/ZQVpjMZJqp");
            return interaction.reply({embeds: [embederror]});
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
            const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Pas de musique en cours de lecture à mettre en pause !");
            if (!queue?.playing) {return interaction.reply({embeds: [embederror]});};
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
            const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Pas de musique en cours de lecture à passer !");
            if (!queue?.playing) {return interaction.reply({embeds: [embederror]});};
            await queue.skip();
            interaction.reply(":track_next: Musique passée");
            interaction.deleteReply();
        }

        else if (interaction.customId === "playerstop") {
            const queue = player.getQueue(interaction.guildId);
            const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Pas de musique en cours de lecture à arrêter !");
            if (!queue?.playing) {return interaction.reply({embeds: [embederror]});};
            await queue.stop();
            interaction.reply(":stop_button: Lecture arrêtée");
            interaction.message.delete();
        }

        else if (interaction.customId === "playersee") {
            const queue = player.getQueue(interaction.guildId);
            const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Pas de musique en cours de lecture !");
            if (!queue?.playing) {return interaction.reply({embeds: [embederror]});};
            const currentTrack = queue.current;
            const tracks = queue.tracks.slice(0, 15).map((m, i) => {
                return `${i + 1}. [**${m.title}**](${m.url}) - ${
                    m.requestedBy.tag
                }`;
            });
            const embedqueue = new MessageEmbed().setTitle("File d’attente des musiques").setDescription(`${tracks.join("\n")}${queue.tracks.length > tracks.length? `\n...${queue.tracks.length - tracks.length === 1? `${queue.tracks.length - tracks.length} autre chanson`: `${queue.tracks.length - tracks.length} autres chansons`}`: ""}`).setColor("RANDOM").addField("Musique actuelle", `🎶 | [**${currentTrack.title}**](${currentTrack.url}) - ${currentTrack.requestedBy.tag}`,).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
            interaction.reply({embeds: [embedqueue]});
        }

        else if (interaction.customId === "playerlyrics") {
            const queue = player.getQueue(interaction.guildId);
            const title = queue.current.title

            const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Pas de musique en cours de lecture !");
            if (!title) {return interaction.reply({embeds: [embederror]});};
          interaction.reply("Paroles :")
          
            const sendLyrics = (songTitle) => {return createResponse(songTitle).then((res) => {
              interaction.channel.send(res);}).catch((err) => console.log({ err }));};

            sendLyrics(title);
        }

        else if (interaction.customId.startsWith("ticket")) {
            let tag = await Tags.findOne({ where: { guildid: interaction.guild.id } });
            
            const embederror = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Il manque une étape pour pouvoir envoyer un panel de tickets ! Faites d’abord la commande `/setup`");
            if (!tag) return interaction.reply({embeds: [embederror]}); 
            
            const roleid = interaction.customId.substring(
                interaction.customId.indexOf("s") + 1,
                interaction.customId.indexOf("/")
            );
            const ticketTheme = interaction.customId.substring(
                interaction.customId.indexOf("/") + 1,
                interaction.customId.lastIndexOf("&")
            );
            
            const embederror2 = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Impossible de créer un ticket").setDescription("Le rôle du staff n'existe peut être plus");
            if (!roleid) return interaction.reply({embeds: [embederror2]});

            var numbertickets = []; 
            interaction.guild.channels.cache.forEach(channelToCheck => {
                if (channelToCheck.name.includes(interaction.user.tag.replace("#", "-").toLowerCase())) {
                    numbertickets.push("1");
                }
            });
            const embedMax = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTick:939475841803505664> Impossible de créer plus de tickets pour vous").setDescription("Impossible de créer davantage de tickets pour vous ! Vous avez atteint le maximum de tickets simultanés par personne autorisés sur ce serveur.");
            
            if (!tag.maxtickets) tag.maxtickets = 5;
            if (numbertickets.length >= tag.maxtickets) return interaction.reply({embeds: [embedMax], ephemeral: true})

            interaction.guild.channels.create(`ticket-${interaction.user.tag.replace("#", "-")}`, {
                type: "GUILD_TEXT",
                permissionOverwrites: [{
                    id: interaction.guild.roles.everyone.id,
                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                    id: roleid,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY", "EMBED_LINKS", "CREATE_PUBLIC_THREADS", "CREATE_PRIVATE_THREADS", "ATTACH_FILES", "ADD_REACTIONS"]
                },
                {
                    id: interaction.member.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY", "CREATE_PUBLIC_THREADS", "CREATE_PRIVATE_THREADS", "ATTACH_FILES", "ADD_REACTIONS"]
                }],
            }).then(channel => {
                let categorytoadd = interaction.guild.channels.cache.get(tag.wheretocontactstaff);

                if (categorytoadd) {
                    channel.setParent(categorytoadd, {lockPermissions: false});
                    interaction.reply({ content: `<:NitsuGreenTickRound:977520117216862239> Ticket créé dans ${channel}`, ephemeral: true });

                    const embedstaff = new MessageEmbed().setColor("GREEN").setTitle(":ticket: Votre ticket a bien été créé !").setDescription(`**Client :** ${interaction.user.tag} \n**Ticket:** ${ticketTheme} \n\nVous serez rapidement recontacté ici par le staff !`).setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
                    const rowbuttons = new MessageActionRow().addComponents(new MessageButton().setCustomId(`savetranscript:${interaction.user.id}/${interaction.user.tag}&${ticketTheme}&`).setLabel("Exporter la transcription").setStyle("PRIMARY").setEmoji("📝"), new MessageButton().setCustomId(`archive${interaction.user.id}`).setLabel("Archiver").setStyle("SECONDARY").setEmoji("🗂️"), new MessageButton().setCustomId("closeticket").setLabel("Fermer").setStyle("DANGER").setEmoji("🔒"));
                    
                    channel.send({ content: `<@&${roleid}>`, embeds: [embedstaff], components: [rowbuttons] });
                } else {
                    const embedError = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTick:939475841803505664> Une erreur est survenue").setDescription("Une erreur est survenue lors de la création du salon. Veuillez réessayer ! (Il se peut que le nombre maximum de salons sur le serveur (500) soit atteint)");
                    interaction.reply({embeds: [embedError]});
                }
            });
        }

        else if (interaction.customId.startsWith("closetick")) {
            const embedsure = new MessageEmbed().setColor("RED").setTitle("Êtes vous sûr de vouloir fermer ce ticket ?").setDescription("Le salon sera supprimé et vous ne pourrez plus exporter la transcription (historique des messages)");
            const rowbuttons = new MessageActionRow().addComponents(new MessageButton().setCustomId("definitelyclose").setLabel("Supprimer").setStyle("DANGER").setEmoji("⛔"), new MessageButton().setCustomId("cancelclosing").setLabel("Annuler").setStyle("SECONDARY"));
            interaction.reply({ embeds: [embedsure], components: [rowbuttons] });
        }

        else if (interaction.customId.startsWith("cancelclo")) interaction.message.delete();


        else if (interaction.customId.startsWith("definitelyc")) interaction.channel.delete();


        else if (interaction.customId.startsWith("savetra")) {
            const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Sauvegarde de l’historique des messages en cours...").setDescription("Cette opération peut prendre un peu de temps en fonction du nombre de messages à exporter. Les `embed` des bots ne sont pas exportés. \n*Quoiqu’il arrive, le bot s’arrêtera à `2 000` messages pour des raisons de performance.*");
            interaction.reply({embeds: [embed]});

            const userID = interaction.customId.substring(
                interaction.customId.indexOf(":") + 1,
                interaction.customId.indexOf("/")
            );
            const userTag = interaction.customId.substring(
                interaction.customId.indexOf("/") + 1,
                interaction.customId.indexOf("&")
            );
            const theme = interaction.customId.substring(
                interaction.customId.indexOf("&") + 1,
                interaction.customId.lastIndexOf("&")
            );

            var finalArray = [];
            const handleTime = (timestamp) => moment(timestamp).format("DD/MM/YYYY - hh:mm:ss a").replace("pm", "PM").replace("am", "AM");
            
            var LastId = interaction.channel.lastMessageId;
            var size;

            while (true) {
                await interaction.channel.messages.fetch({before: LastId, limit: 100}).then(messages => {
                    for (const message of messages.values()) {
                        finalArray.push(`${handleTime(message.createdTimestamp)} **par** ${message.author.username} **:** ${message.content}@end@`);
                    }
                    LastId = messages.last()?.id;
                    size = messages.size;
                });
                if (size != 100 || finalArray >= 2000) {
                    break;
                }                
            }
             
            var tosendresult = finalArray.reverse().toString().replace(/@end@,/g, "\n").replace(/@end@/g, "");
            tosendresult = `Historique des messages du ticket de catégorie **${theme}**, créé par ${userTag} (User ID : ${userID})\n\n` + tosendresult;
            const noop = () => {};
            await fs.writeFile("messageover.md", tosendresult, noop);
            interaction.channel.send({
                files: [{
                    attachment: "messageover.md",
                    name: "messageover.md"
                }],
                content: "Historique :",
            });
            
        }

        else if (interaction.customId.startsWith("archive")) {
            const userToArchive = interaction.customId.replace("archive", "");
            interaction.channel.permissionOverwrites.edit(
                userToArchive,
                {
                    "SEND_MESSAGES": false,
                    "CREATE_PUBLIC_THREADS": false,
                    "CREATE_PRIVATE_THREADS": false,
                    "SEND_MESSAGES_IN_THREADS": false
                }
            );
            const embedArchived = new MessageEmbed().setColor("YELLOW").setTitle(`Le ticket a été archivé par ${interaction.user.tag}`).setDescription("Tant que le ticket est archivé, le client ne peux plus envoyer de message. Seul les responsables de ce ticket peuvent le désarchiver.").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
            const rowbuttonsArchived = new MessageActionRow().addComponents(new MessageButton().setCustomId(`unarchive${interaction.user.id}`).setLabel("Rouvrir le ticket").setStyle("SUCCESS").setEmoji("📂"));
            interaction.reply({ embeds: [embedArchived], components: [rowbuttonsArchived] });
        }

        else if (interaction.customId.startsWith("unarchive")) {
            const userToUnarchive = interaction.customId.replace("unarchive", "");
            
            const embedCant = new MessageEmbed().setColor("RED").setTitle(`<:NitsuRedTick:939475841803505664> Réouverture refusée`).setDescription("Seul les responsables du ticket peuvent le désarchiver !");
            if (userToUnarchive === interaction.user.id) return interaction.reply({embeds: [embedCant], ephemeral: true});

            interaction.channel.permissionOverwrites.edit(
                userToUnarchive,
                {
                    "SEND_MESSAGES": true,
                    "CREATE_PUBLIC_THREADS": true,
                    "CREATE_PRIVATE_THREADS": true,
                    "SEND_MESSAGES_IN_THREADS": true
                }
            );
            const embedUnarchived = new MessageEmbed().setColor("GREEN").setTitle(`Le ticket a été rouvert par ${interaction.user.tag}`).setDescription("Le ticket a été désarchivé. Le client peut le nouveau envoyer des messages.").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});;
            interaction.reply({ content: `<@${userToUnarchive}>`, embeds: [embedUnarchived] });
        }



        else if (interaction.customId.startsWith("bmsg")) {
            const embed = new MessageEmbed().setDescription("Tapez le message à envoyer à l’utilisateur").setColor("BLURPLE");
            await interaction.reply({embeds: [embed], ephemeral: true})

            const filterUser = response => {
                if (response.author.id === interaction.user.id) return true
            };

            interaction.channel.awaitMessages({filter: filterUser, max: 1, time: 60000, errors: ['time']})
            .then(async collected => {
                const c = collected.first().content;
                collected.first().delete()
                const command = client.commands.get("msg");
                if (command) {
                    try {
                        await command.execute(interaction,interaction.customId.substring(4),c);
                    } catch (error) {
                        console.error(error);
                        const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Erreur : impoosible d’exécuter cette commande, si cette erreur persiste, veuillez contacter le support : https://discord.gg/ZQVpjMZJqp");
                        return interaction.reply({embeds: [embederror]});
                    }
                }
            }).catch(error => {
                const embedFailed = new MessageEmbed().setColor("DARK_RED").setDescription("Vous n’avez rien envoyé. Commande annulée !")
                interaction.followUp({embeds: [embedFailed], ephemeral: true})
            })
        }

        else if (interaction.customId.startsWith("bmut")) {
            var cmd;

            if (interaction.guild.members.cache.get(interaction.customId.substring(4)).communicationDisabledUntil) cmd = "unmute";
            else cmd = "mute";
            
            
            const command = client.commands.get(cmd);
            if (command) {
                try {
                    await command.execute(interaction,interaction.customId.substring(4));
                } catch (error) {
                    console.error(error);
                    const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Erreur : impoosible d’exécuter cette commande, si cette erreur persiste, veuillez contacter le support : https://discord.gg/ZQVpjMZJqp");
                    return interaction.reply({embeds: [embederror]});
                }
            }
        }

        else if (interaction.customId.startsWith("bkic")) {
            const command = client.commands.get("kick");
            if (command) {
                try {
                    await command.execute(interaction,interaction.customId.substring(4));
                } catch (error) {
                    console.error(error);
                    const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Erreur : impoosible d’exécuter cette commande, si cette erreur persiste, veuillez contacter le support : https://discord.gg/ZQVpjMZJqp");
                    return interaction.reply({embeds: [embederror]});
                }
            }
        }

        else if (interaction.customId.startsWith("bban")) {
            const command = client.commands.get("ban");
            if (command) {
                try {
                    await command.execute(interaction,interaction.customId.substring(4));
                } catch (error) {
                    console.error(error);
                    const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Erreur : impoosible d’exécuter cette commande, si cette erreur persiste, veuillez contacter le support : https://discord.gg/ZQVpjMZJqp");
                    return interaction.reply({embeds: [embederror]});
                }
            }
        }




        
        else if (interaction.customId.startsWith("enable") || interaction.customId.startsWith("disabl")) {

            if (!interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_GUILD)) return;

            const embedError = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTick:939475841803505664> Une erreur est survenue").setDescription("Veuillez réessayer ! Peut-être que vous essayez d’activer/désactiver une commande alors que le système d’économie est désactivé sur le serveur !");
            const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Configuration du système d’économie").setDescription("Cliquez sur les boutons pour activer/désactiver les fonctionnalités");
            const row1 = new MessageActionRow()
                .addComponents(
                    new MessageButton().setLabel("Système d’économie").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disableEconomy")
                );
            const row2 = new MessageActionRow()
                .addComponents(
                    new MessageButton().setLabel("Commande Work").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl1"),
                    new MessageButton().setLabel("Commande Crime").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl2"),
                    new MessageButton().setLabel("Commande Rob").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl3"),
                    new MessageButton().setLabel("Commande Roulette (à venir)").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl4"),
                    new MessageButton().setLabel("Commande Pile ou Face").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl5")
                );
            const row3 = new MessageActionRow()
                .addComponents(
                    new MessageButton().setLabel("Marché des actions (Bourse)").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl6"),
                    new MessageButton().setLabel("Achat de Bitcoin").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("disabl7")
                );



            if (interaction.customId === "enableEconomy") {
                try {
                    var tag = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                    if (!tag) tag = await TagsEconomyGuilds.create({ guildId: interaction.guild.id, });

                    let features = tag.features.split(",");
                    features[0] = "on";

                    await TagsEconomyGuilds.update({features: features.toString()}, { where: { guildId: interaction.guild.id } })

    
                    row1.components[0].setEmoji("<:NitsuSwitchOn:984398078998114314>"); row1.components[0].customId = "disableEconomy";
                    row2.components.forEach(component => {
                        if (features[component.customId.substring(6)] === "off") {  component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.customId = `enable${component.customId.substring(6)}`; component.disabled = false;}
                        else {component.setEmoji("<:NitsuSwitchOn:984398078998114314>"); component.customId = `disabl${component.customId.substring(6)}`; component.disabled = false;}
                    });
                    row3.components.forEach(component => {
                        if (features[component.customId.substring(6)] === "off") {  component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.customId = `enable${component.customId.substring(6)}`;}
                        else {component.setEmoji("<:NitsuSwitchOn:984398078998114314>"); component.customId = `disabl${component.customId.substring(6)}`; component.disabled = false;}                         
                    });
                    await interaction.update({ components: [row1, row2, row3], embeds: [embed] });
                } catch (error) {
                    return interaction.channel.send({embeds: [embedError]})
                }
            }


            else if (interaction.customId === "disableEconomy") {
                try {
                    var tag = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                    if (!tag) tag = TagsEconomyGuilds.create({ guildId: interaction.guild.id, });

                    let features = tag.features.split(",");
                    features[0] = "off";

                    await TagsEconomyGuilds.update({features: features.toString()}, { where: { guildId: interaction.guild.id } })

                    .then(async() => {
                        row1.components[0].setEmoji("<:NitsuSwitchOff:984398007002878014>");  row1.components[0].customId = "enableEconomy";
                        row2.components.forEach(component => {
                            component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.disabled = true;                            
                        });
                        row3.components.forEach(component => {
                            component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.disabled = true;                            
                        });
                        await interaction.update({ components: [row1, row2, row3], embeds: [embed] });
                    })
                } catch (error) {
                    return interaction.channel.send({embeds: [embedError]})
                }
            }


            else if (interaction.customId.startsWith("enable")) {
                try {
                    const i = interaction.customId.substring(6);
                    
                    let tag = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                    if (!tag) return interaction.reply({embeds: [embedError]});

                    var features = tag.features.split(",");
                    features[i] = "on";

                    TagsEconomyGuilds.update({features: features.toString()}, { where: { guildId: interaction.guild.id } })
                    
                    .then(async() => {
    
                        row1.components[0].setEmoji("<:NitsuSwitchOn:984398078998114314>"); row1.components[0].customId = "disableEconomy";
                        row2.components.forEach(component => {
                            if (features[component.customId.substring(6)] === "off") {  component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.customId = `enable${component.customId.substring(6)}`; component.disabled = false;}
                            else {component.setEmoji("<:NitsuSwitchOn:984398078998114314>"); component.customId = `disabl${component.customId.substring(6)}`; component.disabled = false;}
                        });
                        row3.components.forEach(component => {
                            if (features[component.customId.substring(6)] === "off") {  component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.customId = `enable${component.customId.substring(6)}`;}
                            else {component.setEmoji("<:NitsuSwitchOn:984398078998114314>"); component.customId = `disabl${component.customId.substring(6)}`; component.disabled = false;}                         
                        });
                        await interaction.update({ components: [row1, row2, row3], embeds: [embed] });
                    })
                } catch (error) {
                    console.error(error);
                    return interaction.channel.send({embeds: [embedError]})
                }
            }


            else if (interaction.customId.startsWith("disabl")) {
                try {
                    const i = interaction.customId.substring(6);
                    
                    let tag = await TagsEconomyGuilds.findOne({ where: { guildId: interaction.guild.id } });
                    if (!tag) return interaction.reply({embeds: [embedError]});

                    var features = tag.features.split(",");
                    features[i] = "off";

                    TagsEconomyGuilds.update({features: features.toString()}, { where: { guildId: interaction.guild.id } })
                    
                    .then(async() => {
    
                        row1.components[0].setEmoji("<:NitsuSwitchOn:984398078998114314>"); row1.components[0].customId = "disableEconomy";
                        row2.components.forEach(component => {
                            if (features[component.customId.substring(6)] === "off") {  component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.customId = `enable${component.customId.substring(6)}`; component.disabled = false;}
                            else {component.setEmoji("<:NitsuSwitchOn:984398078998114314>"); component.customId = `disabl${component.customId.substring(6)}`; component.disabled = false;}
                        });
                        row3.components.forEach(component => {
                            if (features[component.customId.substring(6)] === "off") {  component.setEmoji("<:NitsuSwitchOff:984398007002878014>"); component.customId = `enable${component.customId.substring(6)}`;}
                            else {component.setEmoji("<:NitsuSwitchOn:984398078998114314>"); component.customId = `disabl${component.customId.substring(6)}`; component.disabled = false;}                         
                        });
                        await interaction.update({ components: [row1, row2, row3], embeds: [embed] });
                    })
                } catch (error) {
                    console.error(error);
                    return interaction.channel.send({embeds: [embedError]})
                }
            }
        }




        //Leaderboard

        if (interaction.customId.startsWith("ECOleaderboard:money:")) {
            const guildID = interaction.guild.id;
            const GUID = guildID + "-" + interaction.member.id;
    
            var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
            const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
    
            
            if (tag2?.features?.startsWith("on")) {
                if (!tag) {
                    tag = await TagsEconomyUsers.create({ GUID: GUID,});
                }
    
                await interaction.deferUpdate();
    
                const store = await TagsEconomyUsers.findAll({ attributes: ['GUID'] });
                const tagString = store.map(t => t.GUID).join(`,`) || "Aucun membre n’a d’argent";
                
                if (tagString) {
                    if (tagString !== 'Aucun membre n’a d’argent') {
                        const tagArray = tagString.split(",").filter(user => user.startsWith(guildID));
                        var tagObj = [];
    

                        for (const user of tagArray) {
                            let userInfos = await TagsEconomyUsers.findOne({ where: { GUID: user } }) 
                            tagObj.push(userInfos);
                        }

                        
                        const i1 = parseInt(interaction.customId.substring(interaction.customId.lastIndexOf(":")+1, interaction.customId.indexOf("-")));
                        const i2 = parseInt(interaction.customId.substring(interaction.customId.indexOf("-")+1));

                        var sortedTagObj = tagObj.sort(compareMoney).reverse().slice(i1, i2);


                        var description = "";
                        sortedTagObj.forEach((object, index) => {
                            description += `\`${i1+index+1}\` - <@${object.GUID.split("-")[1]}> : <:NitsuCoin:984446683284910080> ${parseInt(object.money.split(",")[0]) + parseInt(object.money.split(",")[1])} \n`
                        });

                        const embed = new MessageEmbed().setColor("AQUA").setTitle("Classement par Argent").setDescription(description)
                        var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setCustomId(`ECOleaderboard:money:${i1-10}-${i1}`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`ECOleaderboard:money:${i2}-${i2+10}`));
                        
                        if (i1 === 0) row.components[0].disabled = true;
                        if (tagObj.length <= i1 + 10) row.components[1].disabled = true;

                        interaction.editReply({embeds: [embed], components: [row]});

                        
                       
                    } else {
                        const embedError = new MessageEmbed().setColor("RED").setTitle("Classement").setDescription("Aucun membre n’a d’argent");
                        interaction.editReply({embeds: [embedError]});
                    };
    
                } else {
                    const embedError = new MessageEmbed().setColor("RED").setTitle("Non trouvé").setDescription("Une erreur est survenue");
                    interaction.editReply({embeds: [embedError]});
                };
    
            } else {
                const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
                interaction.reply({embeds: [embedNotConfig]});
            }
        }


        else if (interaction.customId.startsWith("ECOleaderboard:actions:")) {
            const guildID = interaction.guild.id;
            const GUID = guildID + "-" + interaction.member.id;
    
            var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
            const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
    
            
            if (tag2?.features?.startsWith("on")) {
                if (!tag) {
                    tag = await TagsEconomyUsers.create({ GUID: GUID,});
                }
    
                await interaction.deferUpdate();
    
                const store = await TagsEconomyUsers.findAll({ attributes: ['GUID'] });
                const tagString = store.map(t => t.GUID).join(`,`) || "Aucun membre n’a d’argent";
                
                if (tagString) {
                    if (tagString !== 'Aucun membre n’a d’argent') {
                        const tagArray = tagString.split(",").filter(user => user.startsWith(guildID));
                        var tagObj = [];
    

                        for (const user of tagArray) {
                            let userInfos = await TagsEconomyUsers.findOne({ where: { GUID: user } }) 
                            tagObj.push(userInfos);
                        }

                        
                        const i1 = parseInt(interaction.customId.substring(interaction.customId.lastIndexOf(":")+1, interaction.customId.indexOf("-")));
                        const i2 = parseInt(interaction.customId.substring(interaction.customId.indexOf("-")+1));

                        var sortedTagObj = tagObj.sort(compareActions).reverse().slice(i1, i2);


                        var description = "";
                        sortedTagObj.forEach((object, index) => {
                            const arrA = object.actions.split(",");
                            var Na = 0;
                            arrA.forEach(number => Na += parseInt(number));
                            description += `\`${i1+index+1}\` - <@${object.GUID.split("-")[1]}> : <:NitsuCac40:984448948867575839> ${Na} \n`
                        });

                        const embed = new MessageEmbed().setColor("AQUA").setTitle("Classement par Actions").setDescription(description)
                        var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setCustomId(`ECOleaderboard:actions:${i1-10}-${i1}`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`ECOleaderboard:actions:${i2}-${i2+10}`));
                        
                        if (i1 === 0) row.components[0].disabled = true;
                        if (tagObj.length <= i1 + 10) row.components[1].disabled = true;

                        interaction.editReply({embeds: [embed], components: [row]});

                        
                       
                    } else {
                        const embedError = new MessageEmbed().setColor("RED").setTitle("Classement").setDescription("Aucun membre n’a d’argent");
                        interaction.editReply({embeds: [embedError]});
                    };
    
                } else {
                    const embedError = new MessageEmbed().setColor("RED").setTitle("Non trouvé").setDescription("Une erreur est survenue");
                    interaction.editReply({embeds: [embedError]});
                };
    
            } else {
                const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
                interaction.reply({embeds: [embedNotConfig]});
            }
        }

        else if (interaction.customId.startsWith("ECOleaderboard:btc:")) {
            const guildID = interaction.guild.id;
            const GUID = guildID + "-" + interaction.member.id;
    
            var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
            const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
    
            
            if (tag2?.features?.startsWith("on")) {
                if (!tag) {
                    tag = await TagsEconomyUsers.create({ GUID: GUID,});
                }
    
                await interaction.deferUpdate();
    
                const store = await TagsEconomyUsers.findAll({ attributes: ['GUID'] });
                const tagString = store.map(t => t.GUID).join(`,`) || "Aucun membre n’a d’argent";
                
                if (tagString) {
                    if (tagString !== 'Aucun membre n’a d’argent') {
                        const tagArray = tagString.split(",").filter(user => user.startsWith(guildID));
                        var tagObj = [];
    

                        for (const user of tagArray) {
                            let userInfos = await TagsEconomyUsers.findOne({ where: { GUID: user } }) 
                            tagObj.push(userInfos);
                        }

                        
                        const i1 = parseInt(interaction.customId.substring(interaction.customId.lastIndexOf(":")+1, interaction.customId.indexOf("-")));
                        const i2 = parseInt(interaction.customId.substring(interaction.customId.indexOf("-")+1));

                        var sortedTagObj = tagObj.sort(compareBitcoin).reverse().slice(i1, i2);


                        var description = "";
                        sortedTagObj.forEach((object, index) => {
                            description += `\`${i1+index+1}\` - <@${object.GUID.split("-")[1]}> : <:NitsuBitcoin:984447744208953384> ${object.btc} \n`
                        });

                        const embed = new MessageEmbed().setColor("AQUA").setTitle("Classement par Bitcoin").setDescription(description)
                        var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setCustomId(`ECOleaderboard:btc:${i1-10}-${i1}`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`ECOleaderboard:btc:${i2}-${i2+10}`));
                        
                        if (i1 === 0) row.components[0].disabled = true;
                        if (tagObj.length <= i1 + 10) row.components[1].disabled = true;

                        interaction.editReply({embeds: [embed], components: [row]});

                        
                       
                    } else {
                        const embedError = new MessageEmbed().setColor("RED").setTitle("Classement").setDescription("Aucun membre n’a d’argent");
                        interaction.editReply({embeds: [embedError]});
                    };
    
                } else {
                    const embedError = new MessageEmbed().setColor("RED").setTitle("Non trouvé").setDescription("Une erreur est survenue");
                    interaction.editReply({embeds: [embedError]});
                };
    
            } else {
                const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
                interaction.reply({embeds: [embedNotConfig]});
            }
        }









        // Shop

        else if (interaction.customId.startsWith("ECOshop:")) {

            let guildID = interaction.guild.id;
            let tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
            

            if (tag2?.features?.startsWith("on")) {
            
                if (tag2.items && tag2.items !== "") {

                    const itemsArray = tag2.items.split(",");

                    const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");
                    if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});

                    var fields = [];
                    for (const item of itemsArray) {
                        var itemInfos = item.split("/");
                        itemInfos[5] = itemInfos[5] === "skip" ? "" : `+ Rôle ${interaction.guild.roles.cache.get(itemInfos[5]).name}`;

                        let field = {name: `${itemInfos[0]} – <:NitsuCoin:984446683284910080> ${itemInfos[2]} ${itemInfos[5]}`, value: itemInfos[1]}
                        fields.push(field);
                    }

                    const i1 = parseInt(interaction.customId.substring(interaction.customId.lastIndexOf(":")+1, interaction.customId.indexOf("-")));
                    const i2 = parseInt(interaction.customId.substring(interaction.customId.indexOf("-")+1));

                    const sortedFields = fields.sort(compareActions).slice(i1, i2);
                            
                    const embed = {
                        color: "PURPLE",
                        title: `Boutique de ${interaction.guild.name}`,
                        description: "Pour acheter un objet, faites la commande `/item Acheter` \nPour en savoir plus sur l’un des objets,\nfaites la commande `/item Afficher les infos`",
                        fields: sortedFields,
                    };

                    var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setCustomId(`ECOshop:${i1-10}-${i1}`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`ECOshop:${i2}-${i2+10}`));

                    if (i1 === 0) row.components[0].disabled = true;
                    if (fields.length <= i1 + 10) row.components[1].disabled = true;
                    
                    interaction.update({embeds: [embed], components: [row]});
                    

                } else {
                    const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");
                    interaction.reply({embeds : [embednotfound]});
                }
                        
            } else {
                const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
                interaction.reply({embeds: [embedNotConfig]});
            }
        }


        //Inventory

        else if (interaction.customId.startsWith("ECOinv:")) {

            const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
            const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");
            const embednotfounduser = new MessageEmbed().setColor("DARK_RED").setDescription(":bulb: Ce membre ne possède aucun objet !");
    
            
            const guildID = interaction.guild.id;
            const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
            
            const membre = interaction.guild.members.cache.get(interaction.customId.substring(interaction.customId.indexOf(":")+1, interaction.customId.lastIndexOf(":")));
            const GUID = guildID + "-" + membre.id;
    
            var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
            
    
            if (tag2?.features?.startsWith("on")) {
    
                if (!tag) {
                    tag = await TagsEconomyUsers.create({ GUID: GUID,});
                }
            
                if (tag2.items && tag2.items !== "") {
    
                    if (tag.items && tag.items !== "") {
    
    
    
                        const itemsArray = tag2.items.split(",").filter(item => tag.items.includes(`${item.substring(0, item.indexOf("/"))}/`));
                        const itemsInvalid = tag.items.split(",").filter(item => !tag2.items.includes(`${item.substring(0, item.indexOf("/"))}/`));
                    
                        if (itemsInvalid.length !== 0) {
                            var newArray = tag.items.split(",").filter(item => !itemsInvalid.toString().includes(item)).toString();
                            await TagsEconomyUsers.update({items: newArray}, { where: { GUID: GUID } });
                        }
    
                        if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfounduser]});
        
                        var fields = [];
                        for (const item of itemsArray) {
                            var itemInfos = item.split("/");
                            var itemPossesed = tag.items.split(",").filter(item => item.startsWith(`${itemInfos[0]}/`)).toString().split("/");
        
                            let field = {name: `${itemInfos[0]} – ${itemPossesed[1]}`, value: itemInfos[1]}
                            fields.push(field);
                        }

                        const i1 = parseInt(interaction.customId.substring(interaction.customId.lastIndexOf(":")+1, interaction.customId.indexOf("-")));
                        const i2 = parseInt(interaction.customId.substring(interaction.customId.indexOf("-")+1));

                        const sortedFields = fields.slice(i1, i2);
                                
                        const embed = {
                            color: "PURPLE",
                            title: `Inventaire de ${membre.displayName}`,
                            description: "Pour utiliser un objet, faites la commande `/item Utiliser` \nPour en savoir plus sur l’un des objets,\nfaites la commande `/item Afficher les infos`",
                            fields: sortedFields,
                        };
        
                        var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setCustomId(`ECOinv:${membre.id}:${i1-10}-${i1}`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`ECOinv:${membre.id}:${i2}-${i2+10}`));
        
                        if (i1 === 0) row.components[0].disabled = true;
                        if (fields.length <= i1 + 10) row.components[1].disabled = true;
                        
                        interaction.update({embeds: [embed], components: [row]});
    
    
    
    
                    } else {
                        interaction.reply({embeds : [embednotfounduser]});
                    }
    
                } else {
                    interaction.reply({embeds : [embednotfound]});
                }
                        
            } else {
                interaction.reply({embeds: [embedNotConfig]});
            }
        }










        //Enterprises

    else if (interaction.customId.startsWith("EN")) {
        if (!interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_GUILD)) return;

        const embedError = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTick:939475841803505664> Une erreur est survenue").setDescription("Veuillez réessayer ! Peut-être que vous essayez d’activer/désactiver une commande alors que le système d’économie est désactivé sur le serveur !");
        const embed = new MessageEmbed().setColor("BLURPLE").setTitle("Configuration du système d’enterprises").setDescription("Cliquez pour activer/désactiver");
        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton().setLabel("Système d’entreprise").setStyle("SECONDARY").setEmoji("<:NitsuSwitchOn:984398078998114314>").setCustomId("ENdisableEnterprises")
            );



        if (interaction.customId === "ENenableEnterprises") {
            try {
                var tag = await TagsEnterprisesGuilds.findOne({ where: { guildId: interaction.guild.id } });
                if (!tag) tag = await TagsEnterprisesGuilds.create({ guildId: interaction.guild.id, });


                await TagsEnterprisesGuilds.update({features: "on"}, { where: { guildId: interaction.guild.id } })

                row1.components[0].setEmoji("<:NitsuSwitchOn:984398078998114314>"); row1.components[0].customId = "ENdisableEnterprises";

                await interaction.update({ components: [row1], embeds: [embed] });

            } catch (error) {
                return interaction.channel.send({embeds: [embedError]})
            }
        }


        else if (interaction.customId === "ENdisableEnterprises") {
            try {
                var tag = await TagsEnterprisesGuilds.findOne({ where: { guildId: interaction.guild.id } });
                if (!tag) tag = TagsEnterprisesGuilds.create({ guildId: interaction.guild.id, });


                await TagsEnterprisesGuilds.update({features: "off"}, { where: { guildId: interaction.guild.id } })

                row1.components[0].setEmoji("<:NitsuSwitchOff:984398007002878014>");  row1.components[0].customId = "ENenableEnterprises";

                await interaction.update({ components: [row1], embeds: [embed] });
                
            } catch (error) {
                return interaction.channel.send({embeds: [embedError]})
            }
        }
    }



    

    //Enterprises - Store

    else if (interaction.customId.startsWith("eNstore")) {
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admin-enterprises fonctionnalités` puis de cliquer pour activer !");
        const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucun objet n’a été créé sur le serveur ! Veuillez demandez à un admin d’en créer un d’abord !");

        
        const guildID = interaction.guild.id;
        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: guildID } });

        const GUID = guildID + "-" + interaction.member.id
        var tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });

        if (!tag) {
            tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
        }


        if (tag2?.features?.startsWith("on")) {
        
            if (tag2.items && tag2.items !== "") {

                const itemsArray = tag2.items.split(",");

                if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});

                var fields = [];
                for (const item of itemsArray) {
                    var itemInfos = item.split("/");

                    let itemPossesed = tag.items?.split(",")?.find(item => item.startsWith(`${itemInfos[0]}/`))?.toString()?.split("/");
                    
                    var ch3 = itemPossesed ? `– ${itemPossesed[1]} Construit <:NitsuGreenTickRound:977520117216862239>` : ""

                    let field = {name: `${itemInfos[0]} ${ch3}`, value: `Matériaux requis : ${itemInfos[2].replace(/;/g, ", ").replace(/-/g, " : ")} \n*${itemInfos[1]}*`}
                    fields.push(field);
                }


                const i1 = parseInt(interaction.customId.substring(interaction.customId.lastIndexOf(":")+1, interaction.customId.indexOf("-")));
                const i2 = parseInt(interaction.customId.substring(interaction.customId.indexOf("-")+1));

                const sortedFields = fields.slice(i1, i2);
                        
                const embed = {
                    color: "PURPLE",
                    title: `Boutique de ${interaction.guild.name}`,
                    description: "Pour construire un objet, faites la commande `/build`",
                    fields: sortedFields,
                };

                var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setCustomId(`eNstore:${i1-10}-${i1}`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`eNstore:${i2}-${i2+10}`));

                if (i1 === 0) row.components[0].disabled = true;
                if (fields.length <= i1 + 10) row.components[1].disabled = true;
                
                interaction.update({embeds: [embed], components: [row]});
                

            } else {
                interaction.reply({embeds : [embednotfound]});
            }
                    
        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
    }


    //Enterprises - List

    else if (interaction.customId.startsWith("eNenterprise")) {
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admin-enterprises fonctionnalités` puis de cliquer pour activer !");
        const embednotfound = new MessageEmbed().setColor("DARK_RED").setDescription("<:NitsuRedTickRound:977520171734401054> Aucune entreprise n’a été créée sur le serveur ! Veuillez demandez à un admin d’en créer une d’abord !");

        const guildID = interaction.guild.id;
        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: guildID } });

        const GUID = guildID + "-" + interaction.member.id
        var tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });
        
        if (!tag) {
            tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
        }

        if (tag2?.features?.startsWith("on")) {
        
            if (tag2.enterprises && tag2.enterprises !== "") {
            
                const itemsArray = tag2.enterprises.split(",");

                if (itemsArray.length === 0) return interaction.reply({embeds: [embednotfound]});

                var fields = [];
                for (const item of itemsArray) {
                    var itemInfos = item.split("/");
                    var ch1 = itemInfos[6] === "skip" ? "" : `– ${itemInfos[6]} ${itemInfos[7]}`
                    var ch2 = itemInfos[8] === "skip" ? "" : `– ${itemInfos[8]} ${itemInfos[9]}`

                    var ch3 = tag.enterprises?.includes(itemInfos[0]) ? `– Acquise <:NitsuGreenTickRound:977520117216862239>` : ""

                    let field = {name: `${itemInfos[0]} – Produit ${itemInfos[3]} ${itemInfos[2]} toutes les ${itemInfos[4]} heure(s) ${ch3}`, value: `Prix : <:NitsuCoin:984446683284910080> ${itemInfos[5]} ${ch1} ${ch2} \n*${itemInfos[1]}*`}
                    fields.push(field);
                }
                
                const i1 = parseInt(interaction.customId.substring(interaction.customId.lastIndexOf(":")+1, interaction.customId.indexOf("-")));
                const i2 = parseInt(interaction.customId.substring(interaction.customId.indexOf("-")+1));

                const sortedFields = fields.slice(i1, i2);
                        
                const embed = {
                    color: "PURPLE",
                    title: `Liste des entreprises de ${interaction.guild.name}`,
                    description: "Pour acheter ou revendre une entreprise, faites la commande `/enterprise`",
                    fields: sortedFields,
                };

                var row = new MessageActionRow().addComponents(new MessageButton().setLabel("Page précédente").setEmoji("⬅️").setStyle("PRIMARY").setCustomId(`eNenterprise:${i1-10}-${i1}`), new MessageButton().setLabel("Page suivante").setEmoji("➡️").setStyle("PRIMARY").setCustomId(`eNenterprise:${i2}-${i2+10}`));

                if (i1 === 0) row.components[0].disabled = true;
                if (fields.length <= i1 + 10) row.components[1].disabled = true;
                
                interaction.update({embeds: [embed], components: [row]});

            } else {
                interaction.reply({embeds : [embednotfound]});
            }
                    
        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
    }


    } 
    







    
    else if (interaction.isSelectMenu()) {
        
        if (interaction.customId = "helpmenu") {
            const rowhelp = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId("helpmenu").addOptions([
                        {   label: "Accueil",
                            description: "Informations utiles sur le bot",
                            value: "helpselecthome",
                            default: true,
                            emoji: "<:NitsuHome:979311763411587082>"
                        },
                        {   label: "Informations & Utilitaires",
                            description: "Commandes pour obtenir des informations sur qcch, ou autres trucs pratiques",
                            value: "helpselectinfo",
                            emoji: "<:NitsuInfo:979488492646170624>"
                        },
                        {   label: "Modération",
                            description: "Commandes pour la modération et l’auto-mod",
                            value: "helpselectmod",
                            emoji: "<:NitsuMod:979313073380810752>"
                        },
                        {   label: "Musique / Vocal",
                            description: "Commandes relatives à l’écoute de musique et d’autres fonctionnalités vocales",
                            value: "helpselectmusic",
                            emoji: "<:NitsuMusic:979312004009435156>"
                        },
                        {   label: "Contact / Ticket",
                            description: "Commandes pour contacter les membres ou gérer les tickets",
                            value: "helpselectcontact",
                            emoji: "<:NitsuMessage:979312588099829770>"
                        },
                        {   label: "Configuration du bot",
                            description: "Personnaliser le bot et gérer ses fonctionnalités",
                            value: "helpselectconfig",
                            emoji: "<:NitsuConfig:979312242480791562>"
                        },
                        {   label: "Fermer",
                            description: "Quitter le menu d’aide",
                            value: "helpselectclose",
                            emoji: "<:NitsuRedTickRound:977520171734401054>"
                        }]));

            if (interaction.values[0] === "helpselecthome") {
                const embedhome = new MessageEmbed().setColor("GOLD").setTitle("Aide de NitsuBot - Accueil").setThumbnail("https://i.imgur.com/4MfQgrk.png").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'}).setDescription("Bienvenue sur la page d’aide de NitsuBot. Utilisez le menu ci-dessous pour naviguer entre les différent groupes de commandes.")
                    .addFields(
                        {name: "`/ping`", value: "Obtenir le temps de réponse du bot"},
                        {name: "Liens utiles", value: "[Inviter le bot](https://discord.com/oauth2/authorize?client_id=919251061066317896&permissions=8&scope=bot%20applications.commands) \n[Serveur Support & Communauté](https://discord.gg/ZQVpjMZJqp) \n[Statut du bot](https://nitsubot-rmp.statuspage.io/) \n[Projet GitHub](https://github.com/Nitsugua38/Nitsubot-Revolutionary-Multi-Purposes)"}
                    );
                
                rowhelp.components.forEach(co => {
                    co.options[1].default = false; co.options[2].default = false; co.options[3].default = false; co.options[4].default = false; co.options[5].default = false; co.options[0].default = true;
                });
                interaction.update({embeds: [embedhome], components: [rowhelp]});
            }
    
            if (interaction.values[0] === "helpselectinfo") {
                const embedinfo = new MessageEmbed().setColor("AQUA").setTitle("Aide de NitsuBot - Informations & Utilitaires").setThumbnail("https://i.imgur.com/4MfQgrk.png").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'}).setDescription("Commandes pour obtenir des informations sur qcch, ou autres trucs pratiques. Utilisez le menu ci-dessous pour naviguer entre les différent groupes de commandes.")
                    .addFields(
                        {name: "`/user`", value: "Donne des informations utiles et précises sur un membre"},
                        {name: "`/say`", value: "Envoie un message dans un embed (comme les bots)"}
                    );
                
                rowhelp.components.forEach(co => {
                    co.options[0].default = false; co.options[2].default = false; co.options[3].default = false; co.options[4].default = false; co.options[5].default = false; co.options[1].default = true;
                });
                interaction.update({embeds: [embedinfo], components: [rowhelp]});
            }

            if (interaction.values[0] === "helpselectmod") {
                const embedinfo = new MessageEmbed().setColor("ORANGE").setTitle("Aide de NitsuBot - Modération").setThumbnail("https://i.imgur.com/4MfQgrk.png").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'}).setDescription("Commandes pour la modération et l’auto-mod. Utilisez le menu ci-dessous pour naviguer entre les différent groupes de commandes.")
                    .addFields(
                        {name: "`/channel`", value: "Permet de verouiller un salon (empêcher un rôle d’y envoyer des messages), de le rendre privé (seul certains rôles peuvent y accéder), et inversement \n*Permission requise : Gérer les salons*"},
                        {name: "`/kick`", value: "Expulser un membre du serveur en lui envoyant un message \n*Permission requise : Expulser des membres*"},
                        {name: "`/ban`", value: "Bannir un membre du serveur en lui envoyant un message \n*Permission requise : Bannir des membres*"},
                        {name: "`/mute`", value: "Réduit un membre au silence (l’empêche d’envoyer des messages) pendant un certain temps \n*Permission requise : Modérer les membres*"},
                        {name: "`/unmute`", value: "Réautorise un membre à parler \n*Permission requise : Modérer les membres*"},
                        {name: "`/raidmode`", value: "Active / Désactive le Mode Raid : supprime toutes les invitations et empêche la création de nouvelles. Très efficace pour empêcher de nouveaux utilisateurs mal-intentionnés de rejoindre «en renfort» quand certains ont déjà commencés un raid (qui sera de toute façon réprimé par l’Auto-Mod, voir ci-dessous). \n*Permission requise : Administrateur*"},
                        {name: "<:NitsuShield:977535802613579786> Auto-Mod", value: "L’Auto-Modération permet de gérer le serveur, de manière automatique, et simplifier ainsi la tâche des modos. \n—Elle détecte le spam : à partir de 20 messages en 25 secondes s’ils sont différents, et 6 messages en 25 secondes si les messages répétes sont identiques (le bot avertit un peu avant). Sanction : 10 minutes de mute (à changer dans une prochaine mise à jour *Sanctions*). \n—Elle détecte le *mass mentions* : Mention `@everyone` ou 3+ mentions en un message = X temps de mute (personnalisable). \n—Elle détecte les jurons, mots vulgaires, insultes et les censure automatiquement. \n—Elle bloque enfin les pubs (sauf dans certains salons : personnalisable). \nPour activer et personnaliser, tout cela, faites la commande `/setup` (+ d’infos sur la page d’aide *Configuration*) "}
                    );
                
                rowhelp.components.forEach(co => {
                    co.options[0].default = false; co.options[1].default = false; co.options[3].default = false; co.options[4].default = false; co.options[5].default = false; co.options[2].default = true;
                });
                interaction.update({embeds: [embedinfo], components: [rowhelp]});
            }

            if (interaction.values[0] === "helpselectmusic") {
                const embedinfo = new MessageEmbed().setColor("FUCHSIA").setTitle("Aide de NitsuBot - Musique & Vocal").setThumbnail("https://i.imgur.com/4MfQgrk.png").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'}).setDescription("Commandes relatives à l’écoute de musique et d’autres fonctionnalités vocales. Utilisez le menu ci-dessous pour naviguer entre les différent groupes de commandes.")
                    .addFields(
                        {name: "`/tempchannel`", value: "Les Temp Channels sont des salons vocaux temporaires pouvants être créés de cette simple commande (équivalent de l’ancien *Join To Create*). Pratique pour un petit voc avec des amis décidé sur le coup !"},
                        {name: "`/play`", value: "Permet d’écouter de la musique dans un salon vocal. Simple. Sans pub. Illimité. \nDes boutons apparaissent aussi pour mettre en pause, passer, afficher les paroles, etc. Refaites la même commande pour ajouter d’autres musiques à la file d’attente !"}
                    );
                
                rowhelp.components.forEach(co => {
                    co.options[0].default = false; co.options[1].default = false; co.options[2].default = false; co.options[4].default = false; co.options[5].default = false; co.options[3].default = true;
                });
                interaction.update({embeds: [embedinfo], components: [rowhelp]});
            }

            if (interaction.values[0] === "helpselectcontact") {
                const embedinfo = new MessageEmbed().setColor("GREEN").setTitle("Aide de NitsuBot - Contact & Ticket").setThumbnail("https://i.imgur.com/4MfQgrk.png").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'}).setDescription("Commandes pour contacter les membres ou gérer les tickets. Utilisez le menu ci-dessous pour naviguer entre les différent groupes de commandes.")
                    .addFields(
                        {name: "`/msg`", value: "Les Messages à Informations Contrôlés permettent de contacter via le bot de 3 manières différentes un membre du serveur : \n—Mode Visible (le bot envoie votre message avec votre Tag et le nom du serveur) \n—Mode Dark (le bot envoie votre message et uniquement le nom du serveur) \n—Mode Top Secret (le bot envoie votre message de manière anonyme) ! Utile pour contacter un membre de manière sécuérisé (via le bot) pour lui reprocher une conduite douteuse ou, au contraire, lui donner un cadeau. Les membres ne peuvent pas encore y répondre (à venir dans la prochaine mise à jour). \n*Permission requise : Gérer les messages*"},
                        {name: "`/ticket`", value: "Les Ticket sont un système simple et moderne pour un membre de contacter le staff. Grâce à cette commande, vous envoyez un *panel* personnalisé dans un salon dédié. Quand le membre réagit en cliquant sur le bouton, il créé un salon privé entre lui et le staff pour exprimer sa demande. À personnaliser d’abord avec `/setup`. *Permission requise : Gérer les salons*"},
                        {name: "`/save-chat`", value: "Permet d’exporter un certain nombre ou tout les derniers messages envoyés dans un salon (Max : `2000` messages)"}
                    );
                
                rowhelp.components.forEach(co => {
                    co.options[0].default = false; co.options[1].default = false; co.options[2].default = false; co.options[3].default = false; co.options[5].default = false; co.options[4].default = true;
                });
                interaction.update({embeds: [embedinfo], components: [rowhelp]});
            }

            if (interaction.values[0] === "helpselectconfig") {
                const embedinfo = new MessageEmbed().setColor("BLURPLE").setTitle("Aide de NitsuBot - Configuration & Personnalisation").setThumbnail("https://i.imgur.com/4MfQgrk.png").setTimestamp().setFooter({ text : 'NitsuBot - RMP. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'}).setDescription("Personnaliser le bot et gérer ses fonctionnalités. Utilisez le menu ci-dessous pour naviguer entre les différent groupes de commandes.")
                    .addFields(
                        {name: "`/setup`", value: "Faites cette commande pour personnaliser le bot et **configurer** des fonctionnalités importantes : \n\n—Les salons vocaux temporaires (page d’aide *Musique/Vocal*) \n—Les tickets (page d’aide *Contact/Ticket*) \n—L’auto-modération (page d’aide *Modération*) \n—Le salon modos qui permet de recevoir les infos et mises à jour du bot importantes\n\n*Permissions requises : Gérer le serveur et les salons*"}
                    );
                
                rowhelp.components.forEach(co => {
                    co.options[0].default = false; co.options[1].default = false; co.options[2].default = false; co.options[3].default = false; co.options[4].default = false; co.options[5].default = true;
                });
                interaction.update({embeds: [embedinfo], components: [rowhelp]});
            }

            if (interaction.values[0] === "helpselectclose") {
                interaction.message.delete();
            }
        }

    }
});




// Problems

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




async function sendwebhook(channel,username,avatarURL,content,embed) {
    try {
        const webhooks = await channel.fetchWebhooks();
        var webhookfound = webhooks.find(wh => wh.name === "Nitsubot Auto-Mod");

        if (!webhookfound) {
            channel.createWebhook('Nitsubot Auto-Mod', {
                avatar: "https://i.imgur.com/blr9Osz.png",
            })
                .then(webhook => {
                    webhook.send({
                        content: content,
                        username: username,
                        avatarURL: avatarURL,
                        embeds: [embed],
                    });
                });
        } else {
            webhookfound.send({
                content: content,
                username: username,
                avatarURL: avatarURL,
                embeds: [embed],
            });
        }
    } catch (error) {
        const embederr = new MessageEmbed().setColor("RED").setDescription(`<:NitsuRedTickRound:977520171734401054> Une erreur est survenue : impossible de renvoyer le message`);
        channel.send({embeds: [embederr]});
    }
}




function randomIntFromInterval(mina, maxa) { 
    return Math.floor(Math.random() * (maxa - mina + 1) + mina)
}

function compareMoney(a, b) {
    const Na = parseInt(a.money.split(",")[0]) + parseInt(a.money.split(",")[1]);
    const Nb = parseInt(b.money.split(",")[0]) + parseInt(b.money.split(",")[1]);
    return Na - Nb;
}

function compareActions(a, b) {
    const arrA = a.actions.split(",");
    const arrB = b.actions.split(",");
    var Na = 0;
    var Nb = 0;
    arrA.forEach(number => Na += parseInt(number));
    arrB.forEach(number => Nb += parseInt(number));
    return Na - Nb;
}

function compareBitcoin(a, b) {
    const Na = a.btc;
    const Nb = b.btc;
    return Na - Nb;
}

function compareActions(a, b) {
    const A = parseInt(a.name.substring(a.name.indexOf("<:NitsuCoin:984446683284910080>") + 31));
    const B = parseInt(b.name.substring(b.name.indexOf("<:NitsuCoin:984446683284910080>") + 31));
    return A - B;
}
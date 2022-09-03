const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("Affiche les informations sur l’utilisateur")
        .addUserOption(option => option.setName('membre').setDescription("L’utilisateur sur qui afficher les informations")),
    async execute(interaction) {
        var member = interaction.options.getMember("membre");
        if (!member) member = interaction.member;
        var status = member.presence?.status;
        var clientStatus;
        var nitro;
        var timeout;
        var nickname;
        var customstatus;

        var isAuthor = "*Membre*";
        if (member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) isAuthor = "*Modérateur*";
        if (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) isAuthor = "*Admin*";
        if (member.id === "595655955572719646") isAuthor = "*Fondateur et développeur du bot*";



        if (status == undefined || status == "offline") {
            status = "Hors-ligne";
            clientStatus = "Hors-ligne";
        }
        else {
            status = member.presence.status;
            clientStatus = print_r(member.presence.clientStatus).replace(/['"=>}{]/g, "").replace("online", "").replace("dnd", "").replace("idle", "").replace("0 ...", "").replace(/\s+/g, '').toString();
            if (status == "online") status = ":green_circle: En ligne";
            if (status == "dnd") status = ":no_entry: Ne pas déranger";
            if (status == "idle") status = ":crescent_moon: Inactif (AFK)";
            if (clientStatus === "desktop") clientStatus = ":computer: Ordinateur"; 
            if (clientStatus == "mobile") clientStatus = ":mobile_phone: Mobile";
            if (clientStatus == "web") clientStatus = ":earth_africa: Navigateur Web";
        }
        if (member.premiumSinceTimestamp == null) { nitro = "Gratuit"; }
        else { nitro = `Booster de serveur depuis <t:${Math.floor(member.premiumSinceTimestamp / 1000)}>` }
        
        if (member.nickname == null) { nickname = "Aucun"; }
        else { nickname = member.nickname; }

        if (member.communicationDisabledUntil) { timeout = `Congédié (Mute/Timed Out) jusqu’à <t:${Math.floor(member.communicationDisabledUntilTimestamp / 1000)}>` }
        else { timeout = "Aucun"; }

        if (member.presence?.activities[0]?.state) { customstatus = `Statut personnalisé : ${member.presence.activities[0].state}` }
        else if (member.presence?.activities[0]?.name) { customstatus = `${member.presence.activities[0].type.toLowerCase()} ${member.presence.activities[0].name}` }
        else { customstatus = "Hors-ligne"; }

        var un = [...member.roles.cache.keys()];
        var rolelist = "";
        for (let i = 0; i < un.length-1; i++) {
            rolelist += `<@&${un[i]}> `;
        }
        rolelist += ".";

        const embeduser = new MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`Informations sur ${member.user.username}`)
            .setDescription(isAuthor)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addFields(
                { name: ":id: Identifiant", value: `${member.user.id}`, inline: true },
                { name: ":hash: Tag", value: `${member.user.tag}`, inline: true },
                { name: ":pencil2: Nickname", value: `${nickname}`, inline: true }
            )
            .addFields(
                { name: "<:NitsuDiscordLogo:988185694587478058> A créé son compte le", value: `<t:${Math.floor(member.user.createdTimestamp / 1000 )}>`, inline: true },
                { name: "<:NitsuJoinArrow:941036889262129242> A rejoint le serveur le", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}>`, inline: true },
                { name: ":credit_card: Abonnement", value: `${nitro}`, inline: true }
            )
            .addFields(
                { name: "Statut", value: `${status}`, inline: true },
                { name: ":video_game: Activité", value: `${customstatus}`, inline: true },
                { name: "Connecté depuis", value: `${clientStatus}`, inline: true }
            )
            .addFields(
                { name: ":passport_control: Rôles", value: `${rolelist}`, inline: true },
                { name: ":exclamation: Sanction", value: `${timeout}`, inline: true }
            );

        const row = new MessageActionRow().addComponents(
            new MessageButton().setLabel("Envoyer un message").setEmoji("✉️").setStyle("SUCCESS").setCustomId(`bmsg${member.id}`),
            new MessageButton().setLabel("Mute 1h / Unmute").setEmoji("🔇").setStyle("PRIMARY").setCustomId(`bmut${member.id}`),
            new MessageButton().setLabel("Expulser").setEmoji("❌").setStyle("SECONDARY").setCustomId(`bkic${member.id}`),
            new MessageButton().setLabel("Bannir").setEmoji("⛔").setStyle("DANGER").setCustomId(`bban${member.id}`)
        );
        
        interaction.reply({embeds: [embeduser], components: [row] });
        
    },
};



function print_r(arr,level) {
    var dumped_text = "";
    if(!level) level = 0;
    
    //The padding given at the beginning of the line.
    var level_padding = "";
    for(var j=0;j<level+1;j++) level_padding += "    ";
    
    if(typeof(arr) == 'object') { //Array/Hashes/Objects 
        for(var item in arr) {
            var value = arr[item];
    
            if(typeof(value) == 'object') { //If it is an array,
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += print_r(value,level+1);
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
            }
        }
    } else { //Stings/Chars/Numbers etc.
        dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
    }
    return dumped_text;
}
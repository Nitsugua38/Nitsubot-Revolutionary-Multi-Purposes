const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("save-chat")
        .setDescription("Exporte dans un fichier tout les messages de ce salon (Max : 2000)")
        .addIntegerOption(option => option.setName('nombre').setDescription("Nombre de messages à exporter")),
    async execute(interaction) {

        const number = interaction.options.getInteger('nombre') || 2000;
        const embedinvalid = new MessageEmbed().setColor("RED").setTitle("Valeur incorrecte").setDescription("Veuillez rentrer une valeur comprise entre 1 et 2000");
        if ((number) > 2000 || (number) < 1) return interaction.reply({embeds: [embedinvalid]});

        const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Sauvegarde de l’historique des messages en cours...").setDescription("Cette opération peut prendre un peu de temps en fonction du nombre de messages à exporter. Les `embed` des bots ne sont pas exportés. \n*Quoiqu’il arrive, le bot s’arrêtera à `2 000` messages pour des raisons de performance.*");
        interaction.reply({embeds: [embed]});

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
            if (size != 100 || finalArray.length >= number) {
                break;
            }                
        }
         
        var tosendresult = finalArray.reverse().toString().replace(/@end@,/g, "\n").replace(/@end@/g, "");
        tosendresult = `Historique des messages du salon **${interaction.channel.name}**\n\n` + tosendresult;
        const noop = () => {};
        await fs.writeFile("messageover.md", tosendresult, noop);
        interaction.channel.send({
          files: [{
            attachment: "messageover.md",
            name: "messageover.md"
          }],
          content: "Historique :",
        });
            
    },
};
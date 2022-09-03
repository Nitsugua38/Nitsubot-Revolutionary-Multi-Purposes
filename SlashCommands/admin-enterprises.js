const { SlashCommandBuilder } = require("@discordjs/builders");
const { Collection, Permissions, MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { client } = require("..");

client.EnterprisesCommands = new Collection();
const EnterprisesCommandsFiles = fs.readdirSync(path.join(__dirname, '../AdminEnterprisesCommands')).filter(file => file.endsWith(".js"));

for (const Enterprisesfile of EnterprisesCommandsFiles) {
    const EnterprisesCommand = require(path.join(path.join(__dirname, '../AdminEnterprisesCommands'),Enterprisesfile));
    client.EnterprisesCommands.set(EnterprisesCommand.EnterprisesCmdName, EnterprisesCommand);
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin-enterprises")
        .setDescription("Gérer le système d’entreprises du serveur")
        .addStringOption(option => option.setName('action').setDescription("L’action à faire").setRequired(true).addChoice("🔰 Fonctionnalités", "features").addChoice("🏭 Créer une entreprise","add-enterprise").addChoice("🏬 Modifier une entreprise","edit-enterprise").addChoice("🧱 Créer un matériau","create-material").addChoice("🔧 Modifier un matériau","edit-material").addChoice("🚀 Créer un objet","create-item").addChoice("🪛 Modifier un objet","edit-item").addChoice("📉 Démarrer une pénurie de matériau","start-shortage").addChoice("📈 Terminer une pénurie de matériau","end-shortage").addChoice("🏦 Imposer une limite d’enterprises possédables par membre","set-max-enterprises").addChoice("❌ Réinitialiser un membre","reset-member")),
    async execute(interaction) {
        
        if (interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            
            const action = interaction.options.get('action').value;

            const EnterprisesCommand = client.EnterprisesCommands.get(action);
    
            if (!EnterprisesCommand) return;
    
            try {
                await EnterprisesCommand.exec(interaction);
            } catch (error) {
                console.error(error);
                const embederror = new MessageEmbed().setColor("RED").setDescription("<:NitsuRedTickRound:977520171734401054> Erreur : impoosible d’exécuter cette commande, si cette erreur persiste, veuillez contacter le support : https://discord.gg/ZQVpjMZJqp");
                return interaction.reply({embeds: [embederror]});
            }

        } else {
            const embedNO = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTickRound:977520171734401054> Permission manquante").setDescription("Gérer le serveur");
            interaction.reply({embeds: [embedNO]});
        }
    },
};
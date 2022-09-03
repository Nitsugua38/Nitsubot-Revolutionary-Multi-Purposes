const { SlashCommandBuilder } = require("@discordjs/builders");
const { Collection, Permissions, MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { client } = require("..");

client.EconomyCommands = new Collection();
const EconomyCommandsFiles = fs.readdirSync(path.join(__dirname, '../AdminEcoCommands')).filter(file => file.endsWith(".js"));

for (const Ecofile of EconomyCommandsFiles) {
    const EcoCommand = require(path.join(path.join(__dirname, '../AdminEcoCommands'),Ecofile));
    client.EconomyCommands.set(EcoCommand.EcoCmdName, EcoCommand);
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin-economy")
        .setDescription("Gérer l’économie du serveur")
        .addStringOption(option => option.setName('action').setDescription("L’action à faire").setRequired(true).addChoice("🔰 Fonctionnalités", "features").addChoice("➕ Ajouter de l’argent à un membre","add-money").addChoice("➖ Enlever de l’argent à un membre","remove-money").addChoice("📥 Ajouter un objet à un membre","add-item").addChoice("📤 Retirer un objet à un membre","remove-item").addChoice("🛠️ Créer un objet","create-item").addChoice("🪛 Modifier un objet","edit-item").addChoice("💵 Ajouter un salaire de rôle","create-role-salary").addChoice("💴 Modifier un salaire de rôle","edit-role-salary").addChoice("⛏️ Configurer le revenu des travaux","work-amount").addChoice("⏱️ Changer l’attente entre deux travaux","work-cooldown").addChoice("🗡️ Configurer le revenu des crimes","crime-amount").addChoice("⏱ Changer l’attente entre deux crimes","crime-cooldown").addChoice("⏱️ Changer l’attente entre deux vols","rob-cooldown").addChoice("💬 Configurer le revenu gagné par message","chat-money-amount").addChoice("⏱️ Changer l’attente entre deux messages rémunérés","chat-money-cooldown").addChoice("💰 Configurer l’argent initial des membres","set-starting-money").addChoice("💳 Imposer une limite de fond déposable à la banque","set-max-bank").addChoice("❌ Réinitialiser un membre","reset-member")),
    async execute(interaction) {
        
        if (interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            
            const action = interaction.options.get('action').value;

            const EcoCommand = client.EconomyCommands.get(action);
    
            if (!EcoCommand) return;
    
            try {
                await EcoCommand.exec(interaction);
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
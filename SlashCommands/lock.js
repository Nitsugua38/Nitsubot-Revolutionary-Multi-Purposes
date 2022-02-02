const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("Modifie facilement le salon")
        .addSubcommand(subcommand => subcommand
            .setName("lock")
            .setDescription("Empêche un rôle ou tout les membres d’envoyer des messages dans ce salon")
            .addRoleOption(option => option.setName("role").setDescription("Le rôle à verrouiller. Laisser vide pour verouiller pour tout les membres")))
        .addSubcommand(subcommand => subcommand
            .setName("unlock")
            .setDescription("Réautorise un rôle ou tout les membres d’envoyer des messages dans ce salon")
            .addRoleOption(option => option.setName("role").setDescription("Le rôle à déverrouiller. Laisser vide pour déverouiller pour tout les membres")))
        .addSubcommand(subcommand => subcommand
            .setName("private")
            .setDescription("Définis le salon comme étant privé, seul un certain rôle pour accéder à ce salon")
            .addRoleOption(option => option.setName("role").setDescription("Le rôle minimal requis pour accéder à ce salon").setRequired(true)))
        .addSubcommand(subcommand => subcommand
                .setName("public")
                .setDescription("Définis le salon comme étant public, tout les membres pourront y accéder")),
        
    async execute(interaction) {
        if (!interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return interaction.reply(":negative_squared_cross_mark: Vous n’avez pas la permission de gérer les salons !");
        
        if (interaction.options.getSubcommand() === "lock") {
            var role = interaction.options.getRole("role");
            if (!role) { role = interaction.guild.roles.everyone; }

            interaction.channel.permissionOverwrites.edit(
                role.id,
                {
                    "SEND_MESSAGES": false,
                    "CREATE_PUBLIC_THREADS": false,
                    "CREATE_PRIVATE_THREADS": false,
                    "SEND_MESSAGES_IN_THREADS": false 
                }
            );
            interaction.reply(`:lock: ${role} ne peut plus parler dans le salon`);
        }

        else if (interaction.options.getSubcommand() === "unlock") {
            var role = interaction.options.getRole("role");
            if (!role) { role = interaction.guild.roles.everyone; }

            interaction.channel.permissionOverwrites.edit(
                role.id,
                {
                    "SEND_MESSAGES": true,
                    "CREATE_PUBLIC_THREADS": true,
                    "CREATE_PRIVATE_THREADS": true,
                    "SEND_MESSAGES_IN_THREADS": true
                }
            );
            interaction.reply(`:unlock: ${role} peut de nouveau parler dans ce salon`);
        }

        else if (interaction.options.getSubcommand() === "private") {
            var role = interaction.options.getRole("role");

            interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone.id,
                {
                    "VIEW_CHANNEL": false
                }
            );
            interaction.channel.permissionOverwrites.edit(
                role.id,
                {
                    "VIEW_CHANNEL": true
                }
            );
            
            interaction.reply(`:closed_lock_with_key: Ce salon est maintenant privé. Seul les membres possédant le rôle ${role} peuvent accéder à ce salon`);
        }

        else if (interaction.options.getSubcommand() === "public") {
            interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone.id,
                {
                    "VIEW_CHANNEL": true
                }
            );
            
            interaction.reply(`:unlock: Ce salon est maintenant public. Tout le monde peut de nouveau y accéder`);
        }
    },
};
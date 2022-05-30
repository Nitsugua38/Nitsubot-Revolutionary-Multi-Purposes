const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");

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
        const embedcantkick = new MessageEmbed().setTitle("<:NitsuRedTickRound:977520171734401054> Permission manquante").setDescription("Gérer les salons").setColor("DARK_RED");
        if (!interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return interaction.reply({embeds: [embedcantkick]});
        
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
            const embedok = new MessageEmbed().setTitle(":lock: Salon verouillé").setDescription(`${role} ne peut plus parler dans ce salon`).setColor("RED");
            interaction.reply({embeds: [embedok]});
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
            const embedok = new MessageEmbed().setTitle(":unlock: Salon déverouillé").setDescription(`${role} peut de nouveau parler dans ce salon`).setColor("GREEN");
            interaction.reply({embeds: [embedok]});
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
            const embedok = new MessageEmbed().setTitle(":closed_lock_with_key: Ce salon est maintenant privé").setDescription(`Seul les membres possédant le rôle ${role} peuvent accéder à ce salon`).setColor("RED");
            interaction.reply({embeds: [embedok]});
        }

        else if (interaction.options.getSubcommand() === "public") {
            interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone.id,
                {
                    "VIEW_CHANNEL": true
                }
            );
            const embedok = new MessageEmbed().setTitle(":unlock: Ce salon est maintenant public").setDescription(`Tout le monde peut de nouveau y accéder`).setColor("GREEN");
            interaction.reply({embeds: [embedok]});
        }
    },
};
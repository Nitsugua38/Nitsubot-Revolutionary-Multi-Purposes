const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEconomyUsers, TagsEconomyGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("collect-salary")
        .setDescription("Récupérer les salaires de vos rôles"),
    async execute(interaction) {
    
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’économie est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admineconomy fonctionnalités` puis de cliquer pour activer !");
        
                
        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;
        

        var tag = await TagsEconomyUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEconomyGuilds.findOne({ where: { guildId: guildID } });
        

        if (tag2?.features?.startsWith("on")) {
            if (!tag) {
                tag = await TagsEconomyUsers.create({ GUID: GUID,});
            }

            if (!tag2.rolesSalaries || tag2.rolesSalaries === "") return interaction.reply({embeds: [new MessageEmbed().setDescription("Aucun salaire de rôle n’a été créé !").setColor("RED")]});

            const rolesSalaries = tag2.rolesSalaries.split(",");
            var rolesSalariesObj = [];
            rolesSalaries.forEach(role => {
                const things = role.split("/");
                rolesSalariesObj.push({
                    role: interaction.guild.roles.cache.get(things[0]),
                    roleId: things[0],
                    roleAmount: parseInt(things[1]),
                    roleSuffix: things[2],
                    roleCooldown: parseInt(things[3]) * 3600
                });
            });
            
            var memberValidRoles = [];
            var memberValidRolesFinal = [];
            var memberNotValid = [];

            for (let i = 0; i < rolesSalariesObj.length; i++) {
                if (interaction.member.roles.cache.some(role => role.id === rolesSalariesObj[i].roleId)) {
                    memberValidRoles.push(rolesSalariesObj[i]);
                }                
            }

        
            
            const actualTime = Math.floor(interaction.createdTimestamp / 1000);
            const lastDid = tag.cooldownsRoles?.split(",");

            if (lastDid && lastDid != "") {
                var lastDidObj = [];
                lastDid.forEach(role => {
                    lastDidObj.push({
                        roleId: role.split("/")[0],
                        roleCooldown: parseInt(role.split("/")[1]),
                        rc: 0
                    });
                });

                lastDidObj.forEach(lastdid => {
                    var found = memberValidRoles.find(role => role.roleId === lastdid.roleId)

                    if (found) {
                        if ((found.roleCooldown + lastdid.roleCooldown) <= actualTime) {

                            if (actualTime >= (lastdid.roleCooldown + (found.roleCooldown * 12)) && found.roleSuffix !== "%") {
                                found.roleAmount = parseInt( found.roleAmount * parseInt((36000 / found.roleCooldown) + 1) * parseInt( ( parseInt((actualTime - lastdid.roleCooldown) / found.roleCooldown) * (found.roleCooldown / 3600) ) / 24 ) ) + parseInt( ( ( parseInt((actualTime - lastdid.roleCooldown) / found.roleCooldown) * (found.roleCooldown / 3600) ) % 24 ) / (found.roleCooldown / 3600) ) * found.roleAmount;
                            }
                            
                            memberValidRolesFinal.push(found);
                        } else {
                            lastdid.rc = found.roleCooldown
                            memberNotValid.push(lastdid);
                        }
                    }
                });

                var foundNotDone = memberValidRoles.filter(role => !lastDid.toString().includes(role.roleId))
                if (foundNotDone) {
                    foundNotDone.forEach(fnd => memberValidRolesFinal.push(fnd))
                } ;

            
            } else {
                memberValidRolesFinal = memberValidRoles;
            }

            var strR = [];
            
            if (memberNotValid.toString() !== "") {
                memberNotValid.forEach(notvalid => {
                    strR.push(`${notvalid.roleId}/${notvalid.roleCooldown}`)
                });
            }

            if (memberValidRolesFinal.toString() !== "") {
                memberValidRolesFinal.forEach(role => {
                    strR.push(`${role.roleId}/${actualTime}`)
                });
            }

            


            var description = "";
            var montants = 0;

            if (memberValidRolesFinal.toString() !== "") {
                memberValidRolesFinal.forEach(role => {
                    if (role.roleSuffix === "$") {
                        description += `${role.role} : <:NitsuCoin:984446683284910080> ${role.roleAmount} \n`;
                        montants += role.roleAmount;
                    } else if (role.roleSuffix === "%") {
                        if (role.roleAmount === 0) return
                        let percentage = parseInt((role.roleAmount / 100) * ( parseInt(tag.money.split(",")[0]) + parseInt(tag.money.split(",")[1]) ));
                        description += `${role.role} : ${role.roleAmount} <:NitsuPercent:987371318792032336> soit <:NitsuCoin:984446683284910080> ${percentage} \n`;
                        montants += percentage;
                    }
                });
            }



            if (description === "") {
                description = `Aucun salaire de rôle ne peut être récupéré pour le moment ! \n\n`
                memberNotValid.forEach(role => {
                    description += `<@&${role.roleId}> sera récupérable <t:${role.roleCooldown + role.rc}:R> \n`;
                });

                const embed = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Pas si vite !").setDescription(description);
                interaction.reply({embeds: [embed], ephemeral: true});
            }

            else {
                const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Salaires des rôles récupérés").setDescription(description).setFooter({text: "Si vous ne les collectez pas pendant un certain temps, les salaires peuvent se cumuler !"});
                interaction.reply({embeds: [embed]});
            }
            


            await TagsEconomyUsers.update({money: `${parseInt(tag.money.split(",")[0]) + montants},${parseInt(tag.money.split(",")[1])}`}, { where: { GUID: GUID } });
            await TagsEconomyUsers.update({cooldownsRoles: `${strR.toString()}`}, { where: { GUID: GUID } });
            

        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
        

    },
};
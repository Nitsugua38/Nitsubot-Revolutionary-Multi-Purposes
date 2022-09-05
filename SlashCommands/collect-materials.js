const { SlashCommandBuilder } = require("@discordjs/builders");
const { TagsEnterprisesUsers, TagsEnterprisesGuilds } = require("../index.js");
const { MessageEmbed } = require("discord.js")


//Les noms des variables sont des réutilisations d’une autre commande (désolé pour le non-sens)

module.exports = {
    data: new SlashCommandBuilder()
        .setName("collect-materials")
        .setDescription("Récupérer les matériaux produits par vos entreprises"),
    async execute(interaction) {
    
        const embedNotConfig = new MessageEmbed().setColor("DARK_RED").setTitle("<:NitsuRedTick:939475841803505664> Le système d’entreprises est désactivé sur ce serveur").setDescription("Demandez à un modérateur de faire la commande `/admin-entreprises fonctionnalités` puis de cliquer pour activer !");
        

        const guildID = interaction.guild.id;
        const GUID = guildID + "-" + interaction.member.id;
        
        var tag = await TagsEnterprisesUsers.findOne({ where: { GUID: GUID } });
        const tag2 = await TagsEnterprisesGuilds.findOne({ where: { guildId: guildID } });
        

        if (tag2?.features?.startsWith("on")) {
            if (!tag) {
                tag = await TagsEnterprisesUsers.create({ GUID: GUID,});
            }


            if (!tag2.enterprises || tag2.enterprises === "") return interaction.reply({embeds: [new MessageEmbed().setDescription("Aucune entreprise n’a été créée !").setColor("RED")]});
            if (!tag2.materials || tag2.materials === "") return interaction.reply({embeds: [new MessageEmbed().setDescription("Aucun matériau n’a été créé !").setColor("RED")]});
            if (!tag.enterprises || tag.enterprises === "") return interaction.reply({embeds: [new MessageEmbed().setDescription("Vous ne possédez aucune entreprise !").setColor("RED")]});



            const rolesSalaries = tag2.enterprises.split(",");
            var rolesSalariesObj = [];
            rolesSalaries.forEach(role => {
                const things = role.split("/");
                rolesSalariesObj.push({
                    name: things[0],
                    roleAmount: parseInt(things[3]),
                    roleSuffix: things[2],
                    roleCooldown: parseInt(things[4]) * 3600
                });
            });
            

            var memberValidRoles = [];
            var memberValidRolesFinal = [];
            var memberNotValid = [];

            for (let i = 0; i < rolesSalariesObj.length; i++) {
                if (tag.enterprises.concat(",").includes(`${rolesSalariesObj[i].name},`)) {
                    memberValidRoles.push(rolesSalariesObj[i]);
                }
            }

        
            
            const actualTime = Math.floor(interaction.createdTimestamp / 1000);
            const lastDid = tag.cooldownsMaterials?.split(",");

            if (lastDid && lastDid != "") {
                var lastDidObj = [];
                lastDid.forEach(role => {
                    lastDidObj.push({
                        name: role.split("/")[0],
                        roleCooldown: parseInt(role.split("/")[1]),
                        rc: 0
                    });
                });

                lastDidObj.forEach(lastdid => {
                    var found = memberValidRoles.find(role => role.name === lastdid.name)

                    if (found) {
                        if (((found.roleCooldown + lastdid.roleCooldown) <= actualTime)) {

                            if (actualTime >= (lastdid.roleCooldown + (found.roleCooldown * 12))) {
                                found.roleAmount = parseInt( found.roleAmount * parseInt((36000 / found.roleCooldown) + 1) * parseInt( ( parseInt((actualTime - lastdid.roleCooldown) / found.roleCooldown) * (found.roleCooldown / 3600) ) / 24 ) ) + parseInt( ( ( parseInt((actualTime - lastdid.roleCooldown) / found.roleCooldown) * (found.roleCooldown / 3600) ) % 24 ) / (found.roleCooldown / 3600) ) * found.roleAmount;
                            }
                            
                            memberValidRolesFinal.push(found);
                        } else {
                            lastdid.rc = found.roleCooldown
                            memberNotValid.push(lastdid);
                        }
                    }
                });

                var foundNotDone = memberValidRoles.filter(role => !lastDid.toString().includes(role.name))
                if (foundNotDone) {
                    foundNotDone.forEach(fnd => memberValidRolesFinal.push(fnd))
                } ;

            
            } else {
                memberValidRolesFinal = memberValidRoles;
            }

            var strR = [];
            
            if (memberNotValid.toString() !== "") {
                memberNotValid.forEach(notvalid => {
                    strR.push(`${notvalid.name}/${notvalid.roleCooldown}`)
                });
            }

            if (memberValidRolesFinal.toString() !== "") {
                memberValidRolesFinal.forEach(role => {
                    strR.push(`${role.name}/${actualTime}`)
                });
            }

            


            var description = "";
            var materialsList = tag.materials?.split(",") || [];

            if (memberValidRolesFinal.toString() !== "") {
                memberValidRolesFinal.forEach(role => {

                    if (tag2.materials.split(",").find(material => material.startsWith(`${role.roleSuffix}/`)).includes("oui")) {
                        description += `${role.name} : <:NitsuShortage:1016273758425714798> En pénurie\n`;
                    }

                    else {
                    
                        description += `${role.name} : ${role.roleAmount} ${role.roleSuffix}\n`;
                        
                    
                        let material = role.roleSuffix

                        if (materialsList.find(item => item.startsWith(`${material}/`))) {

                            var materialArr = materialsList.find(item => item.startsWith(`${material}/`)).split("/");
                            materialArr[1] = parseInt(materialArr[1]) + role.roleAmount;

                            var OthermaterialArr = materialsList.filter(item => !item.startsWith(`${material}/`)).toString();

                            if (OthermaterialArr) materialsList = (OthermaterialArr + "," + materialArr.toString().replace(/,/g, "/")).split(",");
                            else materialsList =  materialArr.toString().replace(/,/g, "/").split(",");
                        
                        }
                        else {
                            materialsList.push(`${material}/${role.roleAmount}`);
                        }
                    }
                     
                });
            }



            if (description === "") {
                description = `Aucune production ne peut être récupéré pour le moment ! \n\n`
                memberNotValid.forEach(role => {
                    description += `${role.name} sera récupérable <t:${role.roleCooldown + role.rc}:R> \n`;
                });

                const embed = new MessageEmbed().setColor("RED").setTitle("<:NitsuRedTickRound:977520171734401054> Pas si vite !").setDescription(description);
                interaction.reply({embeds: [embed], ephemeral: true});
            }

            else {
                const embed = new MessageEmbed().setColor("GREEN").setTitle("<:NitsuGreenTickRound:977520117216862239> Production récupérées").setDescription(description).setFooter({text: "Si vous ne les collectez pas pendant un certain temps, les productions peuvent se cumuler !"});
                interaction.reply({embeds: [embed]});
            }
            


            await TagsEnterprisesUsers.update({materials: `${materialsList.toString()}`}, { where: { GUID: GUID } });
            await TagsEnterprisesUsers.update({cooldownsMaterials: `${strR.toString()}`}, { where: { GUID: GUID } });
            

        } else {
            interaction.reply({embeds: [embedNotConfig]});
        }
        

    },
};
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Tags } = require("../index.js");
const { Permissions, MessageEmbed } = require("discord.js");



module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Initialise la base de données du bot"),
    async execute(interaction) {
        if (interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_GUILD) && interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
            const guildID = interaction.guild.id;
            const tagtoinit = await Tags.findOne({ where: { guildid: guildID } });
            if (tagtoinit) {
                await Tags.destroy({ where: { guildid: guildID } });
            }


            const embedTempChannelsRole = new MessageEmbed().setColor("GOLD").setTitle("Configuration du bot pour ce serveur \n<:NitsuTimer:948635736607957023> Étape 1/8 : Temp Channels").setDescription("Les Temp Channels sont des salons vocaux temporaires pouvants être créés d'une simple commande et accessibles selon le rôle que vous déciderez (équivalent de l’ancien *Join To Create*). \n\n**Mentionnez le rôle minimal requis pour pouvoir les utiliser**\n\n:bulb: *Si vous ne souhaitez pas les rendre disponible, mettez le plus haut rôle du serveur !*");
            const embedTempChannelsCateg = new MessageEmbed().setColor("GOLD").setTitle("Configuration du bot pour ce serveur \n:placard: Étape 2/8 : Catégorie des Temp Channels").setDescription("Pour éviter que ce soit le bazar, les Temp Channels doivent être créés dans une catégorie définie pour eux. \n\n**Tapez le nom exact de la catégorie où créer les Temp Channels (SANS guillemets, #, ni autre!)**");
            const embedWhereToReply = new MessageEmbed().setColor("GOLD").setTitle("Configuration du bot pour ce serveur \n:mailbox_with_mail: Étape 3/8 : Salon des modérateurs").setDescription("Parfois le bot doit envoyer des informations aux modérateurs, comme les mises à jour ou infos importantes du bot, ou les réponses des messages à infos contrôlées *(/msg)* que vous enverrez (fonctionnalité de réponse à venir prochainement). \n\n**Mentionnez le salon choisi (#...)**");
            const embedWhereToCreateTickets = new MessageEmbed().setColor("GOLD").setTitle("Configuration du bot pour ce serveur \n:ticket: Étape 4/8 : Catégorie des Tickets").setDescription("Vous avez la possiblité de créer autant de panels de tickets *(Un bouton qui permet de créer un salon entre le membre qui a cliqué et le staff, permettant ainsi de contacter facilement le staff !)* que vous voulez mais pour éviter toute confusion, ceux-ci doivent être crées dans une catégorie appropriée. \n\n**Tapez le nom exact de la catégorie où créer les Tickets (SANS guillemets, #, ni autre!)**");
            const embedNumberTickets = new MessageEmbed().setColor("GOLD").setTitle("Configuration du bot pour ce serveur \n:tickets: Étape 5/8 : Maximum de tickets/membre").setDescription("Pour éviter le spam, vous pouvez décider d’un nombre maximum de tickets utilisables par un membre à la fois. 3 tickets simultanés par membre semble raisonnable.\n\n**Entrez le nombre de tickets simultanés par membre souhaités (1 - 50)**");
            const embedAutoModOpt = new MessageEmbed().setColor("GOLD").setTitle("Configuration du bot pour ce serveur \n:shield: Étape 6/8 : Auto-Modération").setDescription("Le bot dispose d’une fonctionnalité d’auto-modération, qui détecte notamment le spam *(Faites /help pour plus d’infos sur à partir de quand des messages sont considérés commme spam)*, les mentions `@everyone` ou plus de 3 rôles à la fois, les insultes/jurons, et les pubs. Bien sûr vous n’êtes pas obligé de les activer ! \n\n**Tapez `oui,oui,oui,oui` ou `non,oui,non,oui` etc. pour activer ou non l’une ou toutes ces fonctionnalités (dans l’ordre : spam,mentions,jurons,pubs)** \n\n:bulb: *Dans la prochaine étape, vous pourrez entrer des salons de dérogation !*");
            const embedTimer = new MessageEmbed().setColor("GOLD").setTitle("Configuration du bot pour ce serveur \n:stopwatch: Étape 7/8 : Temps de Mute").setDescription("Vous pouvez personnaliser le temps de mute qui sera la première sanction appliquée en cas de mentions \n\n**Entrez le nombre de minutes de mute souhaité (1 - 10080 : correspond à une semaine)**");
            const embedAllowedAdsChannels = new MessageEmbed().setColor("GOLD").setTitle("Configuration du bot pour ce serveur \n:unlock: Étape 8/8 : Salon publicitaires dérogatoires").setDescription("Si vous avez prévu des salons dérogatoires à l’Anti-Pubs : cela signifie que les membres pourront donc envoyer librement leur publicité. \n\n**Mentionnez le(s) salon(s) choisi(s) (#...) en les séparant par des `,` (virgules)**");
            
            const filterTCR = response => {
                if (response.author.id === interaction.user.id && (interaction.guild.roles.cache.find(r => r.id === response.content.replace(/[><@& .,]/g, "")) || response.content.includes("everyone"))) return true
                else if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false } 
            };
            const filterTCC = response => {
                if (response.author.id === interaction.user.id && interaction.guild.channels.cache.find(channel => channel.name == `${response.content}` && channel.type == "GUILD_CATEGORY")) return true
                else if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false }
            };
            const filterWTR = response => {
                if (response.author.id === interaction.user.id && interaction.guild.channels.cache.find(channel => channel.id == `${response.content.replace(/[><# .,]/g, "")}`)) return true
                else if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false }
            };
            const filterNT = response => {
                if (response.author.id === interaction.user.id && !isNaN(+response.content.replace(/[ .,]/g, "")) && 0 < parseInt(response.content.replace(/[ .,]/g, "")) && parseInt(response.content.replace(/[ .,]/g, "")) < 51)   return true
                else if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false }
            };
            const filterAMO = response => {
                const toCheck = response.content.replace(/[^a-zA-Z]+/g, "").toLowerCase();
                var table = [];
                var final = "";
                try {
                    table.push(toCheck.substring(0,3));
                    table.push(toCheck.substring(3,6));
                    table.push(toCheck.substring(6,9));
                    table.push(toCheck.substring(9,12));   
                } catch (error) {
                    if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false }
                }
                table.forEach(element => {
                    if (element === "oui" || element === "non") { final += "ok" }
                });
                if (response.author.id === interaction.user.id && final === "okokokok") return true
                else if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false }
            };
            const filterTimer = response => {
                if (response.author.id === interaction.user.id && !isNaN(+response.content.replace(/[ .,]/g, "")) && 0 < parseInt(response.content.replace(/[ .,]/g, "")) && parseInt(response.content.replace(/[ .,]/g, "")) < 10080)   return true
                else if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false }
            };
            const filterAAC = response => {
                const toCheck = response.content.replace(/[><# .]/g, "");
                var table = [];
                var final = "";
                try {
                    table = toCheck.split(",");  
                } catch (error) {
                    if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false }
                }
                table.forEach(element => {
                    if (interaction.guild.channels.cache.find(channel => channel.id == `${element}`)) { final += "k" }
                });
                if (response.author.id === interaction.user.id && final.length === table.length ) return true
                else if (response.author.id === interaction.user.id) { interaction.channel.send({embeds: [embedInvalid]}); return false }
            };
            
            const embedFinal = new MessageEmbed().setColor("#00FF00").setTitle("<:NitsuGreenTickRound:977520117216862239> La base de données du bot a correctement été configurée !").setThumbnail("https://i.imgur.com/XkofZJ7.png").setTimestamp().setFooter({ text : 'Messenger Bot. Made by Nitsugua38', iconURL: 'https://cdn.discordapp.com/avatars/917404523583135744/64302207180f2ef414df7cf89296e4ef.png'});
            const embedError = new MessageEmbed().setColor("RED").setTitle("Erreur").setDescription("<:NitsuRedTick:939475841803505664> Une erreur est survenue. Veuillez rééssayer !");
            const embedInvalid = new MessageEmbed().setColor("RED").setTitle("Invalide").setDescription("<:NitsuRedTick:939475841803505664> Vous n’avez pas entré la valeur selon le format demandé. Veuillez réessayer **cette étape** !");
            
            
            interaction.reply({embeds: [embedTempChannelsRole], fetchReply: true})
            
            .then(() => {
                interaction.channel.awaitMessages({filter: filterTCR, max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const tempChannelsRole = collected.first().content.replace(/[><@& .,]/g, "");

                        interaction.channel.send({embeds: [embedTempChannelsCateg]})
                        .then(() => {
                            interaction.channel.awaitMessages({filter: filterTCC, max: 1, time: 60000, errors: ['time'] })
                                .then(collected => {
                                    const tempChannelsCateg1 = interaction.guild.channels.cache.find(channel => channel.name == `${collected.first()}` && channel.type == "GUILD_CATEGORY");
                                    const tempChannelsCateg = tempChannelsCateg1.toString().replace(/[><#]/g, "");

                                    interaction.channel.send({embeds: [embedWhereToReply]})
                                    .then(() => {
                                        interaction.channel.awaitMessages({filter: filterWTR, max: 1, time: 60000, errors: ['time'] })
                                            .then(collected => {
                                                const whereToReply = collected.first().content.replace(/[><# .,]/g, "");
                                                
                                                interaction.channel.send({embeds: [embedWhereToCreateTickets]})
                                                .then(() => {
                                                    interaction.channel.awaitMessages({filter: filterTCC, max: 1, time: 60000, errors: ['time'] })
                                                        .then(collected => {
                                                            const whereToCreateTickets1 = interaction.guild.channels.cache.find(channel => channel.name == `${collected.first()}` && channel.type == "GUILD_CATEGORY");
                                                            const whereToCreateTickets = whereToCreateTickets1.toString().replace(/[><#]/g, "");
                                                            
                                                            interaction.channel.send({embeds: [embedNumberTickets]})
                                                            .then(() => {
                                                                interaction.channel.awaitMessages({filter: filterNT, max: 1, time: 60000, errors: ['time'] })
                                                                    .then(collected => {
                                                                        const numberTickets = +collected.first().content.replace(/[ .,]/g, "");

                                                                        interaction.channel.send({embeds: [embedAutoModOpt]})
                                                                        .then(() => {
                                                                            interaction.channel.awaitMessages({filter: filterAMO, max: 1, time: 60000, errors: ['time'] })
                                                                                .then(collected => {
                                                                                    var autoModOpt = [];
                                                                                    const autoModOpt1 = collected.first().content.replace(/[^a-zA-Z]+/g, "").toLowerCase();
                                                                                    autoModOpt.push(autoModOpt1.substring(0,3));
                                                                                    autoModOpt.push(autoModOpt1.substring(3,6));
                                                                                    autoModOpt.push(autoModOpt1.substring(6,9));
                                                                                    autoModOpt.push(autoModOpt1.substring(9,12));
                                                                                    
                                                                                    interaction.channel.send({embeds: [embedTimer]})
                                                                                    .then(() => {
                                                                                        interaction.channel.awaitMessages({filter: filterTimer, max: 1, time: 60000, errors: ['time'] })
                                                                                            .then(collected => {
                                                                                                const timerMute = +collected.first().content.replace(/[ .,]/g, "");

                                                                                                interaction.channel.send({embeds: [embedAllowedAdsChannels]})
                                                                                                .then(() => {
                                                                                                    interaction.channel.awaitMessages({filter: filterAAC, max: 1, time: 60000, errors: ['time'] })
                                                                                                        .then(collected => {
                                                                                                            var allowedAdsChannels = [];
                                                                                                            const allowedAdsChannels1 = collected.first().content.replace(/[><# .]/g, "");
                                                                                                            allowedAdsChannels = allowedAdsChannels1.split(",");

                                                                                                            const guildID = interaction.guild.id;
                                                                                                            try {
                                                                                                                const tag = Tags.create({
                                                                                                                    guildid: guildID,
                                                                                                                }).then(() => {
                                                                                                                    Tags.update({tccateg: tempChannelsCateg}, { where: { guildid: guildID } });
                                                                                                                    Tags.update({tcrole: tempChannelsRole}, { where: { guildid: guildID } });
                                                                                                                    Tags.update({wheretoreply: whereToReply}, { where: { guildid: guildID } });
                                                                                                                    Tags.update({wheretocontactstaff: whereToCreateTickets}, { where: { guildid: guildID } });
                                                                                                                    Tags.update({maxtickets: numberTickets}, { where: { guildid: guildID } });
                                                                                                                    Tags.update({enableautomod: autoModOpt}, { where: { guildid: guildID } });
                                                                                                                    Tags.update({timermute: timerMute}, { where: { guildid: guildID } });
                                                                                                                    Tags.update({allowedadschannels: allowedAdsChannels}, { where: { guildid: guildID } });
                                                                                                                    interaction.channel.send({embeds: [embedFinal]});
                                                                                                                })
                                                                                                            } catch (error) {
                                                                                                                return interaction.channel.send({embeds: [embedError]})
                                                                                                            }
                        
                                                                                                        })
                                                                                                        .catch(collected => {interaction.followUp('<:NitsuRedTick:939475841803505664> Erreur : Temps écoulé, commande annulée');});
                                                                                                    });
                                                                                            })
                                                                                            .catch(collected => {interaction.followUp('<:NitsuRedTick:939475841803505664> Erreur : Temps écoulé, commande annulée');});
                                                                                    });
                                                                                })
                                                                                .catch(collected => {interaction.followUp('<:NitsuRedTick:939475841803505664> Erreur : Temps écoulé, commande annulée');});
                                                                        });
                                                                    })
                                                                    .catch(collected => {interaction.followUp('<:NitsuRedTick:939475841803505664> Erreur : Temps écoulé, commande annulée');});
                                                            });
                                                        })
                                                        .catch(collected => {interaction.followUp('<:NitsuRedTick:939475841803505664> Erreur : Temps écoulé, commande annulée');});
                                                });
                                            })
                                            .catch(collected => {interaction.followUp('<:NitsuRedTick:939475841803505664> Erreur : Temps écoulé, commande annulée');});
                                    });
                                })
                                .catch(collected => {interaction.followUp('<:NitsuRedTick:939475841803505664> Erreur : Temps écoulé, commande annulée');});
                        });
                    })
                    .catch(collected => {interaction.followUp('<:NitsuRedTick:939475841803505664> Erreur : Temps écoulé, commande annulée');});
            });

        } else {
            const embedCantInit = new MessageEmbed().setColor("DARK_RED").setTitle("Accès Refusé").setDescription("<:NitsuRedTickRound:977520171734401054> Vous ne pouvez pas initialiser la base de données du bot car vous n’avez pas la permission de gérer les salons ni le serveur !");
            interaction.reply({embeds: [embedCantInit]});
        }
    },
};
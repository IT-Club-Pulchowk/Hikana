require('dotenv').config();
const fs = require('fs');
const path = require('path');
const discord = require('discord.js');
const axios = require('axios');
const nsfwCheck = require('./nsfw-check.js');
const whenMentioned = require('./whenMentioned.js');
const { command_list } = require('./data.js');
const about = require('./about.json');

const editJsonFile = require('edit-json-file');
const file = editJsonFile(path.join(__dirname, 'config.json'));

const commands = require('./commands.js');
const welcome = require('./welcome');

const client = new discord.Client();

let questions_in_question_channel = [];
client.on('ready', () => {
	console.log('the client has logged in');

	commands(client, 'ping', (message) => {
		message.react('🏓');
	});

	commands(client, 'ban', (message) => {
		const { member, mentions } = message;

		const tag = `<@${member.id}>`;

		if (
			member.hasPermission('ADMINISTRATOR') ||
			member.hasPermission('BAN_MEMBERS')
		) {
			const args = message.content
				.substring(process.env.PREFIX.length)
				.split(' ');
			args.shift();
			const userToBan = args[0];
			console.log(userToBan);
			if (typeof userToBan === 'string') {
				const target = mentions.users.first();
				if (target) {
					const targetMember = message.guild.members.cache.get(target.id);
					targetMember.ban();
					message.channel.send(`${tag} That user was banned`);
				} else if (!target) {
					const targetMember = message.guild.members.cache.get(userToBan);
					targetMember.ban();
					message.channel.send(`<@${tag}> That user was banned`);
				}
			} else if (typeof userToBan === 'undefined') {
				message.channel.send(`${tag} Please specify someone to ban.`);
			}
		} else {
			message.channel.send(
				`${tag} You do not have permission to use this command.`
			);
		}
	});

	commands(client, 'kick', (message) => {
		const { member, mentions } = message;

		const tag = `<@${member.id}>`;

		if (
			member.hasPermission('ADMINISTRATOR') ||
			member.hasPermission('KICK_MEMBERS')
		) {
			const args = message.content
				.substring(process.env.PREFIX.length)
				.split(' ');
			args.shift();
			const userToKick = args[0];
			console.log(userToKick);
			if (typeof userToKick === 'string') {
				const target = mentions.users.first();
				if (target) {
					const targetMember = message.guild.members.cache.get(target.id);
					targetMember.kick();
					message.channel.send(`${tag} That user was kicked`);
				} else if (!target) {
					const targetMember = message.guild.members.cache.get(userToKick);
					targetMember.kick();
					message.channel.send(`<@${userToKick}> That user was kicked`);
				}
			} else if (typeof userToKick === 'undefined') {
				message.channel.send(`${tag} Please specify someone to kick.`);
			}
		} else {
			message.channel.send(
				`${tag} You do not have permission to use this command.`
			);
		}
	});

	commands(client, 'join', (message) => {
		client.emit('guildMemberAdd', message.member);
	});

	/*
	commands(client, 'wiki', (message) => {
		const args = message.content
			.slice(process.env.PREFIX.length)
			.trim()
			.split(/ +/);
		const command_name = args[0];
		args.shift();
		let word = args.join(' ');

		if (!word) {
			message.channel.send(
				`Use the correct format, baka. ${process.env.PREFIX}${command_name} <search-term>`
			);
		} else {
			let url = 'https://en.wikipedia.org/w/api.php';

			let params = {
				action: 'opensearch',
				search: word,
				limit: '1',
				namespace: '0',
				format: 'json',
			};

			url = url + '?origin=*';
			Object.keys(params).forEach(function (key) {
				url += '&' + key + '=' + params[key];
			});

			axios(url).then(function (response) {
				message.channel.send(response.data[3]);
			});
		}
	});
	*/

	/*
	commands(client, 'nisan', (message) => {
		message.channel.send(
			'https://cdn.discordapp.com/attachments/744591904427081811/846292516009279529/bitch.gif'
		);
	});
	*/

	commands(client, 'intro', (message) => {
		// Todo for later
		let embed = new discord.MessageEmbed();
		embed.setTitle('Welcome to C Event by IT-CLUB, Pulchowk');
		embed.setAuthor(client.user.username, client.user.avatarURL(32));
		message.channel.send(embed);
	});

	commands(client, 'help', (message) => {
		let data = [];
		let embed = new discord.MessageEmbed();
		embed.setAuthor(client.user.username, client.user.avatarURL(32));
		const args = message.content
			.slice(process.env.PREFIX.length)
			.trim()
			.split(/ +/);
		if (args.length === 1) {
			embed.setTitle("Here's a list of all my commands: ");
			embed.setDescription(
				command_list.map((command) => command.name).join(', ')
			);
			embed.setFooter(
				`\nYou can send \`${process.env.PREFIX}help [command name]\` to get info on a specific command!`
			);
			message.channel.send(embed);
		} else {
			const name = args[1].toLowerCase();
			const command = command_list.find((element) => element.name === name);

			if (!command) {
				return message.reply("that's not a valid command!");
			}
			data.push(`**Name:** ${command.name}`);
			embed.setTitle(`**Name:** ${command.name}`);
			embed.addField(`**Description:**`, `${command.description}`);
			embed.addField(`**Arguments:**`, `${command.arguments}`);
			embed.addField(
				`**Usage:**`,
				`${process.env.PREFIX}${command.name} ${command.usage}`
			);

			if (command.description)
				data.push(`**Description:** ${command.description}`);
			// if (command.usage)
			data.push(`**Arguments:** ${command.arguments}`);
			data.push(
				`**Usage:** ${process.env.PREFIX}${command.name} ${command.usage}`
			);

			message.channel.send(embed);
		}
	});

	commands(client, 'react', (message) => {
		message.react('⚽');
	});
	commands(client, 'plot', (message) => {
		const args = message.content
			.slice(process.env.PREFIX.length)
			.trim()
			.split(/ +/);
		args.shift();
		let word = args.join(' ');
		const appID = process.env.WOLFRAM_TOKEN;
		if (!appID) {
			message.channel.send(
				'Sorry you need WOLFRAM_TOKEN for this to function correctly'
			);
		}
		word = 'plot ' + word;
		let embed = new discord.MessageEmbed();

		const input = encodeURIComponent(word);
		const url = `http://api.wolframalpha.com/v2/query?input=${input}&appid=${appID}&output=json`;
		embed.setTitle(`plotting ${word.slice(5)}`); // Slice because we add stuff to word
		message.channel.send(embed).then((msg) => {
			axios(url).then((response) => {
				const data = response.data;
				let pods = data.queryresult.pods;
				let img;
				if (!pods) {
					embed.setTitle('Bad input, baka');
					msg.edit(embed);
					return;
				}

				// TODO: Refactor this mess
				const found = pods.find((pod) => pod.id === 'Plot');
				if (!found) {
					const imp_plot = pods.find((pod) => pod.id === 'ImplicitPlot');
					const plot_3d = pods.find((pod) => pod.id === '3DPlot');
					const result = pods.find((pod) => pod.id === 'Result');
					const surface_plot = pods.find((pod) => pod.id === 'SurfacePlot');
					const plotOfSolution = pods.find(
						(pod) => pod.id === 'PlotOfSolutionSet'
					);
					if (imp_plot) {
						img = imp_plot.subpods[0].img.src;
					} else if (plot_3d) {
						img = plot_3d.subpods[0].img.src;
					} else if (result) {
						img = result.subpods[0].img.src;
					} else if (surface_plot) {
						img = surface_plot.subpods[0].img.src;
					} else if (plotOfSolution) {
						img = plotOfSolution.subpods[0].img.src;
					}
				} else {
					img = found.subpods[0].img.src;
				}

				if (img) {
					embed.setTitle(`${word}`).setImage(img);
					msg.edit(embed);
				} else {
					embed.setTitle('Bad input, baka');
					msg.edit(embed);
				}
			});
		});
	});

	nsfwCheck(client);

	commands(client, 'code', (message) => {
		const link = 'https://github.com/IT-Club-Pulchowk/Hikana';
		let embed = new discord.MessageEmbed().setDescription(link);
		message.channel.send(embed);
	});

	commands(client, 'about', (message) => {
		let embed = new discord.MessageEmbed();
		embed.setAuthor(client.user.username, client.user.avatarURL(32));
		for (key of Object.keys(about)) {
			embed.addField(key, about[key], true);
		}
		axios
			.get(
				'https://api.github.com/repos/IT-Club-Pulchowk/Hikana/contributors',
				{
					Accept: 'application/vnd.github.v3+json',
				}
			)
			.then((res) => {
				let contributors = [];
				res.data.forEach((person) => {
					contributors.push(person.login);
				});
				if (contributors.length > 0) {
					embed.addField('Developers', contributors.join(', '));
				}
				message.channel.send(embed);
			});
	});

	commands(client, 'q', (message) => {
		const author = {
			id: message.author.id,
			name: message.member.displayName,
		};
		const question = message.content.slice(2);
		if (!(question || message.attachments.first())) {
			console.log('bad message');
			return;
		}
		const embed = new discord.MessageEmbed();
		embed
			.setTitle(`${author.name}`)
			.setColor(`RANDOM`)
			.setDescription(question);

		if (message.attachments.first()) {
			embed.setImage(message.attachments.first().proxyURL);
		}
		const questionChannel = process.env.Q_CHANNEL;
		const reactRequired = process.env.Q_REACT;
		if (questionChannel) {
			message.react('👌');
			if (reactRequired) {
				// There is probably a better way to do this
				const filter = (reaction, user) => {
					const mods = message.guild.roles.cache
						.get(process.env.Q_REACT_ROLE)
						.members.map((m) => m.user.id);
					let modReactecd = false;
					if (reaction.emoji.name === '👌') {
						for (user of reaction.users.cache.keys()) {
							if (mods.includes(user)) {
								modReactecd = true;
								message.react('✅');
								break;
							}
						}
					}
					return modReactecd;
				};
				const collector = message.createReactionCollector(filter, {
					time: 60000 * 2,
				});
				collector.on('collect', (reaction, user) => {
					console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					if (!questions_in_question_channel.includes(message.id)) {
						client.channels.cache.get(questionChannel).send(embed);
						questions_in_question_channel += message.id;
					} else {
					}
				});

				collector.on('end', (collected) => {
					console.log(`Collected ${collected.size} items`);
				});
			} else {
				message.react('✅');
				client.channels.cache.get(questionChannel).send(embed);
			}
		} else {
			message.reply(
				'There seems to be a problem, can you dm a instructor or a volunteers'
			);
		}
	});

	commands(client, 'notice', (message) => {
		message.channel.send('some mmsg');
	});

	welcome(client);
	whenMentioned(client);

	commands(client, 'welcomeMessage', (message) => {
		const { member } = message;
		if (member.hasPermission('ADMINISTRATOR')) {
			const args = message.content
				.substring(process.env.PREFIX.length)
				.split(' ');
			args.shift();
			file.pop('message');
			file.append('message', args.join(' '));
			file.save();
		} else if (!member.hasPermission('ADMINISTRATOR')) {
			message.channel.send(
				`<@${member.id}> You don't have permissions for this command.`
			);
		}
	});

	commands(client, 'avatar', (message) => {
		const { member, mentions } = message;

		const tag = `<@${member.id}>`;

		const embed = new discord.MessageEmbed();

		const args = message.content
			.substring(process.env.PREFIX.length)
			.split(' ');
		args.shift();
		const userAvatar = args[0];
		if (typeof userAvatar === 'string') {
			const target = mentions.users.first();
			if (target) {
				const targetMember = message.guild.members.cache.get(target.id);
				embed
					.setTitle('I fetched the display picture you requested. Here,')
					.setImage(
						targetMember.user.displayAvatarURL({
							format: 'png',
							size: 1024,
						})
					)
					.setColor(`RANDOM`)
					.setAuthor(
						'Hikana',
						'https://i.imgur.com/TAKFpVd.png',
						'https://github.com/IT-Club-Pulchowk/Hikana/'
					);
				message.channel.send(embed);
			} else if (!target) {
				const targetMember = message.guild.members.cache.get(userAvatar);
				if (targetMember) {
					embed
						.setTitle('I fetched the display picture you requested. Here,')
						.setImage(
							targetMember.user.displayAvatarURL({
								format: 'png',
								size: 1024,
							})
						)
						.setColor(`RANDOM`)
						.setAuthor(
							'Hikana',
							'https://i.imgur.com/TAKFpVd.png',
							'https://github.com/IT-Club-Pulchowk/Hikana/'
						);
					message.channel.send(embed);
				} else {
					message.channel.send(`${tag} Please specify a valid user-id.`);
				}
			}
		} else if (typeof userToKick === 'undefined') {
			embed
				.setTitle('I fetched the display picture you requested. Here,')
				.setImage(
					message.author.displayAvatarURL({
						format: 'png',
						size: 1024,
					})
				)
				.setColor(`RANDOM`)
				.setAuthor(
					'Hikana',
					'https://i.imgur.com/TAKFpVd.png',
					'https://github.com/IT-Club-Pulchowk/Hikana/'
				);
			message.channel.send(embed);
		}
	});

	commands(client, 'mute', (message) => {
		const { member, mentions } = message;
		const tag = `<@${member.id}>`;
		const muteEmbed = new discord.MessageEmbed();
		const muteRole = member.guild.roles.cache.find(
			(role) => role.name.toLowerCase() === 'muted'
		);
		const muteChannel = member.guild.channels.cache.find(
			(channel) => channel.name === 'logs'
		);
		if (
			member.hasPermission('ADMINISTRATOR') ||
			member.hasPermission('MANAGE_ROLES')
		) {
			const args = message.content
				.substring(process.env.PREFIX.length)
				.split(' ');
			args.shift();
			const userToMute = args[0];
			const muteReason = args.slice(1).join(' ');
			if (typeof userToMute === 'string') {
				const target = mentions.users.first();
				if (target) {
					// const targetMember = message.guild.members.cache.get(target.id)
					// const removeRoles = message.guild.member(targetMember.user).roles.cache;
					message.guild.member(targetMember.user).roles.remove(removeRoles);
					message.guild.member(targetMember.user).roles.add(muteRole);
					message.channel.send(`<@${targetMember.id}> was muted.`);
					muteEmbed
						.setTitle('Mute')
						.setThumbnail(targetMember.user.displayAvatarURL())
						.setDescription(`User <@${target.id}> was muted for ${muteReason}`)
						.setFooter(`Muted by ${message.author.tag}`)
						.setTimestamp();
					muteChannel.send(muteEmbed);
					return message.channel.send(muteEmbed);
				} else if (!target) {
					const targetMember = message.guild.members.cache.get(userToMute);
					if (targetMember) {
						// const removeRoles = message.guild.member(targetMember.user).roles.cache;
						// message.guild.member(targetMember.user).roles.remove(removeRoles)
						targetMember.user.roles.add(muteRole);
						message.channel.send(`<@${targetMember.user.id} was muted>`);
						muteEmbed
							.setTitle('Mute')
							.setThumbnail(targetMember.user.displayAvatarURL())
							.setDescription(
								`User <@${target.id}> was muted for ${muteReason}`
							)
							.setFooter(`Muted by ${message.author.tag}`)
							.setTimestamp();
						muteChannel.send(muteEmbed);
						return message.channel.send(muteEmbed);
					} else if (!targetMember) {
						return message.channel.send(
							`<@${tag}> Please specify a valid user-id.`
						);
					}
				}
			} else if (typeof userToMute === 'undefined') {
				return message.channel.send(`<@${tag}> Please specify a user to mute.`);
			} else if (
				!message.guild.members.get(client.user.id).hasPermission('MANAGE_ROLES')
			) {
				message.channe.send(`<@${tag}> I dont have permissions.`);
			}
		} else {
			return message.channel.send(`${tag} You dont't have permissions.`);
		}
	});
});

client.login(process.env.BOT_TOKEN);

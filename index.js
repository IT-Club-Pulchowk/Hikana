require('dotenv').config();
const fs = require('fs');
const path = require('path');
const discord = require('discord.js');
const axios = require('axios');
const { command_list, aboutme } = require('./data.js');

const editJsonFile = require('edit-json-file');
const file = editJsonFile(path.join(__dirname, 'config.json'));

const commands = require('./commands.js');
const welcome = require('./welcome');

const client = new discord.Client();

client.on('ready', () => {
	console.log('the client has logged in');

	commands(client, 'ping', (message) => {
		message.channel.send('Pong');
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

	commands(client, 'wiki', (message) => {
		const args = message.content
			.slice(process.env.PREFIX.length)
			.trim()
			.split(/ +/);
		args.shift();
		let word = args.join(' ');

		if (!word) {
			message.channel.send(
				`Please use the correct format. ${process.env.PREFIX}${args[0]} <search-term>`
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

	commands(client, 'nisan', (message) => {
		message.channel.send(
			'https://cdn.discordapp.com/attachments/744591904427081811/846292516009279529/bitch.gif'
		);
	});

	commands(client, 'intro', (message) => {
		// Todo for later
		let reply = '';
		reply += 'Welcome to IT-Club, ';
		reply += '#get-roles';
		message.channel.send(reply);
	});

	commands(client, 'help', (message) => {
		let data = [];
		const args = message.content
			.slice(process.env.PREFIX.length)
			.trim()
			.split(/ +/);
		if (args.length === 1) {
			data.push("Here's a list of all my commands:");
			data.push(command_list.map((command) => command.name).join(', '));
			data.push(
				`\nYou can send \`${process.env.PREFIX}help [command name]\` to get info on a specific command!`
			);
			message.channel.send(data, { split: true });
		} else {
			const name = args[1].toLowerCase();
			const command = command_list.find((element) => element.name === name);

			if (!command) {
				return message.reply("that's not a valid command!");
			}
			data.push(`**Name:** ${command.name}`);
			if (command.description)
				data.push(`**Description:** ${command.description}`);
			// if (command.usage)
			data.push(`**Arguments:** ${command.arguments}`);
			data.push(
				`**Usage:** ${process.env.PREFIX}${command.name} ${command.usage}`
			);

			message.channel.send(data, { split: true });
		}
	});

	commands(client, 'react', (message) => {
		message.react('🔞');
	});

	commands(client, 'plot', (message) => {
		const args = message.content
			.slice(process.env.PREFIX.length)
			.trim()
			.split(/ +/);
		args.shift();
		let word = args.join(' ');
		console.log(word);
		const appID = process.env.WOLFRAM_TOKEN;
		const input = encodeURIComponent(word);
		const url = `http://api.wolframalpha.com/v2/query?input=${input}&appid=${appID}&output=json`;
		axios(url).then((response) => {
			const data = response.data;
			let pods = data.queryresult.pods;
			let img;
			const found = pods.find((pod) => pod.id === 'Plot');
			if (!found) {
				const imp_plot = pods.find((pod) => pod.id === 'ImplicitPlot');
				if (imp_plot) {
					img = imp_plot.subpods[0].img.src;
				} else {
					message.channel.send('Please contact the bot developer');
				}
			} else {
				img = found.subpods[0].img.src;
			}
			if (img) {
				let embed = new discord.MessageEmbed();
				embed.setTitle(`Equation: ${word}`).setImage(img);
				message.channel.send(embed);
			} else {
				message.channel.send('There seems to be an error');
			}
		});
	});

	commands(client, 'dev', (message) => {
		const reply = 'The devs are: Suban#8687 and nottheonetyonethguy#1864';
		message.channel.send(reply);
	});

	commands(client, 'code', (message) => {
		const link = 'https://github.com/IT-Club-Pulchowk/Hikana';
		message.channel.send(link);
	});

	commands(client, 'about', (message) => {
		msg =
			'You can read about be from https://github.com/IT-Club-Pulchowk/Hikana#about';
		message.channel.send(msg);
	});

	commands(client, 'q', (message) => {
		const author = { id: message.author.id, name: message.author.username };
		const question = message.content.slice(2);
		if (!question) {
			return;
		}
		const embed = new discord.MessageEmbed();
		embed
			.setTitle(`${author.name}`)
			.setColor(`RANDOM`)
			.setDescription(question);
		const questionChannel = process.env.Q_CHANNEL;
		if (questionChannel) {
			client.channels.cache.get(questionChannel).send(embed);
			message.react('👌');
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
});

client.login(process.env.BOT_TOKEN);

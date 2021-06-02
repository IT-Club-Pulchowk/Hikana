let command_list = [
	{
		name: 'help',
		description: 'Gives you info about the commands',
		arguments: 'optional',
		usage: '',
	},
	{
		name: 'nisan',
		description: 'nisan',
		arguments: 'none',
		usage: '',
	},
	{
		name: 'wiki',
		description: 'searches wikipedia for the topic',
		arguments: 'required',
		usage: '<search-term>',
	},
	{
		name: 'intro',
		description: 'gives you the description of the server',
		arguments: 'none',
		usage: '',
	},
	{
		name: 'kick',
		description: 'kicks member of the server',
		arguments: 'required',
		usage: '@member',
	},
	{
		name: 'ban',
		description: 'bans member of the server',
		arguments: 'required',
		usage: '@member',
	},
	{
		name: 'msg',
		description: 'Saves message to config.js',
		arguments: 'required',
		usage: '<msg>',
	},
	{
		name: 'plot',
		description: 'Returns a 2d plot of a equation',
		arguments: 'required',
		usage: '<equation>',
	},
];

nsfw_words = ['fuck', 'shit'];
nsfw_words = nsfw_words.join('|');
nsfw_words = '(' + nsfw_words + ')';

module.exports = { command_list, nsfw_words };
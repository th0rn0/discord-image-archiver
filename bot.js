const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const fs = require('fs');
const download = require('download');

var capitalize = require('capitalize')

client.on('ready', () => {
	console.log('I am ready!');
	client.user.setActivity('Ready to Archive!');
});

client.on('message', message => {
	var counter = 0;
	if (message.author.bot) return;

	if (message.content.startsWith('!archive')) {
		if (message.author.id != 119054162016206848) {
			message.reply('You do not have permission to do this!');
			return;
		}
		message.reply('Archiving the Channel...');
		let archive_last_id = 646444707773415443;
    	getMessages(message.channel);
	}
});

client.login(auth.token);

async function getMessages(channel, limit = 10000) {
    const messageCount = [];
    let lastId;
	client.user.setActivity('Archiving ' + channel.name + '!');
    while (true) {
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
        }

        const messages = await channel.fetchMessages(options);
		messages.forEach((message) => {
			// console.log(message.content);
			if (message.attachments.size > 0) {
				message.attachments.forEach((attachment) => {
					var counterAttach = 0;
					console.log(attachment.url);
					download(attachment.url).then(data => {
					    fs.writeFileSync('dump/' + message.guild.name + '-' + message.channel.name + '-'  + message.id + '-' + message.author.username + '-' + attachment.filename, data);
					});
				});
			}
		});
        messageCount.push(...messages.array());
        lastId = messages.last().id;
        // console.log(messages);
        if (messages.size != 100 || messageCount >= limit) {
        	channel.send('Images Archived');
			client.user.setActivity('Ready to Archive!');
            break;
        }
    }

    return messageCount;
}
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
		client.user.setActivity('Archiving!');
		message.reply('Archiving the Channel...');
        // $messages = lots_of_messages_getter(message.channel);
        // console.log($messages);
		let archive_last_id = 646444707773415443;
		let last_id = 0;
    	while (true) {
    		const options = { limit: 100 };
	        if (last_id != 0) {
	            options.before = last_id;
	        }
            // const messages = await message.channel.fetchMessages(options);
            // console.log(messages);
			const test = message.channel.fetchMessages(options).then(messages => {
				// console.log(messages);
				messages.forEach((message) => {
					// console.log(message.content);
					if (message.attachments.size > 0) {
						message.attachments.forEach((attachment) => {
							var counterAttach = 0;
							console.log(attachment.url);
							download(attachment.url).then(data => {
							    fs.writeFileSync('dump/' + message.author.username + '-' + message.id + '.jpg', data);
							});
						});
					}
				});
				console.log(messages.last().id);
    			last_id = messages.last().id;
				console.log(archive_last_id)
    			console.log(last_id)

			}).catch(console.error);
			console.log(test.last().id);
    			console.log(last_id)
				console.log(archive_last_id)
			if (archive_last_id == last_id) {
				break;
			}
		}
		message.channel.send('Images Archived');
		client.user.setActivity('Ready to Archive!');
	}
});

client.login(auth.token);

async function lots_of_messages_getter(channel, limit = 500) {
    const sum_messages = [];
    let last_id;

    while (true) {
        const options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        }

        const messages = await channel.fetchMessages(options);
        sum_messages.push(...messages.array());
        last_id = messages.last().id;

        if (messages.size != 100 || sum_messages >= limit) {
            break;
        }
    }

    return sum_messages;
}
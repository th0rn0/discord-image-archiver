const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const fs = require('fs');
const download = require('download');
const ytdl = require('ytdl-core');
var counter = {};

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
    	getMessages(message.channel);
	}
});

client.login(auth.token);

async function getMessages(channel, limit = 50000) {
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
			if (message.attachments.size > 0) {
				message.attachments.forEach((attachment) => {
					var counterAttach = 0;
					console.log(attachment.url);
					download(attachment.url).then(data => {
						// Set Timestamp
						date = getTimestamp(message);
						addCounter(message.member.user.username);
						// Set Dir
						dir = 'dump/' + message.guild.name + '/' + message.channel.name;
						// Check if Dir Exists
						if (!fs.existsSync(dir)){
						    fs.mkdirSync(dir, { recursive: true });
						}
					    fs.writeFileSync(dir + '/'  + date + '-' + message.id + '-' + message.member.user.username + '-' + attachment.filename, data);
					});
				});
			}
			if (message.content.includes('youtu') && isYoutubeUrl(message.content)) {
				// Set Timestamp
				date = getTimestamp(message);
				// Set Dir
				dir = 'dump/' + message.guild.name + '/' + message.channel.name;
				// Check if Dir Exists
				if (!fs.existsSync(dir)){
				    fs.mkdirSync(dir, { recursive: true });
				}
				ytdl.getInfo(message.content).then(data => {
					console.log(data.title);
					ytdl(message.content)
	  					.pipe(fs.createWriteStream(dir + '/'  + date + '-' + message.id + '-' + message.member.user.username + '-' + cleanTitle(data.title) + '.flv'))
	  					;
				}).catch(error => console.error(error));
			}
		});
        messageCount.push(...messages.array());
        lastId = messages.last().id;
        if (messages.size != 100 || messageCount >= limit) {
        	channel.send('Images & Videos Archived');
        	channel.send(formatCounter());
        	resetCounter();
			client.user.setActivity('Ready to Archive!');
            break;
        }
    }

    return messageCount;
}

function isYoutubeUrl(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if ( match && match[7].length == 11 ){
        return match[7];
    }else{
        return false;
    }
}

function getTimestamp(message) {
	var newDate = new Date();
	newDate.setTime(message.createdTimestamp);
	return newDate.getDate() + '.' + (newDate.getMonth()+1) + '.' + newDate.getFullYear() + '-' + newDate.getHours() + '.' + newDate.getMinutes() + '.' + newDate.getSeconds();
}

function addCounter(user) {
	if (user in counter) {
		counter[user] = counter[user] + 1;
	} else {
		counter[user] = 1;
	}
}

function resetCounter() {
	counter = {};
}

function formatCounter() {
	var string = "Some stats for ur boiz \n";
	string += "```";
	string += "Some stats for ur boiz \n";
	string += "A total of " + counterPersonCount(counter) + " people uploaded! \n";
	string += "A total of " + counterUploadCount(counter) + " images and videos uploaded! \n";
	for (var key in counter) {
	  	string += key + ": " + counter[key] + "\n";
	}
	string += "```";
	return string;
}

function counterUploadCount(counter) {
  	var count = 0;
  	for(var i in counter) {
    	if( counter.hasOwnProperty( i ) ) {
      		count += parseFloat( counter[i] );
    	}
  	}
  	return count;
}

function counterPersonCount(counter) {
	var count = 0;
	for (var i in counter) {
	    if (counter.hasOwnProperty(i)) {
	        count++;
	    }
	}
	return count;
}

function cleanTitle(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

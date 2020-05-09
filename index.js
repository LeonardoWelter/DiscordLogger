// require the discord.js module
const Discord = require('discord.js');

// create a new Discord client
const client = new Discord.Client();

const {prefix, token, channel} = require('./config.json');

let canal;

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
    console.log('Ready!');
    client.channels.fetch(channel).then((result) => {
        canal = result;
    });
});

// login to Discord with your app's token
client.login(token);

client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        // send back "Pong." to the channel the message was sent in
        message.channel.send('Pong.');
    } else if (command === 'server') {
        message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    } else if (command === 'user-info') {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    } else if (command === 'args-info') {
        if (!args.length) {
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        }

        message.channel.send(`Command name: ${command}\nArguments: ${args}`);
    } else if (command === 'canal') {
        console.log('Zip');
        return client.channels.fetch(undefined, undefined);
    }


});

client.on('message', message => {
    if (message.author.bot) return;

    let date = new Date();

    return canal.send(`[++ CHAT] ${date.toLocaleString()} - [${message.channel}] ${message.author.tag} : ${message.cleanContent}`);
});

client.on('message', message => {
    if (message.author.bot) return;

    let date = new Date();
    let embedAdd = new Discord.MessageEmbed()
        .setColor('#17fc03')
        .setDescription(`Mensagem enviada no canal [#${message.channel.name}]`)
        .addField(`${message.author.tag} escreveu: `, message.cleanContent)
        .setFooter(date.toLocaleString() + ' - DiscordLogger');


    return canal.send(embedAdd);
});

client.on('messageDelete', message => {
    if (message.author.bot) return;

    let date = new Date();

    return canal.send(`[-- CHAT] ${date.toLocaleString()} - [${message.channel}] ${message.author.tag} : ${message.cleanContent} | ${message.createdAt.toLocaleString()}`);
});

client.on('messageDelete', message => {
    if (message.author.bot) return;

    let date = new Date();
    let embedDelete = new Discord.MessageEmbed()
        .setColor('#fc0303')
        .setDescription(`Mensagem removida no canal [#${message.channel.name}]`)
        .addField(`${message.author.tag} escreveu:`, message.cleanContent, true)
        .addField('criada em:', message.createdAt.toLocaleString(), true)
        .setFooter(date.toLocaleString() + ' - DiscordLogger');

    console.log(message);
    return canal.send(embedDelete);
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;

    let date = new Date();

    return canal.send(`[<> CHAT] ${date.toLocaleString()} - [${oldMessage.channel}] ${oldMessage.author.tag} : ${oldMessage.cleanContent} > ${newMessage.cleanContent}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.bot) return;

    let date = new Date();

    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (oldChannel && newChannel) {
        return canal.send(`[<> VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: ${oldChannel} => ${newChannel}`);
    }

    return canal.send(Boolean(newChannel) ? `[++ VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: => ${newChannel}` : `[-- VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: <= ${oldChannel}`);
});

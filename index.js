// Require do discord.js
const Discord = require('discord.js');

// Instância de cliente do Discord
const client = new Discord.Client();

// Importa os parâmetros de configuração do Bot
const {prefix, token, channel} = require('./config.json');

// Definição da variável que contém o canal onde as mensagens serão documentadas
let canal;

// Inicializa o Bot, possibilitando a leitura dos eventos
client.once('ready', () => {
    console.log('Iniciado!');
    client.channels.fetch(channel).then((result) => {
        canal = result;
    });
});

// Loga no discord usando o Token fornecido
client.login(token);

// Placeholders de comandos do guia do DiscordJS
client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
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
    }
});

// Documenta qualquer mensagem enviada
client.on('message', message => {
    if (message.author.bot) return;

    let date = new Date();

    return canal.send(`[++ CHAT] ${date.toLocaleString()} - [${message.channel}] ${message.author.tag} : ${message.cleanContent}`);
});

// Placeholder de Widget
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

// Documenta as mensagens removidas
client.on('messageDelete', message => {
    if (message.author.bot) return;

    let date = new Date();

    return canal.send(`[-- CHAT] ${date.toLocaleString()} - [${message.channel}] ${message.author.tag} : ${message.cleanContent} | ${message.createdAt.toLocaleString()}`);
});

// Placeholder Widget
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

// Documenta as mensagens editadas
client.on('messageUpdate', (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;

    let date = new Date();

    return canal.send(`[<> CHAT] ${date.toLocaleString()} - [${oldMessage.channel}] ${oldMessage.author.tag} : ${oldMessage.cleanContent} > ${newMessage.cleanContent}`);
});

// Documenta as conexões nas salas de voz e alternancia entre mute
client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.bot) return;

    let date = new Date();
    let retorno;

    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    // Troca de canal
    if (oldChannel && newChannel) {
        // Microfone mutado
        if (!Boolean(oldState.mute) && Boolean(newState.mute)) {
            retorno = `[<> VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: [${newChannel}] mutou o microfone`;
        // Microfone desmutado
        } else if (Boolean(oldState.mute) && !Boolean(newState.mute)) {
            retorno = `[<> VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: [${newChannel}] desmutou o microfone`;
        // Áudio mutado
        } else if (!Boolean(oldState.deaf) && Boolean(newState.deaf)) {
            retorno = `[<> VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: [${newChannel}] mutou o áudio`;
        // Áudio desmutado
        } else if (Boolean(oldState.deaf) && !Boolean(newState.deaf)) {
            retorno = `[<> VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: [${newChannel}] desmutou o áudio`;
        // Troca entre salas
        } else {
            retorno = `[<> VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: ${oldChannel} => ${newChannel}`;
        }
    // Nova conexão a um canal
    } else if (Boolean(newChannel)) {
        retorno = `[++ VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: => ${newChannel}`;
    // Saiu de um canal
    } else if (!Boolean(newChannel)) {
        retorno = `[-- VOICE] ${date.toLocaleString()} - ${oldState.member.user.tag}: <= ${oldChannel}`;
    }

    return canal.send(retorno);
});

// Require do discord.js
const Discord = require('discord.js');

// Instância de cliente do Discord
const client = new Discord.Client();

// Importa os parâmetros de configuração do Bot
const {prefix, token, channel} = require('./config.json');

// Definição da variável que contém o canal onde as mensagens serão documentadas
let canal;

// Definição das cores para os widgets
const vermelho = '#fc0303';
const verde = '#14ff08';
const azul = '#08a4ff';
const branco = '#ffffff';

// Inicializa o Bot, possibilitando a leitura dos eventos
client.once('ready', () => {
    console.log('Iniciado!');

    // Seleciona em qual canal serão enviadas as mensagens
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
        canal.send('Pong.');
    } else if (command === 'server') {
        canal.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    } else if (command === 'user-info') {
        canal.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    } else if (command === 'args-info') {
        if (!args.length) {
            return canal.send(`You didn't provide any arguments, ${message.author}!`);
        }

        canal.send(`Command name: ${command}\nArguments: ${args}`);
    }
});

// Documenta qualquer mensagem enviada
client.on('message', message => {
    if (message.author.bot) return;

    let date = new Date();
    let embedAdd = new Discord.MessageEmbed()
        .setColor(verde)
        .setTitle('Mensagem enviada')
        .addField('Autor', message.author.tag, true)
        .addField('Canal', message.channel.name, true)
        .addField('Data de envio', date.toLocaleString(), true)
        .addField('Mensagem', message.cleanContent ? message.cleanContent : '\u200B')
        .setFooter(`Log gerado em: ${date.toLocaleString()} - DiscordLogger`);

    if (message.attachments) {
        embedAdd.setImage(message.attachments.filter(({ proxyURL }) => /\.(gif|jpe?g|png|webp)$/i.test(proxyURL)).map(({ proxyURL }) => proxyURL)[0]);
    }

    console.log(`[MENSAGEM] ${date.toLocaleString()} - [${message.channel.name}] ${message.author.tag} enviou a 
                mensagem: "${message.cleanContent}"`);
    return canal.send(embedAdd);
});

// Documenta as mensagens removidas
client.on('messageDelete', message => {
    if (message.author.bot) return;

    let date = new Date();
    let embedDelete = new Discord.MessageEmbed()
        .setColor(vermelho)
        .setTitle('Mensagem removida')
        .addField('Autor', message.author.tag, true)
        .addField('Canal', message.channel.name, true)
        .addField('Data de envio', message.createdAt.toLocaleString(), true)
        .addField('Data da remoção', date.toLocaleString(), true)
        .addField('Mensagem', message.cleanContent ? message.cleanContent : '\u200B')
        .setFooter(`Log gerado em: ${date.toLocaleString()} - DiscordLogger`);

    if (message.attachments) {
        embedDelete.setImage(message.attachments.filter(({ proxyURL }) => /\.(gif|jpe?g|png|webp)$/i.test(proxyURL)).map(({ proxyURL }) => proxyURL)[0]);
    }

    console.log(`[DELETE] ${date.toLocaleString()} - [${message.channel.name}] ${message.author.tag} removeu a mensagem:
                "${message.cleanContent}" | criada em: ${message.createdAt.toLocaleString()}`);
    return canal.send(embedDelete);
});

// Documenta as mensagens editadas
client.on('messageUpdate', (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;

    let date = new Date();
    let embedUpdate = new Discord.MessageEmbed()
        .setColor(azul)
        .setTitle('Mensagem editada')
        .addField('Autor', oldMessage.author.tag, true)
        .addField('Canal', oldMessage.channel.name, true)
        .addField('Data de envio', oldMessage.createdAt.toLocaleString(), true)
        .addField('Data da edição', date.toLocaleString(), true)
        .addField('Mensagem original', oldMessage.cleanContent ? oldMessage.cleanContent : '\u200B')
        .addField('Mensagem editada', newMessage.cleanContent ? newMessage.cleanContent : '\u200B')
        .setFooter(`Log gerado em: ${date.toLocaleString()} - DiscordLogger`);

    if (newMessage.attachments) {
        embedUpdate.setImage(newMessage.attachments.filter(({ proxyURL }) => /\.(gif|jpe?g|png|webp)$/i.test(proxyURL)).map(({ proxyURL }) => proxyURL)[0]);
    }

    console.log(`[UPDATE] ${date.toLocaleString()} - [${oldMessage.channel.name}] ${oldMessage.author.tag} editou a mensagem: "${oldMessage.cleanContent}" para "${newMessage.cleanContent}"`);
    return canal.send(embedUpdate);
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
            let mensagemRetorno = `[MUTE] ${date.toLocaleString()} - [${newChannel}] ${oldState.member.user.tag}: mutou o microfone`;
            console.log(mensagemRetorno);
            retorno = mensagemRetorno;
        // Microfone desmutado
        } else if (Boolean(oldState.mute) && !Boolean(newState.mute)) {
            let mensagemRetorno = `[UNMUTE] ${date.toLocaleString()} - [${newChannel.name}] ${oldState.member.user.tag}: desmutou o microfone`;
            console.log(mensagemRetorno);
            retorno = mensagemRetorno;
        // Áudio mutado
        } else if (!Boolean(oldState.deaf) && Boolean(newState.deaf)) {
            let mensagemRetorno = `[DEAF] ${date.toLocaleString()} - [${newChannel.name}] ${oldState.member.user.tag}: mutou o áudio`;
            console.log(mensagemRetorno);
            retorno = mensagemRetorno;
        // Áudio desmutado
        } else if (Boolean(oldState.deaf) && !Boolean(newState.deaf)) {
            let mensagemRetorno = `[UNDEAF] ${date.toLocaleString()} - [${newChannel.name}] ${oldState.member.user.tag}: desmutou o áudio`;
            console.log(mensagemRetorno);
            retorno = mensagemRetorno;
        // Iniciou uma stream
        } else if(!Boolean(oldState.streaming) && Boolean(newState.streaming)) {
            let mensagemRetorno = `[STREAMON] ${date.toLocaleString()} - [${newChannel.name}] ${oldState.member.user.tag}: iniciou uma stream`;
            console.log(mensagemRetorno);
            retorno = mensagemRetorno;
        // Encerrou uma stream
        } else if (Boolean(oldState.streaming) && Boolean(newState.streaming)) {
            let mensagemRetorno = `[STREAMOFF] ${date.toLocaleString()} - [${newChannel.name}] ${oldState.member.user.tag}: encerrou uma stream`;
            console.log(mensagemRetorno);
            retorno = mensagemRetorno;
        // Troca entre salas
        } else {
            let embedChange = new Discord.MessageEmbed()
                .setColor(branco)
                .setTitle('Usuário trocou de canal')
                .addField('Usuário', oldState.member.user.tag, true)
                .addField('Data', date.toLocaleString(), true)
                .addField('Canal antigo', oldChannel)
                .addField('Canal novo', newChannel, true)
                .setFooter(`Log gerado em: ${date.toLocaleString()} - DiscordLogger`);

            console.log(`[CHANGE] ${date.toLocaleString()} - ${oldState.member.user.tag} trocou de canal: [${oldChannel.name}] para [${newChannel.name}]`);
            retorno = embedChange;
        }
    // Nova conexão a um canal
    } else if (Boolean(newChannel)) {
        let embedConnect = new Discord.MessageEmbed()
            .setColor(verde)
            .setTitle('Usuário entrou em um canal')
            .addField('Usuário', oldState.member.user.tag, true)
            .addField('Data', date.toLocaleString(), true)
            .addField('Canal', newChannel)
            .setFooter(`Log gerado em: ${date.toLocaleString()} - DiscordLogger`);

        console.log(`[CONNECT] ${date.toLocaleString()} - ${oldState.member.user.tag} entrou no canal: [${newChannel.name}]`);
        retorno = embedConnect;
    // Saiu de um canal
    } else if (!Boolean(newChannel)) {
        let embedDisconnect = new Discord.MessageEmbed()
            .setColor(vermelho)
            .setTitle('Usuário saiu de um canal')
            .addField('Usuário', oldState.member.user.tag, true)
            .addField('Data', date.toLocaleString(), true)
            .addField('Canal antigo', oldChannel)
            .setFooter(`Log gerado em: ${date.toLocaleString()} - DiscordLogger`);

        console.log(`[DISCONNECT] ${date.toLocaleString()} - ${oldState.member.user.tag} saiu do canal: [${oldChannel.name}]`);
        retorno = embedDisconnect;
    }

    return canal.send(retorno);
});

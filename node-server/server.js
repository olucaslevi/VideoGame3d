const http = require('http');
const express = require('express');
const socket = require("socket.io");
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001; // ? PORTA 3000 padrao do server
const randomColor = require('randomcolor');

// express cors
// socket.io setup
const server = http.createServer(app);
const io = socket(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

var world = require('./Components/server-config.js');

var players = []; // * list of online players
let player; // * current player

io.on("connection", (socket) => {
    console.log("Socket connected with id: " + socket.id);
    // enviar sinal de update p/ outros players
    // ? connection config
    const color = randomColor(); // random color for player Chat
    var id = socket.id; // * player id
    // var name =  username; // * player name
    
    socket.on('login', (username) => {
        world.addPlayer(id); // * add player to world
        var player = world.playerForId(id); // * get player from world and set to player variable
        // update player with color and username
        player.color = color;
        player.name = username;
        player.id = id;
        socket.emit('createPlayer', player); // * send player data to client to create player
        // update other players
        socket.broadcast.emit('createOtherPlayer', player); // * send player data to other clients to create player
        players.push(player);
});

    
    world.addPlayer(id); // * add player to world
    console.log('new user connected: ' + id);
    var player = world.playerForId(id); // * get player from world and set to player variable
    // socket.broadcast.emit('createOtherPlayer', player); // * send player data to other clients to create player

    socket.on('requestNewPlayer', () => {
        socket.broadcast.emit('requestNewPlayer', player); // essa funcao adiciona os players que conectam depois que o server ja esta rodando
    });

    socket.on('fetchPlayers', () => {
        socket.emit('fetchPlayers', players);
    });

    // ? players stuff
    socket.on('requestOldPlayers', function(){ // essa funcao adiciona os players que ja estao online quando um novo player se conecta
        if (players == []) return;
        for (var i = 0; i < players.length; i++) {
            socket.emit('addOtherPlayer', players[i]); // * send player data to client to create player
        }
    });
    socket.on('updatePosition', function(data){
        // log the complete data
        var newData = world.updatePlayerData(data);
        socket.broadcast.emit('updatePosition', newData);
    });


    socket.on('disconnect', function(){
        console.log('user disconnected');
        io.emit('removeOtherPlayer', player);
        world.removePlayer( player );
    });
    socket.on('message', (text,autor) => {
        io.emit('message', text,autor,color);
    });
    

    socket.on("disconnect", (currentPlayer) => {
        socket.emit('message',`Socket disconnected: ${socket.id}`);
        socket.broadcast.emit('message',`Socket disconnected: ${socket.id}`);
        players.splice(players.indexOf(socket.id), 1);
        socket.emit("lefted",currentPlayer);
        io.sockets.emit("message", `${socket.username} has left the chat`);
        io.sockets.emit("lefted",currentPlayer);
    });
  });


server.on('error', (err) => {
    console.error(err);
  });

server.listen(PORT, () => {
    console.log('Servidor principal rodando e ouvindo a porta ' + PORT);
  }); 
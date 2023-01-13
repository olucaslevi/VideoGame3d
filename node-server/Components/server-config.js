// store all players
var players = [];

function Player(){

    this.playerId = players.length;
    this.x = 0;
    this.y = 0;
    this.z = 10;
    this.r_x = 0;
    this.r_y = 0;
    this.r_z = 0;
    this.sizeX = 1;
    this.sizeY = 1;
    this.sizeZ = 1;
    this.speed = 0.9;
    this.turnSpeed = 0.03;
    this.body = 'cube';
    
}

var addPlayer = function(id){

    var player = new Player();
    player.playerId = id;
    players.push( player );

    return player;
};

var removePlayer = function(player){

    var index = players.indexOf(player);

    if (index > -1) {
        players.splice(index, 1);
    }
};

var updatePlayerData = function(data){
    var player = playerForId(data.playerId);
    if ( !player ) return;
    player.x = data.x;
    player.y = data.y;
    player.z = data.z;
    player.r_x = data.r_x;
    player.r_y = data.r_y;
    player.r_z = data.r_z;
    player.sizeX = data.sizeX;
    player.sizeY = data.sizeY;
    player.sizeZ = data.sizeZ;
    player.speed = data.speed;
    player.turnSpeed = data.turnSpeed;
    player.body = data.body;

    return player;
};

var playerForId = function(id){

    var player;
    for (var i = 0; i < players.length; i++){
        if (players[i].playerId === id){

            player = players[i];
            break;

        }
    }

    return player;
};

module.exports.players = players;
module.exports.addPlayer = addPlayer;
module.exports.removePlayer = removePlayer;
module.exports.updatePlayerData = updatePlayerData;
module.exports.playerForId = playerForId;
import { Vector3 } from "three";

class Player {
    // socket.id , username, 
    constructor(id, username) {
        this.id = id;
        this.username = username;
        this.position = new Vector3(0,1,0);
        this.velocity = new Vector3(0, 0, 0);
    }
    // update player model
    update() {
        // update player position
        this.position.x = playerBody.position.x;
        this.position.y = playerBody.position.y;
        this.position.z = playerBody.position.z;
    }
    draw() {
        // draw player model
        console.log('desenhou');
    }
    move(direction) {
        direction = direction.toLowerCase();
        // move player in direction
        switch (direction) {
            case "forward":
                playerBody.velocity.z = 10;
                break;
            case "backward":
                playerBody.velocity.z = -10;
                break;
            case "left":
                playerBody.velocity.x = -10;
                break;
            case "right":
                playerBody.velocity.x = 10;
                break;
        }
    }
};

export default Player;
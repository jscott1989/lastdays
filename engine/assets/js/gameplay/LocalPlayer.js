import Player from "./Player.js";

/**
 * This is the local player - it has all the features of a normal player, wrapped
 * so that it also sends the commands to the server for sync
 */
export default class LocalPlayer extends Player {

    move(x, y) {
        super.move(x, y);
        this.game.getConnection().send("move", {x: x, y: y});
    }
}
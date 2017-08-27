import Player from "./Player.js";

/**
 * This is the local player - it has all the features of a normal player, wrapped
 * so that it also sends the commands to the server for sync
 */
export default class LocalPlayer extends Player {

    move(x, y, direction) {
        this.game.getConnection().send("move", {x: x, y: y, direction: direction});
        return super.move(x, y, direction);
    }

    talk(text) {
        this.game.getConnection().send("talk", {"text": text})
        return super.talk(text);
    }

    removeFromInventory(item) {
        this.game.getConnection().send("removeFromInventory", {"item": item})
        super.removeFromInventory(item);
        this.game.getUiController().refreshInventory();
    }

    addToInventory(item) {
        this.game.getConnection().send("addToInventory", {"item": item})
        super.addToInventory(item);
        this.game.getUiController().refreshInventory();
    }

    set(key, value) {
        this.game.getConnection().send("setPlayerVariable", {"key": key, "value": value})
        super.set(key, value);
    }

    setDirection(direction) {
        this.game.getConnection().send("setDirection", {"direction": direction})
        super.setDirection(direction);
    }

    beginDialogue(participant2, dialogueId) {
        super.beginDialogue(participant2, dialogueId);
        this.game.getUiController().showDialogue(this.dialogue);
    }

    playSound(sound) {
        this.game.getConnection().send("playSound", {"sound": sound})
        return super.playSound(sound);
    }
}
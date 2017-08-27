import Character from "./Character.js";
import Dialogue from "./Dialogue.js";

export default class Player extends Character {
    removeFromInventory(item) {
        this.data.inventory[item] -= 1;
        if (this.data.inventory[item] <= 0) {
            delete this.data.inventory[item];
        }
    }

    addToInventory(item) {
        if (this.data.inventory[item] == null) {
            this.data.inventory[item] = 0;
        }
        this.data.inventory[item] += 1;
    }

    beginDialogue(participant2, dialogueId) {
        this.dialogue = new Dialogue(this.game, this, participant2, dialogueId);
    }

    playSound(sound) {
        return this.game.getRenderer().playSound(sound);
    }
}
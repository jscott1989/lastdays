import Character from "./Character.js";

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
}
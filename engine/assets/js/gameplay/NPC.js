import Character from "./Character.js";

export default class NPC extends Character {
    getInteractLocation() {
        return this.data.interactLocation;
    }

    getColor() {
        console.log(this.game.getConfiguration().get("characters")[this.data.character]);
        return this.game.getConfiguration().get("characters")[this.data.character].color;
    }
}
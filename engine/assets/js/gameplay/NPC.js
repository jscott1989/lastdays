import Character from "./Character.js";

export default class NPC extends Character {
    getInteractLocation() {
        return this.game.getConfiguration().get("characters")[this.character].interactLocation;
    }
}
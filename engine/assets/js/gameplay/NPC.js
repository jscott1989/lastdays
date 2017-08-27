import Character from "./Character.js";

export default class NPC extends Character {
    getInteractLocation() {
        return this.data.interactLocation;
    }
}
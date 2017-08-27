import Datastore from "./data/Datastore.js";

export default class Hotspot {
    constructor(game, data) {
        this.game = game;
        this.data = data;

        this.sprite = game.renderer.addHotspotSprite(
            this.data.location.x,
            this.data.location.y,
            this.data.location.width,
            this.data.location.height);

        game.renderer.enableInput(this);
    }

    get(key) {
        return Datastore.get(this.data, key);
    }

    set(key, value) {
        return Datastore.set(this.data, key, value);
    }

    destroy() {
        this.sprite.destroy();
    }

    getSprite() {
        return this.sprite;
    }

    getId() {
        return this.data.id;
    }

    getName() {
        return this.game.getConfiguration().get("hotspots")[this.data.type].name;
    }

    getLookAt() {
        return this.game.getConfiguration().get("hotspots")[this.data.type].lookAt;
    }

    getInteract(key) {
        key = key || "interact";
        return this.game.getConfiguration().get("hotspots")[this.data.type][key];
    }

    getInteractLocation() {
        console.log(this.data);
        return this.data.interactLocation;
    }
}
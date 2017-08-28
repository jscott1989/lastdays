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

    _getConfig(key) {
        if (this.data[key]) {
            return this.data[key];
        }
        return this.game.getConfiguration().get("hotspots")[this.data.type][key];
    }

    getName() {
        return this._getConfig("name");
    }

    getLookAt() {
        return this._getConfig("lookAt");
    }

    getInteract(key) {
        key = key || "interact";
        return this._getConfig(key);
    }

    getInteractLocation() {
        return this._getConfig("interactLocation");
    }
}
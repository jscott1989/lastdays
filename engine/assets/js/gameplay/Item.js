import Datastore from "./data/Datastore.js";

export default class Item {
    constructor(game, data) {
        this.game = game;
        this.data = data;

        this.sprite = game.renderer.addItemSprite(
            data,
            this.data.location.x,
            this.data.location.y
        );

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
        return this.game.getConfiguration().get("items")[this.data.type][key];
    }

    getName() {
        return this._getConfig("name");
    }

    getLookAt() {
        return this._getConfig("lookAt");
    }

    getInteract(key) {
        key = key || "interact";

        if (key == "interact" && this._getConfig("canBePickedUp")) {
            // We have a default interact that we return, to pick up the item
            return [
                {type: "pickUpItem", "item": this.getId()}
            ]
        }

        return this._getConfig(key);
    }

    getUnknownInteract() {
        return this._getConfig("unknownInteract")
    }

    getInteractLocation() {
        return this._getConfig("interactLocation");
    }
}
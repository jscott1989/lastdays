import Datastore from "./data/Datastore.js";

export default class Image {
    constructor(game, data) {
        this.game = game;
        this.data = data;

        this.sprite = game.renderer.addImage(
            data,
            this.data.location.x,
            this.data.location.y
        );
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
}
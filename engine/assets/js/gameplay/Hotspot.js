const SMOOTHING_AMOUNT = 500;

export default class Character {
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
        return this.data[key]
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
}
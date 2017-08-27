import Datastore from "./data/Datastore.js";

export default class WorldState extends Datastore {
    constructor(game, data) {
        super(data);
        this.game = game;
    }

    set(key, value) {
        this.game.getConnection().send("setWorldVariable", {"key": key, "value": value})
        return super.set(key, value);
    }

    setLocal(key, value) {
        return super.set(key, value);
    }
}
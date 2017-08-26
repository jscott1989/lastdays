import Player from "./Player.js";
import EasyStar from "easystarjs";

export default class Room {

    constructor(game, name) {
        this.game = game;
        this.name = name;

        // Sprites
        this.background = null
        this.players = new Map();
        // End sprites

        // We bind the callbacks for subscriptions
        this._add_player = this._add_player.bind(this);
        this._remove_player = this._remove_player.bind(this);
        this._move = this._move.bind(this);
        // End binding
    }

    unload() {
        this.game.debugMessage("Unloading room " + this.name);

        this.background.destroy();

        this.game.getConnection().messagesObservable.unsubscribe("add_player", this._add_player);
        this.game.getConnection().messagesObservable.unsubscribe("remove_player", this._remove_player);
        this.game.getConnection().messagesObservable.unsubscribe("move", this._move);
    }

    load(data) {
        this.game.debugMessage("Loading room " + this.name);


        const bgImg = this.game.renderer.phaser.cache.getImage(this.name + "-background");
        this.background = this.game.renderer.addTileSprite(this.name + "-background");
        this.game.renderer.setBounds(0, 0, bgImg.width, bgImg.height);

        // Calculate Easystar from mask
        this.easystar = new EasyStar.js();
        const maskImg = this.game.renderer.phaser.cache.getImage(this.name + "-mask");

        const bmd = this.game.renderer.makeBitmapData(maskImg.width, maskImg.height);
        bmd.draw(maskImg, 0, 0);
        bmd.update();
        const bmdata = bmd.data;

        var map = []
        var i = 0;
        for (var y = 0; y < bgImg.height; y++) {
            var r = [];
            for (var x = 0; x < bgImg.width; x++) {
                if (bmdata[i + 3] > 0) {
                    // Visible
                    r.push(1);
                } else {
                    r.push(0)
                }
                i += 4;
            }

            map.push(r);
        }

        this.easystar.setGrid(map);
        this.easystar.setAcceptableTiles([1]);

        data.players.forEach(player => {
            this.players.set(player.id, new Player(this.game, player));
        });

        this.game.getConnection().messagesObservable.subscribe("add_player", this._add_player);
        this.game.getConnection().messagesObservable.subscribe("remove_player", this._remove_player);
        this.game.getConnection().messagesObservable.subscribe("move", this._move);
    }

    _add_player(subject, content) {
        if (content.player.id === this.game.getPlayer().getId()) {
            // We don't need to add ourselves
            return;
        }
        this.players.set(content.player.id, new Player(this.game, content.player));
    }

    _remove_player(subject, content) {
        if (content.player === this.game.getPlayer().getId()) {
            // We don't need to remove ourselves
            return;
        }
        this.players.get(content.player).destroy();
        this.players.delete(content.player);
    }

    _move(subject, content) {
        if (content.player == this.game.getPlayer().getId()) {
            // We initiated the move - don't repeat it
            return;
        }

        this.players.get(content.player).move(content.x, content.y);
    }


    findPath(x1, y1, x2, y2) {
        return new Promise((resolve, fail) => {
            this.easystar.findPath(x1, y1, x2, y2, (path) => {
                if (path == null) {
                    fail();
                } else {
                    resolve(path);
                }
            });
        });
    }

    update() {
        this.easystar.calculate();

        this.players.forEach(player => player.update());
    }
}
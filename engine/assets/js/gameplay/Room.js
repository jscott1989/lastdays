import Hotspot from "./Hotspot.js";
import Player from "./Player.js";
import NPC from "./NPC.js";
import EasyStar from "easystarjs";

function calcStraightLine (startCoordinates, endCoordinates) {
    let coordinatesArray = new Array();
    // Translate coordinates
    let x1 = startCoordinates[0];
    let y1 = startCoordinates[1];
    let x2 = endCoordinates[0];
    let y2 = endCoordinates[1];
    // Define differences and error check
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;
    // Set first coordinates
    coordinatesArray.push([x1, y1]);
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
      let e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
      // Set coordinates
      coordinatesArray.push([x1, y1]);
    }
    // Return the result
    return coordinatesArray;
  }

export default class Room {

    constructor(game, name) {
        this.game = game;
        this.name = name;

        // Sprites
        this.background = null
        this.players = new Map();
        this.npcs = new Map();
        this.hotspots = new Map();
        // End sprites

        // We bind the callbacks for subscriptions
        this._addPlayer = this._addPlayer.bind(this);
        this._removePlayer = this._removePlayer.bind(this);
        this._setDirection = this._setDirection.bind(this);
        this._move = this._move.bind(this);
        this._talk = this._talk.bind(this);
        this._playSound = this._playSound.bind(this);
        this._pickDialogue = this._pickDialogue.bind(this);
        // End binding
    }

    unload() {
        this.game.debugMessage("Unloading room " + this.name);

        this.background.destroy();
        this.players.forEach(player => player.destroy());
        this.npcs.forEach(npc => npc.destroy());
        this.npcs.forEach(hotspot => hotspot.destroy());

        this.game.getConnection().messagesObservable.unsubscribe("addPlayer", this._addPlayer);
        this.game.getConnection().messagesObservable.unsubscribe("removePlayer", this._removePlayer);
        this.game.getConnection().messagesObservable.unsubscribe("move", this._move);
        this.game.getConnection().messagesObservable.unsubscribe("talk", this._talk);
        this.game.getConnection().messagesObservable.unsubscribe("setDirection", this._setDirection);
        this.game.getConnection().messagesObservable.unsubscribe("playSound", this._playSound);
        this.game.getConnection().messagesObservable.unsubscribe("pickDialogue", this._pickDialogue);
    }

    load(data) {
        this.game.debugMessage("Loading room " + this.name);


        const bgImg = this.game.renderer.phaser.cache.getImage(this.name + "-background");
        this.width = bgImg.width;
        this.height = bgImg.height;
        this.background = this.game.renderer.addTileSprite(this.name + "-background");
        this.game.renderer.setBounds(0, 0, this.width, this.height);

        // Calculate Easystar from mask
        this.easystar = new EasyStar.js();
        const maskImg = this.game.renderer.phaser.cache.getImage(this.name + "-mask");

        const bmd = this.game.renderer.makeBitmapData(this.width, this.height);
        bmd.draw(maskImg, 0, 0);
        bmd.update();
        const bmdata = bmd.data;

        this.map = []
        let i = 0;
        for (let y = 0; y < this.height; y++) {
            let r = [];
            for (let x = 0; x < this.width; x++) {
                if (bmdata[i + 3] > 0) {
                    // Visible
                    r.push(1);
                } else {
                    r.push(0)
                }
                i += 4;
            }

            this.map.push(r);
        }

        this.easystar.setGrid(this.map);
        this.easystar.setAcceptableTiles([1]);

        const players = data.players || [];

        players.forEach(player => {
            this.players.set(player.id, new Player(this.game, player));
        });

        const npcs = data.npcs || [];

        npcs.forEach(npc => {
            this.npcs.set(npc.id, new NPC(this.game, npc));
        });

        const hotspots = data.hotspots || [];

        hotspots.forEach(hotspot => {
            this.hotspots.set(hotspot.id, new Hotspot(this.game, hotspot));
        });

        this.game.getConnection().messagesObservable.subscribe("addPlayer", this._addPlayer);
        this.game.getConnection().messagesObservable.subscribe("removePlayer", this._removePlayer);
        this.game.getConnection().messagesObservable.subscribe("move", this._move);
        this.game.getConnection().messagesObservable.subscribe("talk", this._talk);
        this.game.getConnection().messagesObservable.subscribe("setDirection", this._setDirection);
        this.game.getConnection().messagesObservable.subscribe("playSound", this._playSound);
        this.game.getConnection().messagesObservable.subscribe("pickDialogue", this._pickDialogue);
    }

    _addPlayer(subject, content) {
        if (content.player.id === this.game.getPlayer().getId()) {
            // We don't need to add ourselves
            return;
        }
        
        this.players.set(content.player.id, new Player(this.game, content.player));
    }

    _removePlayer(subject, content) {
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

        this.players.get(content.player).move(content.x, content.y, content.direction);
    }

    _setDirection(subject, content) {
        if (content.player == this.game.getPlayer().getId()) {
            // We initiated the set direction - don't repeat it
            return;
        }

        this.players.get(content.player).setDirection(content.direction);
    }

    _talk(subject, content) {
        if (content.player == this.game.getPlayer().getId()) {
            // We initiated the talk - don't repeat it
            return;
        }

        this.players.get(content.player).talk(content.text);
    }

    _playSound(subject, content) {
        if (content.player == this.game.getPlayer().getId()) {
            // We initiated the sound - don't repeat it
            return;
        }

        this.players.get(content.player).playSound(content.sound);
    }

    _pickDialogue(subject, content) {
        if (content.player == this.game.getPlayer().getId()) {
            // We initiated the dialogue - don't repeat it
            return;
        }

        this.players.get(content.player).pickDialogue(content.dialogueId, content.option, this.npcs.get(content.npc));
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
        this.npcs.forEach(npc => npc.update());
    }

    /**
     * Set the appropriate scaling for a given sprite.
     */
    scale(sprite) {
        const scaling = game.getConfiguration().get("rooms")[this.name].scaling;
        if (scaling) {
            const yPos = Math.max(Math.min(sprite.y, scaling.maxY), scaling.minY);
            const scaleValue = ((yPos - scaling.minY) / (scaling.maxY - scaling.minY)) * (scaling.maxScale - scaling.minScale) + scaling.minScale;

            sprite.scale.x = (sprite.scale.x > 0) ? scaleValue : -scaleValue;
            sprite.scale.y = scaleValue;
        } else {
            sprite.scale.x = (sprite.scale.x > 0) ? 1 : -1;
            sprite.scale.y = 1;
        }
    }

    getNearestWalkablePoint(x, y, currentX, currentY) {
        // TODO: This does not consider walkable from current location
        // this may be needed in a future iteration
        if (this.map[y][x] > 0) {
            return [x, y];
        }
        const currentPosition = [currentX, currentY];
        const targetPosition = [x, y];
        const possibleCoordinates = calcStraightLine(targetPosition, currentPosition);

        for (const c in possibleCoordinates) {
            const coordinate = possibleCoordinates[c];
            if (this.map[coordinate[1]][coordinate[0]] > 0) {
                // Can use this one
                return [coordinate[0], coordinate[1]]
            }
        }

        return null;
    }
}
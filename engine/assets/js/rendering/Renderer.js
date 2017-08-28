import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';
import Observable from "../networking/Observable.js";

export default class Renderer {
    constructor(game) {
        this.game = game;
        this.clickEvents = new Observable("click events", game);
    }

    initialise() {
        const promise = new Promise((resolve, fail) => {
            this.phaser = new Phaser.Game(
                800, 600,
                Phaser.CANVAS,
                "game", 
                { preload: () => {
                    this._preload();
                    resolve();
                },
                update: () => this._update()}
            );
        });
        return promise;
    }

    _preload() {
        this.phaser.stage.disableVisibilityChange = true;
        this.background = this.phaser.add.group();
        this.hotspots = this.phaser.add.group();
        this.sprites = this.phaser.add.group();

        this.phaser.input.onDown.add((pointer) => {
            const x = this.phaser.input.x + this.phaser.camera.x;
            const y = this.phaser.input.y + this.phaser.camera.y;
            const button = (pointer.button == Phaser.Mouse.RIGHT_BUTTON) ? "RIGHT" : "LEFT";
            this.clickEvents.trigger({"x": x, "y": y, "button": button});
        });

        const rooms = this.game.getConfiguration().get("rooms");
        Object.keys(rooms).forEach(roomId => {
            this.game.debugMessage(`Loading room ${roomId}`);
            const room = rooms[roomId];
            this.phaser.load.image(roomId + '-background', '/static/' + room.background);
            this.phaser.load.image(roomId + '-mask', '/static/' + room.mask);
        });

        const characters = this.game.getConfiguration().get("characters");
        Object.keys(characters).forEach(characterId => {
            this.game.debugMessage(`Loading character ${characterId}`);
            const character = characters[characterId];
            this.phaser.load.spritesheet(characterId + '-sprite', '/static/' + character.sprite, character.width, character.height);
        });

        const sounds = this.game.getConfiguration().get("sounds");
        Object.keys(sounds).forEach(soundId => {
            this.phaser.load.audio(soundId, '/static/sounds/' + sounds[soundId]);
        });
    }
    
    _update() {
        if (this.game != null) {
            this.game.update();
        }

        if (this.sprites != null) {
            this.sprites.sort("y");
        }

        if (this.hoveredObjectText != null) {
            const hoverable = this.game.getHoveredObject().hoverable;
            const bounds = this.getSpriteBounds(hoverable.getSprite());
            this.hoveredObjectText.x = bounds.x + hoverable.getSprite().width / 2 - this.hoveredObjectText.width / 2;
            this.hoveredObjectText.y = bounds.y + hoverable.getSprite().height + 10
        }
    }

    updateCursor() {
        if (this.hoveredObjectText != null) {
            this.hoveredObjectText.destroy();
            this.hoveredObjectText = null;
        }
        if (this.game.getHoveredObject() == null) {
            this.phaser.canvas.style.cursor = "default";
        } else {
            // TODO: support different interactions
            this.phaser.canvas.style.cursor = "pointer";
            const hoverable = this.game.getHoveredObject().hoverable;

            const bounds = this.getSpriteBounds(hoverable.getSprite());

            this.hoveredObjectText = this.addText(
                bounds.x + hoverable.getSprite().width / 2,
                bounds.y + hoverable.getSprite().height + 10, hoverable.getName(), {
                    font: "18px Press Start 2P",
                    fill: "#112266",
                    align: "center",
                    wordWrap: true,
                    wordWrapWidth: 300,
                    stroke: "#000000",
                    strokeThickness: 2
                });
            this.hoveredObjectText.x -= this.hoveredObjectText.width / 2;
        }
    }

    addText(x, y, text, options) {
        return this.phaser.add.text(x, y, text, options);
    }


    addTileSprite(name, x, y) {
        x = x || 0
        y = y || 0

        const img = this.phaser.cache.getImage(name);

        const sprite = this.phaser.add.tileSprite(
            x,
            y,
            img.width,
            img.height,
            name);

        this.background.add(sprite);
        return sprite;
    }

    addCharacterSprite(character, x, y) {
        const sprite = this.phaser.add.sprite(x, y, character + '-sprite', null, this.sprites);
        sprite.anchor.setTo(.5,1);

        const animations = game.getConfiguration().get("characters")[character].animations;
        Object.keys(animations).forEach((animationKey) => {
            const animation = animations[animationKey];
            sprite.animations.add(animationKey, animation.frames, animation.fps, animation.loop);
        })
        sprite.animations.play('idle-side');

        return sprite;
    }

    addHotspotSprite(x, y, width, height) {
        const bmd = this.phaser.add.bitmapData(width, height);
        // if (this.game.debugMode) {
        //     bmd.ctx.beginPath();
        //     bmd.ctx.rect(0,0,width,height);
        //     bmd.ctx.fillStyle = 'rgba(255,0,0,0.5)';
        //     bmd.ctx.fill();
        // }

        const hotspotSprite = this.phaser.add.sprite(x, y, bmd);
        this.hotspots.add(hotspotSprite);

        return hotspotSprite;
    }

    enableInput(hoverable) {
        hoverable.sprite.inputEnabled = true;

        const hoveredObject = {"hoverable": hoverable};

        hoverable.sprite.events.onInputOver.add(() => {
            this.game.setHoveredObject(hoveredObject);
        });

        hoverable.sprite.events.onInputOut.add(() => {
            this.game.unsetHoveredObject(hoveredObject);
        });
    }

    makeBitmapData(width, height) {
        return this.phaser.make.bitmapData(width, height);
    }

    follow(sprite) {
        this.phaser.camera.follow(sprite);
    }

    setBounds(x1, y1, x2, y2) {
        this.phaser.world.setBounds(x1, y1, x2, y2);
    }

    getElapsed() {
        return this.phaser.time.elapsed;
    }

    getSpriteBounds(sprite) {
        return {
            x: sprite.x - (sprite.width * sprite.anchor.x),
            y: sprite.y - (sprite.height * sprite.anchor.y)
        }
    }

    playSound(soundId) {
        return new Promise((resolve, fail) => {
            const sound = this.phaser.sound.add(soundId);
            sound.onStop.addOnce(() => {
                console.log("FINISHED PLAYING");
                resolve();
            });
            sound.play();
        })
    }
}
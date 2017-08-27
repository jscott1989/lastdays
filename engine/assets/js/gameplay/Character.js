const SMOOTHING_AMOUNT = 500;
import Datastore from "./data/Datastore.js";

export default class Character {
    constructor(game, data) {
        this.game = game;
        this.data = data;
        this.direction = this.data.location.direction || "right";

        this.sprite = game.renderer.addCharacterSprite(this.data.character,
            this.data.location.x,
            this.data.location.y);

        game.renderer.enableInput(this);

        const defaultAnimation = this.data.animation || "idle";

        const direction = (this.direction == "left" || this.direction == "right") ? "side" : this.direction;
        this.sprite.animations.play(defaultAnimation + '-' + direction)

        if (this.game.getRoom() != null) {
            this.game.getRoom().scale(this.sprite);
        }
    }
    get(key) {
        return Datastore.get(this.data, key);
    }

    set(key, value) {
        return Datastore.set(this.data, key, value);
    }

    move(x, y, direction) {
        return new Promise((resolve, fail) => {
            this.data.location.x = x;
            this.data.location.y = y;

            this.moveDirection = direction;
            this.moveCallback = resolve;

            this.game.getRoom().findPath(this.sprite.x, this.sprite.y, x, y).then((path) => {
                this.movingPath = path;
                this.pathPointer = 0;
            });
        });
    }

    setDirection(direction) {
        this.direction = direction;
        const defaultAnimation = this.data.animation || "idle";
        this.sprite.animations.play(defaultAnimation + '-' + this.direction)
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

    update() {
        if (this.movingPath != null) {
            this._updatePath();
        }

        if (this.talkText != null) {
            this.talkTextTimeout -= this.game.getElapsed();
            if (this.talkTextTimeout <= 0) {
                this.talkText.destroy();
                this.talkText = null;
                if (this.talkTextCallback != null) {
                    this.talkTextCallback();
                }
            } else {
                const bounds = this.game.getRenderer().getSpriteBounds(this.sprite);
                this.talkText.x = bounds.x + (this.sprite.width / 2) - (this.talkText.width / 2);
                this.talkText.y = bounds.y;
            }
        }
    }

    _updatePath() {
        if (this.pathPointer < this.movingPath.length) {
            const next = this.movingPath[this.pathPointer];
            this.pathPointer += 1;

            let next_direction = this.direction;

            if (next.x < this.sprite.x) {
                if (this.sprite.scale.x > 0) {
                    this.sprite.scale.x = 0 - this.sprite.scale.x;
                }
                next_direction = "left";
            } else if (next.x > this.sprite.x) {
                if (this.sprite.scale.x < 0) {
                    this.sprite.scale.x = 0 - this.sprite.scale.x;
                }
                next_direction = "right";
            } else if (next.y < this.sprite.y) {
                next_direction = "up";
            } else {
                next_direction = "down";
            }

            if (next_direction != this.direction) {
                // We're going to switch - to ensure we do it smoothly
                // make sure we're not going to just switch back
                let changeCount = 0;
                const lpos = [next.x, next.y];
                for (let i = this.pathPointer; i < this.pathPointer + SMOOTHING_AMOUNT && i < this.movingPath.length; i++) {
                    const p = this.movingPath[this.pathPointer];
                    if (p.x < lpos[0]) {
                        // left
                        if (next_direction == "left") {
                            changeCount += 1;
                        } else {
                            changeCount -= 1;
                        }
                    } else if (p.x > lpos[0]) {
                        // right
                        if (next_direction == "right") {
                            changeCount += 1;
                        } else {
                            changeCount -= 1;
                        }
                    } else if (p.y < lpos[1]) {
                        // Up
                        if (next_direction == "up") {
                            changeCount += 1;
                        } else {
                            changeCount -= 1;
                        }
                    } else {
                        // Down
                        if (next_direction == "down") {
                            changeCount += 1;
                        } else {
                            changeCount -= 1;
                        }
                    }
                }

                if (changeCount > 0) {
                    this.direction = next_direction;
                }
            }

            this.sprite.x = next.x;
            this.sprite.y = next.y;
            this.game.getRoom().scale(this.sprite);
            const direction = (this.direction == "left" || this.direction == "right") ? "side" : this.direction;
            this.sprite.animations.play('walk-' + direction)
        } else {
            // Just finished
            this.movingPath = null;

            if (this.moveDirection != null) {
                this.direction = this.moveDirection;
                this.moveDirection = null;
            }

            const direction = (this.direction == "left" || this.direction == "right") ? "side" : this.direction;
            this.sprite.animations.play('idle-' + direction);

            if (this.moveCallback != null) {
                this.moveCallback();
                this.moveCallback = null;
            }
        }
    }

    talk(text) {
        return new Promise((resolve, fail) => {
            if (this.talkText != null) {
                this.talkText.destroy();
            }

            this.talkText = this.game.getRenderer().addText(
                0,
                0, text, {
                    font: "18px Press Start 2P",
                    fill: this.data.color,
                    align: "center",
                    wordWrap: true,
                    wordWrapWidth: 300,
                    stroke: "#000000",
                    strokeThickness: 2
                });

            this.talkText.anchor.setTo(0, 1);
            this.talkTextTimeout = text.length * 150;
            this.talkTextCallback = resolve;
        });
    }

    getName() {
        return this.game.getConfiguration().get("characters")[this.data.character].name;
    }

    getLookAt() {
        return this.game.getConfiguration().get("characters")[this.data.character].lookAt;
    }

    getInteract(key) {
        key = key || "interact";
        return this.game.getConfiguration().get("characters")[this.data.character][key];
    }
}
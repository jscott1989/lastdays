const SMOOTHING_AMOUNT = 500;

export default class Player {
    constructor(game, data) {
        this.game = game;
        this.data = data;
        this.direction = "side";

        this.sprite = game.renderer.addCharacterSprite(this.data.character,
            this.data.location.x,
            this.data.location.y);

        if (this.game.getRoom() != null) {
            this.game.getRoom().scale(this.sprite);
        }
    }

    get(key) {
        return this.data[key]
    }

    move(x, y) {
        this.data.location.x = x;
        this.data.location.y = y;

        this.game.getRoom().findPath(this.sprite.x, this.sprite.y, x, y).then((path) => {
            this.movingPath = path;
            this.pathPointer = 0;
        });
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
                this.talkText.x = this.sprite.x;
                this.talkText.y = this.sprite.y - (this.sprite.height * this.sprite.scale.y) - this.talkText.height * 0.5;
            }
        }
    }

    _updatePath() {
        if (this.pathPointer < this.movingPath.length) {
            const next = this.movingPath[this.pathPointer];
            this.pathPointer += 1;

            var next_direction = this.direction;

            if (next.x < this.sprite.x) {
                if (this.sprite.scale.x > 0) {
                    this.sprite.scale.x = 0 - this.sprite.scale.x;
                }
                next_direction = "side";
            } else if (next.x > this.sprite.x) {
                if (this.sprite.scale.x < 0) {
                    this.sprite.scale.x = 0 - this.sprite.scale.x;
                }
                next_direction = "side";
            } else if (next.y < this.sprite.y) {
                next_direction = "up";
            } else {
                next_direction = "down";
            }

            if (next_direction != this.direction) {
                // We're going to switch - to ensure we do it smoothly
                // make sure we're not going to just switch back
                var changeCount = 0;
                const lpos = [next.x, next.y];
                for (var i = this.pathPointer; i < this.pathPointer + SMOOTHING_AMOUNT && i < this.movingPath.length; i++) {
                    var p = this.movingPath[this.pathPointer];
                    if (p.x < lpos[0] || p.x > lpos[0]) {
                        // Side
                        if (next_direction == "side") {
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
            this.sprite.animations.play('walk-' + this.direction)
        } else {
            // Just finished
            this.movingPath = null;
            this.sprite.animations.play('idle-' + this.direction)
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
                    fill: "#FFFFFF",
                    align: "center",
                    wordWrap: true,
                    wordWrapWidth: 300,
                    stroke: "#000000",
                    strokeThickness: 2
                });

            this.talkText.anchor.setTo(0.5, 1);
            this.talkTextTimeout = 3000;
            this.talkTextCallback = resolve;
        });
    }
}
/**
 * Represents the unique player identity of the current browser session.
 * If the game is refreshed, the LocalIdentity should remain the same.
 * This allows for resuming of a game after disconnection.
 */
export default class LocalIdentity {
    constructor() {
        this.id = localStorage.getItem("last-days-player-id");
        if (this.id === null) {
            this.id = this.uuidv4();
            localStorage.setItem("last-days-player-id", this.id);
        }
    }

    /**
     * This is a particularly poor implementation of uuid. If a large number of players
     * are expected this should be replaced.
     */
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    getId() {
        return this.id;
    }
}
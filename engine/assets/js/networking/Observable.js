const DEFAULT_SUBJECT = "__DEFAULT__";

export default class Observable {
    constructor(name, game) {
        this.name = name;
        this.game = game;
        this.callbacks = {};
    }

    trigger(subject, content) {
        this.game.debugMessage("Triggering observable", this.name, subject, content);

        if (!content) {
            // Only one param is passed so it must be content
            content = subject;
            subject = DEFAULT_SUBJECT;
        }

        if (!this.callbacks[subject]) {
            return;
        }

        this.callbacks[subject].forEach((callback) => {
            callback(subject, content);
        });
    }

    subscribe(subject, callback) {
        if (!callback) {
            // Only one param is passed so it must be callback
            callback = subject;
            subject = DEFAULT_SUBJECT;
        }

        if (this.callbacks[subject] == null) {
            this.callbacks[subject] = new Set();
        }

        this.callbacks[subject].add(callback);
    }

    unsubscribe(subject, callback) {
        if (!callback) {
            // Only one param is passed so it must be callback
            callback = subject;
            subject = DEFAULT_SUBJECT;
        }

        if (this.callbacks[subject] == null) {
            return;
        }

        this.callbacks[subject].delete(callback);
    }
}
export default class ActionExecutor {
    constructor(game) {
        this.game = game;

        this.ACTIONS = {
            "talk": this._talk.bind(this),
            "condition": this._condition.bind(this),
            "removeFromInventory": this._removeFromInventory.bind(this),
            "addToInventory": this._addToInventory.bind(this),
            "setVariable": this._setVariable.bind(this)
        }
    }

    executeActions(actions, player) {
        return new Promise((resolve, fail) => {
            var result = Promise.resolve();
            actions.forEach(action => {
                result = result.then(() => this.ACTIONS[action.type](action, player));
            });
            resolve();
        });
    }

    _talk(action, player) {
        return player.talk(action.text);
    }

    _condition(action, player) {
        return new Promise((resolve, fail) => {
            for (const i in action.options) {
                const option = action.options[i];
                if (this._evaluateCondition(option.condition, player)) {
                    this.executeActions(option.actions, player).then(resolve);
                    return;
                }
            }
        })
    }

    _formatReadString(string) {
        if (!(typeof string == "string")) {
            return string;
        }

        const localRegex = /@([\w\.]+)/g;
        const localRegexReplacement = "player.get(\"$1\")";

        const worldRegex = /\^([\w\.]+)/g;
        const worldRegexReplacement = "this.game.getWorldState().get(\"$1\")";

        return string.replace(localRegex, localRegexReplacement).replace(worldRegex, worldRegexReplacement);
    }

    _evaluateCondition(condition, player) {
        if (condition === "default") {
            return true;
        }

        condition = this._formatReadString(condition);

        this.game.debugMessage("Evaluating condition " + condition);

        return eval(condition);
    }

    _removeFromInventory(action, player) {
        return new Promise((resolve, fail) => {
            player.removeFromInventory(action.item)
            resolve();
        })
    }

    _addToInventory(action, player) {
        return new Promise((resolve, fail) => {
            player.addToInventory(action.item)
            resolve();
        })
    }

    _setVariable(action, player) {
        return new Promise((resolve, fail) => {
            const value = eval(this._formatReadString(action.value));
            
            const localRegex = /@([\w\.]+)/g;
            const localRegexReplacement = "player.set(\"$1\", " + value + ")";

            const worldRegex = /\^([\w\.]+)/g;
            const worldRegexReplacement = "this.game.getWorldState().set(\"$1\", " + value + ")";

            eval(action.variable.replace(localRegex, localRegexReplacement).replace(worldRegex, worldRegexReplacement));
            resolve();
        });
    }
}
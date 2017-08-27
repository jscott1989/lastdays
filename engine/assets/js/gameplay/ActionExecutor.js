export default class ActionExecutor {
    constructor(game) {
        this.game = game;

        this.ACTIONS = {
            "talk": this._talk.bind(this),
            "localTalk": this._localTalk.bind(this),
            "condition": this._condition.bind(this),
            "removeFromInventory": this._removeFromInventory.bind(this),
            "addToInventory": this._addToInventory.bind(this),
            "setVariable": this._setVariable.bind(this),
            "beginDialogue": this._beginDialogue.bind(this),
            "playSound": this._playSound.bind(this)
        }
    }

    executeActions(actions, player, context) {
        var result = Promise.resolve();
        actions.forEach(action => {
            // We assume that action.participant is used then multiple players have been passed
            const actionPlayer = (action.participant) ? player[action.participant - 1] : player;

            result = result.then(() => {
                return this.ACTIONS[action.type](action, actionPlayer, context)
            });
        });
        return result;
    }

    _talk(action, player) {
        return player.talk(action.text);
    }

    _localTalk(action, player) {
        return player.localTalk(action.text);
    }

    _condition(action, player, context) {
        return new Promise((resolve, fail) => {
            for (const i in action.options) {
                const option = action.options[i];
                if (ActionExecutor.evaluateCondition(option.condition, player, this.game)) {
                    this.executeActions(option.actions, player, context).then(resolve);
                    return;
                }
            }
        })
    }

    _removeFromInventory(action, player) {
        player.removeFromInventory(action.item)
        return Promise.resolve();
    }

    _addToInventory(action, player) {
        player.addToInventory(action.item)
        return Promise.resolve();
    }

    _setVariable(action, player) {
        const value = eval(ActionExecutor.formatReadString(action.value));
        
        const localRegex = /@([\w\.]+)/g;
        const localRegexReplacement = "player.set(\"$1\", " + value + ")";

        const worldRegex = /\^([\w\.]+)/g;
        const worldRegexReplacement = "this.game.getWorldState().set(\"$1\", " + value + ")";

        eval(action.variable.replace(localRegex, localRegexReplacement).replace(worldRegex, worldRegexReplacement));
        return Promise.resolve();
    }

    _beginDialogue(action, player, context) {
        return player.beginDialogue(context, action.dialogue);
    }

    _playSound(action, player, context) {
        if (action.wait) {
            return this.game.getPlayer().playSound(action.sound)
        } else {
            this.game.getPlayer().playSound(action.sound)
            return Promise.resolve();
        }
    }
}

ActionExecutor.formatReadString = (string) => {
    if (!(typeof string == "string")) {
        return string;
    }

    const localRegex = /@([\w\.]+)/g;
    const localRegexReplacement = "player.get(\"$1\")";

    const worldRegex = /\^([\w\.]+)/g;
    const worldRegexReplacement = "game.getWorldState().get(\"$1\")";

    return string.replace(localRegex, localRegexReplacement).replace(worldRegex, worldRegexReplacement);
}

ActionExecutor.evaluateCondition = (condition, player, game) => {
    if (condition === "default") {
        return true;
    }

    condition = ActionExecutor.formatReadString(condition);

    return eval(condition);
}
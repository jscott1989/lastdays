import ActionExecutor from "./ActionExecutor.js";

export default class Dialogue {
    constructor(game, player, npc, dialogueId) {
        this.game = game;
        this.player = player;
        this.npc = npc;
        this.dialogueId = dialogueId;
        this.script = this.game.getConfiguration().get("dialogues")[this.dialogueId];
    }

    getOptions() {
        return Object.keys(this.script).filter(k => {
            if (k == "exit") return false;

            if (this.script[k].item) {
                return false;
            }

            if (this.script[k].condition && !ActionExecutor.evaluateCondition(this.script[k].condition, this.player, this.game)) {
                return false;
            }

            if (this.script[k].onceOnly && !(ActionExecutor.evaluateCondition(`!^state.dialogues.${this.dialogueId}.${k}`, this.player, this.game))) {
                return false;
            }

            if (this.script[k].onceOnlyLocal && !(ActionExecutor.evaluateCondition(`!@state.dialogues.${this.dialogueId}.${k}`, this.player, this.game))) {
                return false;
            }

            return true;
        }).map((option) => {
            return {
                "option": option,
                "image": this.script[option].image
            }
        });
    }

    end() {
        this.player.endDialogue();
    }

    pick(option) {
        if (option == "exit" && !this.script.exit) {
            // Default exit option, we're just going to end the dialogue.
            this.end();
            return;
        }

        this.player.pickDialogue(this.dialogueId, option, this.npc);
    }
}
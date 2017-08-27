import Character from "./Character.js";
import Dialogue from "./Dialogue.js";

export default class Player extends Character {
    removeFromInventory(item) {
        this.data.inventory[item] -= 1;
        if (this.data.inventory[item] <= 0) {
            delete this.data.inventory[item];
        }
    }

    addToInventory(item) {
        if (this.data.inventory[item] == null) {
            this.data.inventory[item] = 0;
        }
        this.data.inventory[item] += 1;
    }

    getDialogue() {
        return this.dialogue;
    }

    beginDialogue(npc, dialogueId) {
        this.dialogue = new Dialogue(this.game, this, npc, dialogueId);
    }

    endDialogue() {
        this.dialogue = null;
    }

    pickDialogue(dialogueId, option, npc) {
        npc.dialogueInProgress = new Promise((resolve, fail) => {
            const dialogue = this.game.getPlayer().getDialogue();
            if (dialogue && dialogue.npc == npc) {
                this.game.getUiController().blockDialogueInterface();
            }
            this.game.getActionExecutor().executeActions(this.game.getConfiguration().get("dialogues")[dialogueId][option].actions, [this, npc]).then(() => {
                if (dialogue && dialogue.npc == npc) {
                    this.game.getUiController().showDialogue(dialogue);
                    this.game.getUiController().unblockDialogueInterface();
                }
                npc.dialogueInProgress = null;
                resolve();
            });
        });
    }

    playSound(sound) {
        return this.game.getRenderer().playSound(sound);
    }
}
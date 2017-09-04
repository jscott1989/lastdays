import Character from "./Character.js";
import Dialogue from "./Dialogue.js";

export default class Player extends Character {
    removeFromInventory(item, number) {
        this.data.inventory[item] -= number;
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

            const dialogueOption = this.game.getConfiguration().get("dialogues")[dialogueId][option];
            const actions = dialogueOption ? dialogueOption.actions : this.game.getConfiguration().get("dialogues")[dialogueId]["default"].actions;

            this.game.getActionExecutor().executeActions(actions, [this, npc]).then(() => {
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

    pickUpItem(itemId) {
        const item  = this.game.getRoom().getItem(itemId);
        this.game.getRoom().removeItem(itemId);

        if (this.data.inventory[item.get("type")] == null) {
            this.data.inventory[item.get("type")] = 0;
        }
        this.data.inventory[item.get("type")] += 1;
    }

    getInteractLocation() {
        // TODO: This isn't really working very well
        if (this.direction == "up") {
            return {x: this.data.location.x - 10, y: this.data.location.y - 30, direction: "down"};
        } else if (this.direction == "down") {
            return {x: this.data.location.x + 10, y: this.data.location.y + 30, direction: "up"};
        } else if (this.direction == "left") {
            return {x: this.data.location.x - 30, y: this.data.location.y + 10, direction: "right"};
        } else {
            return {x: this.data.location.x + 30, y: this.data.location.y - 10, direction: "left"};
        }
    }
}
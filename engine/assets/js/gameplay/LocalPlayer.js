import Player from "./Player.js";

/**
 * This is the local player - it has all the features of a normal player, wrapped
 * so that it also sends the commands to the server for sync
 */
export default class LocalPlayer extends Player {

    move(x, y, direction) {
        this.game.getConnection().send("move", {x: x, y: y, direction: direction});
        return super.move(x, y, direction);
    }

    talk(text) {
        this.game.getConnection().send("talk", {"text": text})
        return super.talk(text);
    }

    pickUpItem(itemId) {
        this.game.getConnection().send("pickUpItem", {"item": itemId});
        const resp = super.pickUpItem(itemId);
        this.game.getUiController().refreshInventory();
        return resp;
    }

    removeFromInventory(item) {
        this.game.getConnection().send("removeFromInventory", {"item": item})
        super.removeFromInventory(item);
        this.game.getUiController().refreshInventory();
    }

    addToInventory(item) {
        this.game.getConnection().send("addToInventory", {"item": item})
        super.addToInventory(item);
        this.game.getUiController().refreshInventory();
    }

    set(key, value) {
        this.game.getConnection().send("setPlayerVariable", {"key": key, "value": value})
        super.set(key, value);
    }

    setDirection(direction) {
        this.game.getConnection().send("setDirection", {"direction": direction})
        super.setDirection(direction);
    }

    beginDialogue(npc, dialogueId) {
        super.beginDialogue(npc, dialogueId);
        this.game.getUiController().showDialogue(this.dialogue);
        if (npc.dialogueInProgress) {
            this.game.getUiController().blockDialogueInterface();

            npc.dialogueInProgress.then(() => {
                this.game.getUiController().unblockDialogueInterface();
            })
        }
    }

    endDialogue() {
        super.endDialogue();
        this.game.getUiController().hideDialogue();
    }

    playSound(sound) {
        this.game.getConnection().send("playSound", {"sound": sound})
        return super.playSound(sound);
    }

    pickDialogue(dialogueId, option, npc) {
        return new Promise((resolve, fail) => {
            this.game.getConnection().send("pickDialogue", {"dialogueId": dialogueId, "option": option, "npc": npc.getId()});
            const stateKey = "state.dialogues." + dialogueId + "." + option;

            // Save local
            let value = this.get(stateKey) || 0;
            this.set(stateKey, value + 1);

            // Save world
            value = this.game.getWorldState().get(stateKey) || 0;
            this.game.getWorldState().set(stateKey, value + 1)
            return super.pickDialogue(dialogueId, option, npc);
        });
    }

    getInteractLocation() {
        return {x: this.data.location.x, y: this.data.location.y};
    }

    getLookAt() {
        return [{
            "type": "talk",
            "text": "Hey good lookin'"
        }];
    }

    getInteract(key) {
        // TODO: we need a special case for self interaction...
        return [{
            "type": "talk",
            "text": "I don't want to do that to myself"
        }];
    }

    getName() {
        return "Me";
    }

    goToRoom(room, x, y, direction) {
        this.game.getConnection().send("goToRoom", {"room": room, "x": x, "y": y, "direction": direction})
    }
}
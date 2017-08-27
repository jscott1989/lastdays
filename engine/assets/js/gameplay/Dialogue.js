export default class Dialogue {
    constructor(game, participant1, participant2, dialogueId) {
        this.game = game;
        this.participant1 = participant1;
        this.participant2 = participant2;
        this.dialogueId = dialogueId;
        this.script = this.game.getConfiguration().get("dialogues")[this.dialogueId];
    }

    getOptions() {
        return [];
    }

    pick(option) {
        console.log(this.script);
        console.log("PICK ", option);
    }
}
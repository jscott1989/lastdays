import $ from 'jquery';
import {Stack} from 'es-collections';

export default class UIController {
    constructor(game) {
        this.game = game;
        this.modals = new Map();

        this.keydown = this.keydown.bind(this)
        $(document).keydown(this.keydown);
    }

    showModal(id, message) {
        this.hideModal(id);
        const modal = $(`<div class='modal'><div>${message}</div></div>`);
        $("body").append(modal);
        this.modals.set(id, modal);
    }

    hideModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            this.modals.delete(id)
            modal.remove();
        }
    }

    keydown(e) {
        if (e.keyCode == 13) { // enter;
            $(document).unbind("keydown", this.keydown);
            this.getChatText().then((text) => {
                this.game.getPlayer().talk(text);
                $(document).bind("keydown", this.keydown);
            }).catch(() => {
                $(document).bind("keydown", this.keydown);
            });
        }
    }

    getChatText() {
        return new Promise((resolve, fail) => {
            const chatInput = $(`<div class='chat-input'>
                <div class='inner'>
                    <input type='text'>
                </div>
            </div>`);
            $("body").append(chatInput);

            chatInput.find("input").focus();

            const checkKeyPress = (e) => {
                if (e.keyCode == 27) { // escape
                    fail();
                    $(document).unbind("keydown", checkKeyPress);
                    chatInput.remove();
                    e.stopPropagation();
                } else if (e.keyCode == 13) { // enter
                    resolve(chatInput.find("input").val());
                    $(document).unbind("keydown", checkKeyPress);
                    chatInput.remove();
                    e.stopPropagation();
                }
            };

            $(document).bind("keydown", checkKeyPress);
        });
    }
}
import $ from 'jquery';
import {Stack} from 'es-collections';

export default class UIController {
    constructor(game) {
        this.game = game;
        this.modals = new Map();
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
}
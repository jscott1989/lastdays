import $ from 'jquery';
import {Stack} from 'es-collections';

export default class UIController {
    constructor(game) {
        this.game = game;
        this.modals = new Map();

        this.keydown = this.keydown.bind(this)
        $(document).keydown(this.keydown);

        $(document).on("mousedown", "#inventory li", this._selectItem.bind(this))
        $(document).on("mousemove", this._mousemove.bind(this))
        $(document).on("mousedown", this._mousedown.bind(this))
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

    refreshInventory() {
        const $ul = $("#inventory ul");
        $ul.html("");

        if (this.selectedItemImage != null) {
            this.selectedItemImage.remove();
            this.selectedItemImage = null;
        }

        const inventory = this.game.player.get("inventory");
        const items = Object.keys(inventory);
        items.sort()
        items.forEach(inventoryItemType => {
            const inventoryItemNumber = inventory[inventoryItemType];
            const item = this.game.getConfiguration().get("inventoryitems")[inventoryItemType]
            const li = $(`<li data-item-type="${inventoryItemType}">
                <img src="/static/${item.image}">
                <span class="number number-${inventoryItemNumber}">x${inventoryItemNumber}</span>
                <span class="hoverText">${item.name}</span>
            </li>`);

            if (this.game.getSelectedItem() == inventoryItemType) {
                li.addClass("selected");
            }
            $ul.append(li);
        });

        if (this.game.getSelectedItem() != null) {
            const item = this.game.getConfiguration().get("inventoryitems")[this.game.getSelectedItem()];
            this.selectedItemImage = $(`<img class="selected-item" src="static/${item.image}">`);
            $("body").append(this.selectedItemImage);
        }
    }

    _selectItem(e) {
        const itemType = $(e.target).parent().data("item-type");
        const item = this.game.getConfiguration().get("inventoryitems")[itemType];

        if (this.dialogue) {
            if (e.button == 2) {
                return;
            }

            this.dialogue.dialogue.pick(itemType);
            return;
        }

        if (e.button == 2) {
            // Look at
            this.game.getActionExecutor().executeActions(item.lookAt, this.game.getPlayer(), item);
            return;
        }

        if (this.game.getSelectedItem() == itemType) {
            this.game.selectItem(null);
        } else {
            this.game.selectItem(itemType);
        }
    }

    _mousemove(e) {
        if (this.selectedItemImage != null) {
            this.selectedItemImage.css({
                left: e.clientX + 10,
                top: e.clientY + 10
            });
        }
    }

    _mousedown(e) {
        if (e.button == 2 && this.game.getSelectedItem() != null) {
            this.game.selectItem(null);
        }
    }

    showDialogue(dialogue) {
        this.hideDialogue();

        this.dialogue = $(`<div id="dialogue">
            <div class="options">
                <ul class="main">
                </ul>
                <div class="right">
                    <ul>
                        <li data-option="exit">
                            <img src="/static/dialogues/default/bye.png">
                            <span class="hoverText">Exit</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>`);

        this.dialogue.dialogue = dialogue;

        dialogue.getOptions().forEach((option) => {
            const $ul = this.dialogue.find("ul.main");
            $ul.append($(`<li data-option="${option.option}">
                <img src="/static/${option.image}">
                <span class="hoverText">${option.hover ? option.hover : option.option}</span>
            </li>`));
        });

        this.dialogue.find("li").click((e) => {
            const option = $(e.target).parent().data("option");
            this.dialogue.dialogue.pick(option);
        });

        $("#game-container").append(this.dialogue);
        this.game.setHoveredObject(null);
    }

    hideDialogue() {
        if (this.dialogue != null) {
            this.dialogue.remove();
            this.dialogue = null;
        }
    }

    blockDialogueInterface() {
        this.unblockDialogueInterface();
        this.dialogueInterfaceBlocker = $(`
            <div class="blocker">
                <div class="dialogue-blocker"></div>
                <div class="menu-blocker"></div>
            </div>
        `);
        $("#game-container").append(this.dialogueInterfaceBlocker);
    }

    unblockDialogueInterface() {
        if (this.dialogueInterfaceBlocker != null) {
            this.dialogueInterfaceBlocker.remove();
            this.dialogueInterfaceBlocker = null;
        }
    }
}
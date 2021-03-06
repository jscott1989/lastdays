import Connection from "../networking/Connection.js";
import UIController from "../ui/UIController.js";
import Datastore from "./data/Datastore.js";
import Renderer from "../rendering/Renderer.js";
import LocalPlayer from "./LocalPlayer.js";
import Room from "./Room.js";
import ActionExecutor from "./ActionExecutor.js";
import WorldState from "./WorldState.js";


/**
 * Global object representing the overall game state.
 *
 * This also co-ordinates UI elements.
 */
export default class Game {
    constructor(localIdentity, debugMode) {
        this.localIdentity = localIdentity;

        this.renderer = new Renderer(this);
        this.renderer.clickEvents.subscribe(this._click.bind(this))
        this.uiController = new UIController(this);
        this.actionExecutor = new ActionExecutor(this);

        this.debugMode = debugMode;
        if (debugMode) {
            window.game = this;
        }

        // Game state
        // First is configuration and content types
        this.configuration = new Datastore();
        this.worldState = new WorldState(this);

        this.debugMessage("Starting in debug mode. Disable this before going live.");
    }

    /**
     * Open the connection to the server and begin the game.
     */
    start() {
        // Configuration should not change while in the game - so fetch it before
        // connecting
        this.fetchConfiguration()
            .then(this.renderer.initialise.bind(this.renderer))
            .then(() => {
                this.connection = new Connection(this);

                this.connection.connectObservable.subscribe(() => {this._connected()});
                this.connection.disconnectObservable.subscribe(() => {this._disconnected()});

                this.uiController.showModal("connecting", "Connecting");

                this.connection.messagesObservable.subscribe("refresh", (_, data) => {this._refresh(data)});
                this.connection.messagesObservable.subscribe("setWorldVariable", (_, data) => {this._setWorldVariable(data)});

                this.connection.connect(this.localIdentity);
        });
    }

    fetchConfiguration(callback) {
        this.uiController.showModal("loading", "Loading game configuration");
        const promise = new Promise((resolve, reject) => {
            fetch("/configuration").then(r => r.json()).then((configuration) => {
                this.debugMessage("Loaded configuration", configuration);
                this.configuration.setData(configuration);
                this.uiController.hideModal("loading");
                resolve();
            });
        });
        return promise;
    }

    _connected() {
        this.uiController.hideModal("connecting");
    }

    _disconnected() {
        this.uiController.showModal("connecting", "Disconnected. Attempting to restore connection");
    }

    _refresh(refreshContent) {
        // A refresh message has been received, all data should be cleared and the state
        // reset based on the content
        this.worldState.setData(refreshContent.world);
        this.loadPlayer(refreshContent.player);
        this.loadRoom(refreshContent.room);
        this.setHoveredObject(null);
        this.selectItem(null);
    }

    _setWorldVariable(content) {
        this.worldState.setLocal(content.key, content.value);
    }

    _click(subject, content) {
        this.renderer.playSound("mouseclick", false, 0.5);
        if (content.button == "RIGHT" && this.selectedItem != null) {
            this.selectItem(null);
            return;
        } else if (content.button == "RIGHT" && this.hoveredObject != null) {
            // Look at something
            this.actionExecutor.executeActions(this.hoveredObject.hoverable.getLookAt(), this.player, this.hoveredObject.hoverable);
            return;
        } else if (this.hoveredObject != null) {
            // We need to walk to the object and then interact
            const hoveredObject = this.hoveredObject;
            const selectedItem = this.selectedItem;

            let x;
            let y;
            let direction;
            const interactLocation = this.hoveredObject.hoverable.getInteractLocation();
            if (interactLocation != null) {
                [x, y, direction] = [interactLocation.x, interactLocation.y, interactLocation.direction];
            } else {
                [x, y] = this.room.getNearestWalkablePoint(content.x, content.y, this.player.sprite.x, this.player.sprite.y);
            }

            this.player.move(x, y, direction).then(() => {
                const interactKey = selectedItem || "interact";
                let actions = hoveredObject.hoverable.getInteract(interactKey);
                if (!actions) {
                    if (interactKey != "interact") {
                        actions = this.configuration.get("inventoryitems")[interactKey]["defaultInteract"];
                    }
                        
                    if (!actions) {
                        actions = hoveredObject.hoverable.getUnknownInteract();
                    }
                }
                this.actionExecutor.executeActions(actions, this.player, hoveredObject.hoverable);
            });

            this.selectItem(null);

            return;
        }
        
        const [x, y] = this.room.getNearestWalkablePoint(content.x, content.y, this.player.sprite.x, this.player.sprite.y);
        this.player.move(x, y);
    }

    loadPlayer(data) {
        if (this.player != null) {
            this.player.destroy();
        }

        this.player = new LocalPlayer(this, data)
        this.renderer.follow(this.player.getSprite());
        this.uiController.refreshInventory();
    }

    loadRoom(data) {
        if (this.room != null) {
            this.room.unload();
        }
        this.room = new Room(this, this.player.get("location").room);
        this.room.load(data);
        this.room.scale(this.player.sprite);
    }

    debugMessage() {
        if (this.debugMode) {
            if (console && console.debug) {
                console.debug.apply(console, arguments);
            } else if (console && console.log) {
                console.log.apply(console, arguments);
            } else {
                alert.apply(window, arguments);
            }
        }
    }

    getConfiguration() {
        return this.configuration;
    }

    getConnection() {
        return this.connection;
    }

    getPlayer() {
        return this.player;
    }

    getRoom() {
        return this.room;
    }

    getRenderer() {
        return this.renderer;
    }

    update() {
        if (this.room != null) {
            this.room.update();
        }
        if (this.player != null) {
            this.player.update();
        }
    }

    getElapsed() {
        return this.renderer.getElapsed();
    }

    getHoveredObject() {
        return this.hoveredObject;
    }

    setHoveredObject(hoveredObject) {
        this.hoveredObject = hoveredObject;
        this.renderer.updateCursor();
    }

    unsetHoveredObject(hoveredObject) {
        if (this.hoveredObject === hoveredObject) {
            this.setHoveredObject(null);
        }
    }

    selectItem(itemType) {
        this.selectedItem = itemType;
        this.uiController.refreshInventory();
    }

    getUiController() {
        return this.uiController;
    }

    getSelectedItem() {
        return this.selectedItem;
    }

    getActionExecutor() {
        return this.actionExecutor;
    }

    getWorldState() {
        return this.worldState;
    }

    getLocalFunction(functionName) {
        return new Promise((resolve, fail) => {
            if (!this.functions) {
                this.functions = new Map();
            }

            if (!this.functions.get(functionName)) {
                fetch("/static/" + this.configuration.get("functions")[functionName]).then(r => r.text()).then((functionCode) => {
                    var func = "";
                    eval("func =" + functionCode)
                    this.functions.set(functionName, func);
                    resolve(this.functions.get(functionName));
                });
            } else {
                resolve(this.functions.get(functionName));
            }
        });
    }

    callLocalFunction(functionName, player, context) {
        return new Promise((resolve, fail) => {
            this.getLocalFunction(functionName).then((func) => {
                func(player, context).then(resolve);
            });
        });
    }
}
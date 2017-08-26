import Connection from "../networking/Connection.js";
import UIController from "../ui/UIController.js";
import Datastore from "./data/Datastore.js";
import Renderer from "../rendering/Renderer.js";
import LocalPlayer from "./LocalPlayer.js";
import Room from "./Room.js";


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

        this.debugMode = debugMode;
        if (debugMode) {
            window.game = this;
        }

        // Game state
        // First is configuration and content types
        this.configuration = new Datastore();

        // Then world state

        // Room state

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
        console.log("DISC");
        this.uiController.showModal("connecting", "Disconnected. Attempting to restore connection");
    }

    _refresh(refreshContent) {
        // A refresh message has been received, all data should be cleared and the state
        // reset based on the content
        // TODO: World
        this.loadPlayer(refreshContent.player);
        this.loadRoom(refreshContent.room);
    }

    _click(subject, content) {
        const [x, y] = this.room.getNearestWalkablePoint(content.x, content.y, this.player.sprite.x, this.player.sprite.y);
        this.player.move(x, y);
    }

    loadPlayer(data) {
        if (this.player != null) {
            this.player.destroy();
        }

        this.player = new LocalPlayer(this, data)
        this.renderer.follow(this.player.getSprite());
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
}
import { WebSocketBridge } from "django-channels";
import Observable from "./Observable.js";

export default class Connection {
    constructor(game) {
        this.game = game;
        
        this.messagesObservable = new Observable("Messages", this.game);
        this.connectObservable = new Observable("Connect", this.game);
        this.disconnectObservable = new Observable("Disconnect", this.game);

        this._pingInterval = setInterval(this._sendPing.bind(this), 10000);
        this._connected = false;
    }

    _sendPing() {
        if (this.isConnected()) {
            this.send("ping");
        }
    }

    connect(localIdentity) {
        this.webSocketBridge = new WebSocketBridge();
        this.webSocketBridge.connect('/ws' + localIdentity.getId());
        this.game.debugMessage("Connecting");
        this.webSocketBridge.listen((message) => {
            this.game.debugMessage("Received Message", message.subject, message.content);
            this.messagesObservable.trigger(message.subject, message.content);
        });

        this.webSocketBridge.socket.addEventListener('open', () => {
            this.game.debugMessage("Connected");
            this._connected = true;
            this.connectObservable.trigger()
        });

        this.webSocketBridge.socket.addEventListener('close', () => {
            this.game.debugMessage("Disconnected");
            this._connected = false;
            this.disconnectObservable.trigger()
        });
    }

    send(subject, content) {
        this.game.debugMessage("Sending", subject, content);
        this.webSocketBridge.send({subject: subject, content: content});
    }

    isConnected() {
        return this._connected;
    }
}
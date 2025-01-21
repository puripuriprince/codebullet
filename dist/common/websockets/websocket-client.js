"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIRealtimeClient = void 0;
exports.formatState = formatState;
const ws_1 = require("ws");
// mqp: useful for debugging
const VERBOSE_LOGGING = false;
const TIMEOUT_MS = 30_000;
const RECONNECT_WAIT_MS = 5_000;
function formatState(state) {
    switch (state) {
        case ws_1.WebSocket.CONNECTING:
            return 'connecting';
        case ws_1.WebSocket.OPEN:
            return 'open';
        case ws_1.WebSocket.CLOSING:
            return 'closing';
        case ws_1.WebSocket.CLOSED:
            return 'closed';
        default:
            throw new Error('Invalid websocket state.');
    }
}
/** Client for the API websocket realtime server. Automatically manages reconnection
 * and resubscription on disconnect, and allows subscribers to get a callback
 * when something is broadcasted. */
class APIRealtimeClient {
    ws;
    url;
    // Callbacks subscribed to individual actions.
    subscribers;
    txid;
    // all txns that are in flight, with no ack/error/timeout
    txns;
    connectTimeout;
    heartbeat;
    hadError = false;
    onError;
    onReconnect;
    constructor(url, onError, onReconnect) {
        this.url = url;
        this.txid = 0;
        this.txns = new Map();
        this.subscribers = new Map();
        this.onError = onError;
        this.onReconnect = onReconnect;
    }
    get state() {
        return this.ws.readyState;
    }
    close() {
        this.ws.close(1000, 'Closed manually.');
        clearTimeout(this.connectTimeout);
    }
    connect() {
        // you may wish to refer to https://websockets.spec.whatwg.org/
        // in order to check the semantics of events etc.
        this.ws = new ws_1.WebSocket(this.url);
        this.ws.onmessage = (ev) => {
            if (this.hadError) {
                this.hadError = false;
                this.onReconnect();
            }
            this.receiveMessage(JSON.parse(ev.data));
        };
        this.ws.onerror = (ev) => {
            if (!this.hadError) {
                this.onError();
                this.hadError = true;
            }
            // this can fire without an onclose if this is the first time we ever try
            // to connect, so we need to turn on our reconnect in that case
            this.waitAndReconnect();
        };
        this.ws.onclose = (ev) => {
            // note that if the connection closes due to an error, onerror fires and then this
            if (VERBOSE_LOGGING) {
                console.info(`API websocket closed with code=${ev.code}: ${ev.reason}`);
            }
            clearInterval(this.heartbeat);
            // mqp: we might need to change how the txn stuff works if we ever want to
            // implement "wait until i am subscribed, and then do something" in a component.
            // right now it cannot be reliably used to detect that in the presence of reconnects
            for (const txn of Array.from(this.txns.values())) {
                clearTimeout(txn.timeout);
                txn.reject(new Error('Websocket was closed.'));
            }
            this.txns.clear();
            // 1000 is RFC code for normal on-purpose closure
            if (ev.code !== 1000) {
                this.waitAndReconnect();
            }
        };
        return new Promise((resolve) => {
            this.ws.onopen = (_ev) => {
                if (VERBOSE_LOGGING) {
                    console.info('API websocket opened.');
                }
                this.heartbeat = setInterval(async () => this.sendMessage('ping', {}).catch(() => { }), 30000);
                resolve();
            };
        });
    }
    waitAndReconnect() {
        if (this.connectTimeout == null) {
            this.connectTimeout = setTimeout(() => {
                this.connectTimeout = undefined;
                this.connect();
            }, RECONNECT_WAIT_MS);
        }
    }
    receiveMessage(msg) {
        if (VERBOSE_LOGGING) {
            console.info('< Incoming API websocket message: ', msg);
        }
        switch (msg.type) {
            case 'action': {
                const action = msg.data;
                const subscribers = this.subscribers.get(action.type) ?? [];
                for (const callback of subscribers) {
                    callback(action);
                }
                return;
            }
            case 'ack': {
                if (msg.txid != null) {
                    const txn = this.txns.get(msg.txid);
                    if (txn == null) {
                        // mqp: only reason this should happen is getting an ack after timeout
                        console.warn(`Websocket message with old txid=${msg.txid}.`);
                    }
                    else {
                        clearTimeout(txn.timeout);
                        if (msg.error != null) {
                            txn.reject(new Error(msg.error));
                        }
                        else {
                            txn.resolve();
                        }
                        this.txns.delete(msg.txid);
                    }
                }
                return;
            }
            default:
                console.warn(`Unknown API websocket message type received: ${msg}`);
        }
    }
    async sendMessage(type, data) {
        if (VERBOSE_LOGGING) {
            console.info(`> Outgoing API websocket ${type} message: `, data);
        }
        if (this.state === ws_1.WebSocket.OPEN) {
            return new Promise((resolve, reject) => {
                const txid = this.txid++;
                const timeout = setTimeout(() => {
                    this.txns.delete(txid);
                    reject(new Error(`Websocket message with txid ${txid} timed out.`));
                }, TIMEOUT_MS);
                this.txns.set(txid, { resolve, reject, timeout });
                this.ws.send(JSON.stringify({ type, txid, ...data }));
            });
        }
        else {
            // expected if components in the code try to subscribe or unsubscribe
            // while the socket is closed -- in this case we expect to get the state
            // fixed up in the websocket onopen handler when we reconnect
        }
    }
    sendAction(action) {
        return this.sendMessage('action', {
            data: action,
        });
    }
    subscribe(action, callback) {
        const currSubscribers = this.subscribers.get(action) ?? [];
        this.subscribers.set(action, [
            ...currSubscribers,
            callback,
        ]);
        return () => {
            const newSubscribers = currSubscribers.filter((cb) => cb !== callback);
            this.subscribers.set(action, newSubscribers);
        };
    }
}
exports.APIRealtimeClient = APIRealtimeClient;
//# sourceMappingURL=websocket-client.js.map
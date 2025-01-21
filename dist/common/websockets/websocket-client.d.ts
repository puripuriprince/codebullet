import { WebSocket } from 'ws';
import { ServerAction, ClientAction } from '../actions';
import { ClientMessage, ClientMessageType, ServerMessage } from './websocket-schema';
type ConnectingState = typeof WebSocket.CONNECTING;
type OpenState = typeof WebSocket.OPEN;
type ClosingState = typeof WebSocket.CLOSING;
type ClosedState = typeof WebSocket.CLOSED;
export type ReadyState = OpenState | ConnectingState | ClosedState | ClosingState;
export declare function formatState(state: ReadyState): "connecting" | "open" | "closing" | "closed";
type OutstandingTxn = {
    resolve: () => void;
    reject: (err: Error) => void;
    timeout?: any;
};
/** Client for the API websocket realtime server. Automatically manages reconnection
 * and resubscription on disconnect, and allows subscribers to get a callback
 * when something is broadcasted. */
export declare class APIRealtimeClient {
    ws: WebSocket;
    url: string;
    subscribers: Map<ServerAction['type'], ((action: ServerAction) => void)[]>;
    txid: number;
    txns: Map<number, OutstandingTxn>;
    connectTimeout?: any;
    heartbeat?: any;
    hadError: boolean;
    onError: () => void;
    onReconnect: () => void;
    constructor(url: string, onError: () => void, onReconnect: () => void);
    get state(): ReadyState;
    close(): void;
    connect(): Promise<void>;
    waitAndReconnect(): void;
    receiveMessage(msg: ServerMessage): void;
    sendMessage<T extends ClientMessageType>(type: T, data: Omit<ClientMessage<T>, 'type' | 'txid'>): Promise<void>;
    sendAction(action: ClientAction): Promise<void>;
    subscribe<T extends ServerAction['type']>(action: T, callback: (action: Extract<ServerAction, {
        type: T;
    }>) => void): () => void;
}
export {};

import EventEmitter from 'eventemitter3';
import IsNil from 'lodash-es/isNil';

import Identifier from './core/identifier';
import Log from '../core/logger';


const HeartbeatInterval = 30 * 1000;

export default class SpotifyEvents extends EventEmitter {
    constructor(api) {
        super();

        this.api = api;

        this.connectionId = null;
        this.deviceId = Identifier.generate(40);

        this._socket = null;

        // Bind to events
        this.on('socket.open', this.onSocketOpened.bind(this));
        this.on('socket.message', this.onSocketMessage.bind(this));
        this.on('socket.close', this.onSocketClosed.bind(this));
        this.on('socket.error', this.onSocketError.bind(this));

        this.on('connected', this.onConnected.bind(this));
        this.on('message', this.onMessage.bind(this));
    }

    connect() {
        if(!IsNil(this._socket)) {
            return Promise.resolve();
        }

        // Retrieve access points
        return this.resolve().then((url) => {
            // Create connection
            let socket = this._socket = new WebSocket(url);

            // Bind to socket events
            socket.addEventListener('open', () => this.emit('socket.open', url));
            socket.addEventListener('message', (message) => this.emit('socket.message', message));
            socket.addEventListener('close', ({ code }) => this.emit('socket.close', code));
            socket.addEventListener('error', (event) => this.emit('socket.error', event));

            return this;
        });
    }

    heartbeat() {
        return this.send({ type: 'ping' });
    }

    resolve() {
        // Retrieve access points
        return this.api.getAccessPoints().then(({ dealer }) =>
            // Retrieve authorization
            this.api.shim.authorization().then(({ token }) =>
                this._getUrl(dealer[0], token)
            )
        );

    }

    send(message) {
        if(IsNil(this._socket)) {
            throw new Error('Socket is not connected');
        }

        // Send message
        this._socket.send(JSON.stringify(message));
    }

    close() {
        if(IsNil(this._socket)) {
            return;
        }

        // Stop heartbeats
        if(!IsNil(this._heartbeatInterval)) {
            clearInterval(this._heartbeatInterval);
        }

        // Remove all listeners
        this._socket.removeAllListeners();

        // Reset state
        this._socket = null;
    }

    // region Event Handlers

    onConnected() {
        Log.debug(`Connected (connectionId: "${this.connectionId}", deviceId: "${this.deviceId}")`);

        // Create client subscription
        this.api.client.state.subscribe(this.connectionId, this.deviceId);

        // Subscribe to user notifications
        this.api.me.notifications.subscribe(this.connectionId);
    }

    onMessage(message) {
        if(IsNil(message) || IsNil(message.uri)) {
            return;
        }

        // Process connection message
        let match = /hm:\/\/pusher\/(?:[^]+)?\/connections\/([^]+)/.exec(message.uri);

        if(!IsNil(match)) {
            this.connectionId = decodeURIComponent(match[1]);

            // Emit "connected" event
            this.emit('connected');
        }
    }

    onSocketOpened() {
        Log.trace('Opened');

        // Start heartbeat interval
        this._heartbeatInterval = setInterval(
            this.heartbeat.bind(this),
            HeartbeatInterval
        );

        // Send heartbeat
        this.heartbeat();
    }

    onSocketMessage(event) {
        let message;

        // Decode message
        try {
            message = JSON.parse(event.data);
        } catch(e) {
            Log.warn('Unable to parse message:', event);
            return;
        }

        // Emit message
        this.emit('message', message);
    }

    onSocketClosed(code) {
        Log.debug(`Disconnected (code: ${code})`);
    }

    onSocketError(event) {
        Log.warn('Error', event);
    }

    // endregion

    // region Private Methods

    _getUrl(dealer, token) {
        let pos = dealer.indexOf(':');
        let url;

        if(pos >= 0) {
            let host = dealer.substring(0, pos);
            let port = dealer.substring(pos + 1);

            if(port === '443') {
                url = `wss://${host}`;
            } else {
                url = `ws://${host}`;
            }
        } else {
            url = `ws://${dealer}`;
        }

        // Add access token
        return `${url}?access_token=${token}`;
    }

    // endregion
}

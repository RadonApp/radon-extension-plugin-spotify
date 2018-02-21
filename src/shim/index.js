/* eslint-disable no-new */
import Cookie from 'js-cookie';
import EventEmitter from 'eventemitter3';
import IsNil from 'lodash-es/isNil';


export class ShimRequests extends EventEmitter {
    constructor() {
        super();

        // Ensure body exists
        if(IsNil(document.body)) {
            throw new Error('Body is not available');
        }

        // Bind to events
        this._bind('neon.request', (e) => this._onRequest(e));
    }

    _bind(event, callback) {
        try {
            document.body.addEventListener(event, callback);
        } catch(e) {
            console.error('Unable to bind to "%s"', event, e);
            return false;
        }

        console.debug('Bound to "%s"', event);
        return true;
    }

    _onRequest(e) {
        if(!e || !e.detail) {
            console.error('Invalid request received:', e);
            return;
        }

        // Decode request
        let request;

        try {
            request = JSON.parse(e.detail);
        } catch(err) {
            console.error('Unable to decode request: %s', err && err.message, err);
            return;
        }

        // Emit request
        this.emit(request.type, request.payload);
    }
}

export class Shim {
    constructor() {
        this.requests = new ShimRequests();
        this.requests.on('authorization', () => this.authorization());

        // Emit "ready" event
        this._emit('ready');
    }

    authorization() {
        this._emit('authorization', {
            token: Cookie.get('wp_access_token'),
            expiresAt: Cookie.get('wp_expiration'),
            expiresIn: Cookie.get('wp_expires_in')
        });
    }

    // region Private methods

    _emit(type, ...args) {
        console.log('emit', type, args);

        // Construct event
        let event = new CustomEvent('neon.event', {
            detail: JSON.stringify({
                type: type,
                args: args || []
            })
        });

        // Emit event on the document
        document.body.dispatchEvent(event);
    }

    // endregion
}

// Construct shim
(new Shim());

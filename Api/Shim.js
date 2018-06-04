import EventEmitter from 'eventemitter3';
import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';
import Runtime from 'wes/runtime';

import {createScript} from 'neon-extension-framework/Utilities/Script';

import Log from '../Core/Logger';


export class SpotifyShimEvents extends EventEmitter {
    constructor() {
        super();

        // Ensure body exists
        if(IsNil(document.body)) {
            throw new Error('Body is not available');
        }

        // Bind to events
        this._bind('neon.event', (e) => this._onEvent(e));
    }

    _bind(event, callback) {
        try {
            document.body.addEventListener(event, callback);
        } catch(e) {
            Log.error('Unable to bind to "%s"', event, e);
            return false;
        }

        Log.debug('Bound to "%s"', event);
        return true;
    }

    _onEvent(e) {
        if(!e || !e.detail) {
            Log.error('Invalid event received:', e);
            return;
        }

        // Decode event
        let event;

        try {
            event = JSON.parse(e.detail);
        } catch(err) {
            Log.error('Unable to decode event: %s', err && err.message, err);
            return;
        }

        Log.trace('Received event: %o', event);

        // Emit event
        this.emit(event.type, ...event.args);
    }
}

export class SpotifyShim extends EventEmitter {
    constructor() {
        super();

        this._events = null;

        this._injected = false;
        this._injecting = null;
    }

    get injected() {
        return this._injected;
    }

    get injecting() {
        return this._injecting;
    }

    inject(options) {
        if(this._injected) {
            return Promise.resolve();
        }

        // Inject shim into page (if not already injecting)
        if(IsNil(this._injecting)) {
            this._injecting = this._inject(options);
        }

        // Return current promise
        return this._injecting;
    }

    authorization() {
        return this.inject().then(() =>
            this._request('authorization')
        );
    }

    // region Private methods

    _await(type, options) {
        options = Merge({
            timeout: 10 * 1000  // 10 seconds
        }, options || {});

        // Create promise
        return new Promise((resolve, reject) => {
            let listener;

            // Create timeout callback
            let timeoutId = setTimeout(() => {
                if(!IsNil(listener)) {
                    this._events.removeListener(type, listener);
                }

                // Reject promise
                reject(new Error('Request timeout'));
            }, options.timeout);

            // Create listener callback
            listener = (event) => {
                clearTimeout(timeoutId);

                // Resolve promise
                resolve(event);
            };

            // Wait for event
            this._events.once(type, listener);
        });
    }

    _emit(type, ...args) {
        let request = new CustomEvent('neon.event', {
            detail: JSON.stringify({
                type: type,
                args: args || []
            })
        });

        // Emit event on the document
        document.body.dispatchEvent(request);
    }

    _request(type, request, options) {
        options = Merge({
            timeout: 10 * 1000  // 10 seconds
        }, options || {});

        // Create request event
        let requestEvent = new CustomEvent('neon.request', {
            detail: JSON.stringify({
                type: type,
                request
            })
        });

        // Create response promise
        return new Promise((resolve, reject) => {
            let listener;

            // Create timeout callback
            let timeoutId = setTimeout(() => {
                if(!IsNil(listener)) {
                    this._events.removeListener(type, listener);
                }

                // Reject promise
                reject(new Error('Request timeout'));
            }, options.timeout);

            // Create listener callback
            listener = (event) => {
                clearTimeout(timeoutId);

                // Resolve promise
                resolve(event);
            };

            // Wait for event
            this._events.once(type, listener);

            // Emit request on the document
            document.body.dispatchEvent(requestEvent);
        });
    }

    _inject(options) {
        options = Merge({
            timeout: 10 * 1000  // 10 seconds
        }, options || {});

        return new Promise((resolve, reject) => {
            let script = createScript(document, Runtime.getURL('/Modules/neon-extension-source-spotify/Shim.js'));

            // Create events interface
            this._events = new SpotifyShimEvents();

            // Wait for "ready" event
            this._await('ready', {
                timeout: options.timeout
            }).then(() => {
                // Update state
                this._injected = true;
                this._injecting = null;

                // Resolve promise
                resolve();
            }, () => {
                // Update state
                this._injected = false;
                this._injecting = null;

                // Reject promise
                reject(new Error('Inject timeout'));
            });

            // Insert script into page
            (document.head || document.documentElement).appendChild(script);
        });
    }

    // endregion
}

export default new SpotifyShim();

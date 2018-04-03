import EventEmitter from 'eventemitter3';
import ForEach from 'lodash-es/forEach';
import IsNil from 'lodash-es/isNil';
import URI from 'urijs';

import {fetch} from 'neon-extension-framework/core/fetch';

import SpotifyShim from '../shim';


export default class Interface extends EventEmitter {
    static eventPrefixes = [
        'https://api.spotify.com'
    ];

    static url = 'https://api.spotify.com';

    constructor() {
        super();

        this.interfaces = {};

        // Bind to events
        this.on('message', this.onMessage.bind(this));
    }

    get eventPrefixes() {
        return this.constructor.eventPrefixes;
    }

    get url() {
        return this.constructor.url;
    }

    get shim() {
        return SpotifyShim;
    }

    get(url, options) {
        return this.request('GET', url, options);
    }

    post(url, options) {
        return this.request('POST', url, options);
    }

    put(url, options) {
        return this.request('PUT', url, options);
    }

    request(method, url, options) {
        if(!this.shim.injected) {
            return Promise.reject(new Error(
                'Shim hasn\'t been injected yet'
            ));
        }

        // Set default options
        options = {
            authenticated: false,

            body: null,
            headers: {},
            params: {},

            ...(options || {})
        };

        // Add URL Base
        if(url.indexOf('://') < 0) {
            url = `${this.constructor.url}/${url}`;
        }

        // Add URL Parameters
        url = URI(url)
            .search(options.params)
            .toString();

        // Build request
        return Promise.resolve()
            // Add authentication token (if enabled)
            .then(() => {
                if(!options.authenticated) {
                    return Promise.resolve();
                }

                return SpotifyShim.authorization().then((authorization) => {
                    options.headers['Authorization'] = `Bearer ${authorization.token}`;
                });
            })
            // Send request
            .then(() => this.send(method, url, {
                headers: options.headers,
                body: !IsNil(options.body) ? JSON.stringify(options.body) : null
            }));
    }

    send(method, url, options) {
        return fetch(url, {
            method,
            ...options
        }).then((response) => {
            if(!response.ok) {
                return Promise.reject(new Error(
                    `Request error (code: ${response.status})`
                ));
            }

            return response.json().catch(() => null);
        });
    }

    // region Event Handlers

    onMessage(message) {
        if(IsNil(message) || IsNil(message.uri)) {
            return;
        }

        // Find matching event prefix
        ForEach(this.eventPrefixes, (prefix) => {
            if(message.uri.indexOf(prefix) !== 0) {
                return true;
            }

            // Emit events
            this.emit(`event.${message.uri.substring(prefix.length)}`, message);
            this.emit('event', message);

            // Exit iterator
            return false;
        });

        // Emit to children
        ForEach(this.interfaces, (intf) =>
            intf.emit('message', message)
        );
    }

    // endregion
}

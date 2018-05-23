import ForEach from 'lodash-es/forEach';
import Get from 'lodash-es/get';
import Merge from 'lodash-es/merge';

import Log from 'neon-extension-source-spotify/Core/Logger';

import Interface from '../Core/Interface';
import {changedPaths} from '../Core/Helpers';


export default class ClientStateInterface extends Interface {
    static eventPrefixes = [
        'https://api.spotify.com/connect-api/v2/state/',
        'https://gae-spclient.spotify.com/connect-api/v2/state/'
    ];

    static url = 'https://gae-spclient.spotify.com/connect-api/v2/state';

    constructor() {
        super();

        this.current = {};

        // Bind to events
        this.on('event.subscriptions', this.onSubscriptionEvent.bind(this));
    }

    get(path) {
        return Get(this.current, path);
    }

    subscribe(connectionId, deviceId, discovery = false) {
        return this.post('subscriptions', {
            authenticated: true,

            body: {
                'connection_id': connectionId,
                'name': deviceId,

                'enable_discovery': discovery
            }
        });
    }

    // region Event Handlers

    onSubscriptionEvent({payloads}) {
        if(payloads.length < 1) {
            return;
        }

        if(payloads.length > 1) {
            Log.warn('Multiple payloads returned', payloads);
        }

        let state = payloads[0];

        // Find changed paths
        let changed = changedPaths(this.current, state, {
            array: false
        });

        // Update current state
        this.current = Merge(this.current, state);

        // Emit change events
        ForEach(changed, (path) => {
            this.emit(path, Get(state, path));
        });
    }

    // endregion
}

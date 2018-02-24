import ForEach from 'lodash-es/forEach';
import Get from 'lodash-es/get';

import Interface from '../core/interface';
import {changedPaths} from '../core/helpers';


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
        this.on('event', this.onEvent.bind(this));
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

    onEvent({payloads}) {
        if(payloads.length < 1) {
            return;
        }

        if(payloads.length > 1) {
            console.warn('Multiple payloads returned', payloads);
        }

        let state = payloads[0];

        // Find changed paths
        let changed = changedPaths(this.current, state, {
            array: false
        });

        // Update current state
        this.current = state;

        // Emit change events
        ForEach(changed, (path) => {
            this.emit(path, Get(state, path));
        });
    }

    // endregion
}

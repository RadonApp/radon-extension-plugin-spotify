import ForEach from 'lodash-es/forEach';
import Get from 'lodash-es/get';
import Merge from 'lodash-es/merge';

import Log from '../../Core/Logger';
import Interface from '../Core/Interface';
import {changedPaths} from '../Core/Helpers';


export default class ClientStateInterface extends Interface {
    static eventPrefixes = [
        'hm://connect-state/v1/'
    ];

    static url = 'https://spclient.wg.spotify.com/connect-state/v1';

    constructor(options) {
        super(options);

        this.current = {};

        // Bind to events
        this.on('event.cluster', this.onClusterEvent.bind(this));
    }

    get(path) {
        return Get(this.current, path);
    }

    subscribe(connectionId, deviceId, discovery = false) {
        return this.put(`devices/hobs_${deviceId}`, {
            authenticated: true,

            body: {
                'device': {
                    'device_info': {
                        'capabilities': {
                            'can_be_player': false,
                            'hidden': true
                        }
                    }
                },

                'member_type': 'CONNECT_STATE'
            },

            headers: {
                'X-Spotify-Connection-Id': connectionId
            }
        });
    }

    // region Event Handlers

    onClusterEvent({ payloads }) {
        if(payloads.length < 1) {
            return;
        }

        if(payloads.length > 1) {
            Log.warn('Multiple payloads returned', payloads);
        }

        if(!payloads[0] || !payloads[0].cluster) {
            Log.warn('Ignoring invalid cluster event');
            return;
        }

        let state = payloads[0].cluster;

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

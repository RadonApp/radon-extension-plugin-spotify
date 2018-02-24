import IsNil from 'lodash-es/isNil';
import IsString from 'lodash-es/isString';

import Interface from '../core/interface';


export default class AlbumsInterface extends Interface {
    fetch(id, options) {
        if(IsNil(id) || !IsString(id)) {
            return Promise.reject(new Error(
                'Invalid identifier (expected string)'
            ));
        }

        // Convert Album URI to ID
        if(id.indexOf('spotify:') === 0) {
            let parts = id.split(':');

            if(parts[1] !== 'album') {
                return Promise.reject(new Error(
                    `Invalid Album URI (found "${parts[1]}" URI))`
                ));
            }

            id = parts[2];
        }

        // Validate identifier length
        if(id.length !== 22) {
            return Promise.reject(new Error(
                'Invalid identifier (expected Album URI or ID)'
            ));
        }

        // Set default options
        options = {
            market: 'from_token',

            ...(options || {})
        };

        // Request album details
        return this.get(`v1/albums/${id}`, {
            authenticated: true,

            params: {
                market: options.market
            }
        });
    }
}

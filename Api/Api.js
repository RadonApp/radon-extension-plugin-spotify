import Interface from './Core/Interface';
import Log from '../Core/Logger';
import AlbumsInterface from './Albums';
import ClientInterface from './Client';
import SpotifyEvents from './Events';
import UserInterface from './User';


export default class SpotifyApi extends Interface {
    constructor() {
        super();

        this._token = null;

        // Events
        this.events = new SpotifyEvents(this);
        this.events.on('message', this.onMessage.bind(this));

        // Interfaces
        let options = {
            getAccessToken: this.getAccessToken.bind(this)
        };

        this.interfaces = {
            albums: new AlbumsInterface(options),
            client: new ClientInterface(options),
            me: new UserInterface('me', options)
        };
    }

    get albums() {
        return this.interfaces.albums;
    }

    get client() {
        return this.interfaces.client;
    }

    get me() {
        return this.interfaces.me;
    }

    getAccessPoints(types = ['dealer', 'spclient']) {
        return this.get('https://apresolve.spotify.com/', {
            params: {
                type: types
            }
        });
    }

    // TODO Check access token validity
    getAccessToken() {
        if(this._token) {
            return Promise.resolve(this._token);
        }

        // Refresh access token
        return this.refreshAccessToken().then((token) => {
            Log.info('Refreshed access token');

            // Store access token
            this._token = token;

            return token;
        });
    }

    refreshAccessToken(reason = 'transport', productType = 'web_player') {
        return this.get('https://open.spotify.com/get_access_token', {
            params: {
                reason: reason,
                productType: productType
            }
        });
    }
}

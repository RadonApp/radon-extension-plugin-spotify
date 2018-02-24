import Interface from './core/interface';
import AlbumsInterface from './albums';
import ClientInterface from './client';
import SpotifyEvents from './events';
import UserInterface from './user';


export class SpotifyApi extends Interface {
    constructor() {
        super();

        this.events = new SpotifyEvents(this);
        this.events.on('message', this.onMessage.bind(this));

        // Create children
        this.interfaces = {
            albums: new AlbumsInterface(),
            client: new ClientInterface(),
            me: new UserInterface('me')
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
}

export default new SpotifyApi();

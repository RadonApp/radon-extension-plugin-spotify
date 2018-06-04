import Interface from './Core/Interface';
import AlbumsInterface from './Albums';
import ClientInterface from './Client';
import SpotifyEvents from './Events';
import UserInterface from './User';


export default class SpotifyApi extends Interface {
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

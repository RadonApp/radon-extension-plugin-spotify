import ClientStateInterface from './ClientState';
import Interface from '../Core/Interface';


export default class ClientInterface extends Interface {
    static url = 'https://gae-spclient.spotify.com/connect-api';

    constructor(options) {
        super(options);

        // Create children
        this.interfaces = {
            state: new ClientStateInterface(options)
        };
    }

    get state() {
        return this.interfaces.state;
    }
}

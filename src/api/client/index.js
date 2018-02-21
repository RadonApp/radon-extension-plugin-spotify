import ClientStateInterface from './state';
import Interface from '../core/interface';


export default class ClientInterface extends Interface {
    static url = 'https://gae-spclient.spotify.com/connect-api';

    constructor() {
        super();

        // Create children
        this.interfaces = {
            state: new ClientStateInterface()
        };
    }

    get state() {
        return this.interfaces.state;
    }
}

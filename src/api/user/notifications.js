import Interface from '../core/interface';


export default class UserNotificationsInterface extends Interface {
    constructor(username) {
        super();

        this.username = username;
    }

    subscribe(connectionId, channel = 'user') {
        return this.put(`v1/${this.username}/notifications/${channel}`, {
            authenticated: true,

            params: {
                'connection_id': connectionId
            }
        });
    }
}

import Interface from '../Core/Interface';


export default class UserNotificationsInterface extends Interface {
    constructor(username, options) {
        super(options);

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

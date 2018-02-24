import Interface from '../core/interface';
import UserNotificationsInterface from './notifications';


export default class UserInterface extends Interface {
    constructor(username) {
        super();

        this.username = username;

        // Create children
        this.interfaces = {
            notifications: new UserNotificationsInterface(username)
        };
    }

    get notifications() {
        return this.interfaces.notifications;
    }

    fetch() {
        return this.get(`v1/${this.username}`, {
            authenticated: true
        });
    }
}

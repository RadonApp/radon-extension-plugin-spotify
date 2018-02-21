import {Logger} from 'neon-extension-framework/core/logger';

import Plugin from './plugin';


export default Logger.create(Plugin.connectionId, () =>
    Plugin.preferences.context('debugging')
);

import {Page, EnableOption} from 'neon-extension-framework/services/configuration/models';
import Plugin from 'neon-extension-source-spotify/core/plugin';


export default [
    new Page(Plugin, null, [
        new EnableOption(Plugin, 'enabled', {
            default: false,

            type: 'plugin',
            permissions: true,
            contentScripts: true
        })
    ])
];

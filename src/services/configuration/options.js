import {Page, EnableOption} from 'neon-extension-framework/services/configuration/models';
import Plugin from 'neon-extension-source-spotify/core/plugin';


export default [
    new Page(Plugin, null, Plugin.title, [
        new EnableOption(Plugin, 'enabled', 'Enabled', {
            default: false,

            type: 'plugin',
            permissions: true,
            contentScripts: true
        })
    ])
];

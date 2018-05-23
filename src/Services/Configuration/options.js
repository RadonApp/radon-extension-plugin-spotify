import {Page} from 'neon-extension-framework/Models/Configuration';
import {EnableOption} from 'neon-extension-framework/Models/Configuration/Options';
import Plugin from 'neon-extension-source-spotify/Core/Plugin';


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

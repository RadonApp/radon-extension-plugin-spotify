import {Page} from '@radon-extension/framework/Models/Configuration';
import {EnableOption} from '@radon-extension/framework/Models/Configuration/Options';

import Plugin from '../../Core/Plugin';


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

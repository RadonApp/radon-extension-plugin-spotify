import ConfigurationService from 'neon-extension-framework/Services/Configuration';
import Plugin from 'neon-extension-source-spotify/Core/Plugin';
import Registry from 'neon-extension-framework/Core/Registry';

import Options from './options';


export class SpotifyConfigurationService extends ConfigurationService {
    constructor() {
        super(Plugin, Options);
    }
}

// Register service
Registry.registerService(new SpotifyConfigurationService());

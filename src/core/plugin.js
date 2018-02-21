import SourcePlugin from 'neon-extension-framework/base/plugins/source';


export class SpotifyPlugin extends SourcePlugin {
    constructor() {
        super('spotify');
    }
}

export default new SpotifyPlugin();

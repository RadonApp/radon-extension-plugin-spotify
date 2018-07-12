import SourcePlugin from '@radon-extension/framework/Models/Plugin/Source';


export class SpotifyPlugin extends SourcePlugin {
    constructor() {
        super('spotify');
    }
}

export default new SpotifyPlugin();

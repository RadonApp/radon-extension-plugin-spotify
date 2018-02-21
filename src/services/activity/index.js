import ActivityService from 'neon-extension-framework/services/source/activity';
import Log from 'neon-extension-source-spotify/core/logger';
import Plugin from 'neon-extension-source-spotify/core/plugin';
import Registry from 'neon-extension-framework/core/registry';
import SpotifyApi from 'neon-extension-source-spotify/api';
import {awaitPage} from 'neon-extension-source-spotify/core/helpers';


export class SpotifyActivityService extends ActivityService {
    constructor() {
        super(Plugin);

        // Bind to events
        SpotifyApi.client.state.on('player_state', this.onPlayerStateChanged.bind(this));
        SpotifyApi.client.state.on('player_state.is_playing', this.onPlayingChanged.bind(this));
        SpotifyApi.client.state.on('player_state.is_paused', this.onPausedChanged.bind(this));
        SpotifyApi.client.state.on('player_state.track.uri', this.onTrackChanged.bind(this));
    }

    initialize() {
        super.initialize();

        // Bind activity service (once the page has loaded)
        awaitPage().then(() => this.bind());
    }

    bind() {
        return Promise.resolve()
            // Inject shim
            .then(() => SpotifyApi.shim.inject().catch((err) => {
                Log.error('Unable to inject shim: %s', err.message, err);
                return Promise.reject(err);
            }))
            // Connect to events websocket
            .then(() => SpotifyApi.events.connect().catch((err) => {
                Log.error('Unable to connect to the events websocket: %s', err.message, err);
                return Promise.reject(err);
            }));
    }

    // region Event Handlers

    onPlayingChanged(playing) {
        console.log(`Playing changed to ${playing}`);
    }

    onPausedChanged(paused) {
        console.log(`Paused changed to ${paused}`);
    }

    onPlayerStateChanged(player) {
        console.log(
            'Player state changed (' +
                `timestamp: ${player['timestamp']}, ` +
                `position_as_of_timestamp: ${player['position_as_of_timestamp']}` +
            ')'
        );
    }

    onTrackChanged(uri) {
        console.log(`Track changed to "${uri}"`);
    }

    // endregion
}

// Register service
Registry.registerService(new SpotifyActivityService());

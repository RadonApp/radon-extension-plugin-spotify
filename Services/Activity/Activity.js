import Find from 'lodash-es/find';
import Get from 'lodash-es/get';
import IsNil from 'lodash-es/isNil';
import {Cache} from 'memory-cache';

import ActivityService, {ActivityEngine} from 'neon-extension-framework/Services/Source/Activity';
import Registry from 'neon-extension-framework/Core/Registry';
import {Artist} from 'neon-extension-framework/Models/Metadata/Music';
import {cleanTitle} from 'neon-extension-framework/Utilities/Metadata';

import Log from '../../Core/Logger';
import Plugin from '../../Core/Plugin';
import SpotifyApi from '../../Api';
import {awaitPage} from '../../Core/Helpers';
import {PlayerMonitor} from './Player';


const AlbumCacheExpiry = 3 * 60 * 60 * 1000;  // 3 hours

export class SpotifyActivityService extends ActivityService {
    constructor() {
        super(Plugin);

        this.engine = null;
        this.monitor = null;

        this.albums = new Cache();
    }

    initialize() {
        super.initialize();

        // Construct activity engine
        this.engine = new ActivityEngine(this.plugin, {
            fetchMetadata: this.fetchMetadata.bind(this),

            isEnabled: () => true
        });

        // Bind activity service (once the page has loaded)
        awaitPage().then(() => this.bind());
    }

    bind() {
        // Initialize player monitor
        this.monitor = new PlayerMonitor();

        // Bind activity engine to monitor
        this.engine.bind(this.monitor);

        // Inject shim into page
        return SpotifyApi.shim.inject().then(() => {
            // Bind player monitor to page
            return this.monitor.bind(document);
        }, (err) => {
            Log.error('Unable to inject shim: %s', err.message, err);
            return Promise.reject(err);
        });
    }

    fetchMetadata(item) {
        let albumUri = Get(item.album.keys, [this.plugin.id, 'uri']);

        if(IsNil(albumUri)) {
            return Promise.resolve(item);
        }

        let fetchedAt = Date.now();

        // Update item `fetchedAt` timestamp
        item.update(Plugin.id, { fetchedAt });

        // Fetch album metadata
        Log.info('Fetching metadata for album "%s" (track: %o)', albumUri, item);

        return this.fetchAlbum(albumUri).then((album) => {
            let artist = album.artists[0];

            // Update album
            item.album.update(this.plugin.id, {
                // Metadata
                title: album.name,

                // Timestamps
                fetchedAt
            });

            // Create album artist
            if(IsNil(item.album.artist)) {
                item.album.artist = new Artist();
            }

            item.album.artist.update(this.plugin.id, {
                keys: {
                    uri: artist.uri
                },

                // Metadata
                title: artist.name,

                // Timestamps
                fetchedAt
            });

            // Clean item title (for matching)
            let title = this._cleanTitle(item.title);

            // Find matching track
            let track = Find(album.tracks.items, (track) => this._cleanTitle(track.name) === title);

            if(IsNil(track)) {
                Log.debug('Unable to find track "%s" (%s) in album: %o', item.title, title, album.tracks.items);

                // Reject promise
                return Promise.reject(new Error(
                    'Unable to find track "' + item.title + '" in album "' + item.album.title + '"'
                ));
            }

            // Update item
            item.update(this.plugin.id, {
                keys: {
                    uri: track.uri
                },

                // Metadata
                number: track['track_number'],
                duration: track['duration_ms']
            });

            return item;
        });
    }

    fetchAlbum(albumUri) {
        if(IsNil(albumUri) || albumUri.length <= 0) {
            return Promise.reject();
        }

        // Retrieve album from cache
        let album = this.albums.get(albumUri);

        if(!IsNil(album)) {
            return Promise.resolve(album);
        }

        // Fetch album
        return SpotifyApi.albums.fetch(albumUri).then((album) => {
            // Store album in cache (which is automatically removed in `AlbumCacheExpiry`)
            this.albums.put(albumUri, album, AlbumCacheExpiry);

            // Return album
            return album;
        });
    }

    _cleanTitle(title) {
        return cleanTitle(title).replace(/\s/g, '');
    }
}

// Register service
Registry.registerService(new SpotifyActivityService());

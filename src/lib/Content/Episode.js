import { Base, EPISODE_TYPE } from './Base.js';

export class Episode extends Base {

    constructor(name, overview, internal_id, episodeNumber, backdrop_path) {
        super(EPISODE_TYPE);

        this.title = name;
        this.description = overview;
        this.id = internal_id;
        this.episodeNumber = episodeNumber;
        this.backdrop = backdrop_path;
        this.watchtime = 0;
        this.runTime = 0;
    }

    getTitle() {
        return `Episode ${this.episodeNumber}`;
    }
}
import { Base, SHOW_TYPE } from './Base.js';

export class Season extends Base {

    constructor(name, season_id, poster_path, backdrop_path) {
        super(SHOW_TYPE);

        this.title = name;
        this.id = season_id;
        this.poster = poster_path;
        this.backdrop = backdrop_path;
        this.watchtime = 0;
        this.runTime = 0;
    }
}
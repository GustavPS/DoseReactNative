import { Base, EPISODE_TYPE } from './Base.js';

export class Episode extends Base {

  constructor(name, overview, internal_id, show_id, episodeNumber, season_number, backdrop_path, showTitle = '') {
    super(EPISODE_TYPE);

    this.title = name;
    this.description = overview;
    this.id = internal_id;
    this.show_id = show_id;
    this.episodeNumber = episodeNumber;
    this.season_number = season_number;
    this.backdrop = backdrop_path;
    this.watchtime = 0;
    this.runTime = 0;
    this.includeSeasonInTitle = false;
    this.poster = null; // TODO: set default poster
    this.showTitle = showTitle;
  }

  setPoster(poster) {
    this.poster = poster;
  }

  setIncludeSeasonInTitle(include) {
    this.includeSeasonInTitle = include;
  }

  setWatchtime(watchtime) {
    this.watchtime = watchtime;
  }

  setRuntime(runTime) {
    this.runTime = runTime;
  }

  getTitle() {
    if (this.includeSeasonInTitle) {
      return `Season ${this.season_number} Episode ${this.episodeNumber}`;
    } else {
      return `Episode ${this.episodeNumber}`;
    }
  }
}
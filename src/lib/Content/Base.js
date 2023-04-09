
export class Base {
  #baseImagePath = "https://image.tmdb.org/t/p";

  constructor(type) {
    this.type = type;
  }

  getPosterPath(size) {
    return `${this.#baseImagePath}/${size}${this.poster}`;
  }

  getBackdropPath(size) {
    return `${this.#baseImagePath}/${size}${this.backdrop}`;
  }

  getLogoPath(size) {
    if (this.logo && this.logo != "no_image") {
      return `${this.#baseImagePath}/${size}${this.logo}`;
    } else {
      return false;
    }
  }

  getTitle() {
    return this.title;
  }

  getDescription() {
    return this.description;
  }

  getSource(contentServerUrl, token, languageId) {
    const type = this.isMovie() ? 'movie' : 'serie';
    return `${contentServerUrl}/api/video/${this.id}/hls/master?type=${type}&audioStream=${languageId}&token=${token}`;
  }

  getDirectplaySource(contentServerUrl, token, _languageId) {
    const type = this.isMovie() ? 'movie' : 'serie';
    return `${contentServerUrl}/api/video/${this.id}/directplay?type=${type}&token=${token}`;
  }

  getSubtitleUrl(contentServerUrl, token, subtitleId) {
    const type = this.isMovie() ? 'movie' : 'serie';
    return `${contentServerUrl}/api/subtitles/get?type=${type}&id=${subtitleId}&token=${token}`;
  }

  isMovie() {
    return this.type == MOVIE_TYPE;
  }

  isShow() {
    return this.type == SHOW_TYPE;
  }

  isEpisode() {
    return this.type == EPISODE_TYPE;
  }

  setActiveImages() {
    for (const image of this.images) {
      if (image.active) {
        if (image.type == 'BACKDROP') {
          this.backdrop = image.path;
        } else if (image.type == 'POSTER') {
          this.poster = image.path;
        } else if (image.type == 'LOGO') {
          this.logo = image.path;
        }
      }
    }
  }
}

export const MOVIE_TYPE = "movie";
export const SHOW_TYPE = "serie";
export const SEASON_TYPE = "season";
export const EPISODE_TYPE = "episode";
import { Base, MOVIE_TYPE } from './Base.js';

export class Movie extends Base {

  constructor(title, description, id, images, trailer, watchtime = 0, runTime = 0) {
    super(MOVIE_TYPE);

    this.title = title;
    this.description = description;
    this.id = id;
    this.images = images;
    this.watchtime = watchtime;
    this.runTime = runTime;
    this.setActiveImages();
    this.haveTrailer = trailer != null;
  }

  // Should this really be here? Might be problems with token getting old
  setTrailer(url, token) {
    this.trailer = `${url}/api/trailer/${this.id}?type=MOVIE&token=${token}`;
  }
}
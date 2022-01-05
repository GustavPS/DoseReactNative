import { Base, SHOW_TYPE } from './Base.js';

export class Show extends Base {

    constructor(title, description, id, images) {
        super(SHOW_TYPE);

        this.title = title;
        this.description = description;
        this.id = id;
        this.images = images;
        this.watchtime = 0;
        this.runTime = 0;
        this.setActiveImages();
    }

    setNextEpisode(episodeNumber, episodeId, seasonNumber) {
        this.nextEpisode = {
            episodeNumber: episodeNumber,
            episodeId: episodeId,
            seasonNumber: seasonNumber,
        }
    }

    setResumeEpisode(episodeNumber, episodeId, seasonNumber, time) {
        this.resumeEpisode = {
            episodeNumber: episodeNumber,
            episodeId: episodeId,
            seasonNumber: seasonNumber,
            watchtime: time
        }
    }

    canResumeEpisode() {
        return this.resumeEpisode != null;
    }

    canPlayNextEpisode() {
        return this.nextEpisode != null;
    }

    getResumeEpisodeName() {
        console.log(`${this.resumeEpisode.seasonNumber}x${this.resumeEpisode.episodeNumber} hello`)
        return `S${this.resumeEpisode.seasonNumber}E${this.resumeEpisode.episodeNumber}`;
    }

    getResumeEpisodeTime() {
        return this.resumeEpisode.watchtime;
    }

    getNextEpisodeName() {
        return `S${this.nextEpisode.seasonNumber}E${this.nextEpisode.episodeNumber}`;
    }

}

export class Movie {
    #baseImagePath = "https://image.tmdb.org/t/p";

    constructor(title, description, id, images, watchtime = 0, runTime = 0) {
        this.title = title;
        this.description = description;
        this.id = id;
        this.images = images;
        this.watchtime = watchtime;
        this.runTime = runTime;

        this.setActiveImages();
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
        return `${contentServerUrl}/api/video/${this.id}/hls/master?type=movie&audioStream=${languageId}&token=${token}`;
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
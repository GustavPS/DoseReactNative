
export class Movie {
    #baseImagePath = "https://image.tmdb.org/t/p";

    constructor(title, description, id, images) {
        this.title = title;
        this.description = description;
        this.id = id;
        this.images = images;

        this.setActiveImages();
    }

    getPosterPath(size) {
        return `${this.#baseImagePath}/${size}${this.poster}`;
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
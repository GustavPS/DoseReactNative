import * as SecureStore from 'expo-secure-store';
import { Movie } from './Content/Movie';
import Token from './Token';

export class ContentServer {
    constructor() {
        this.token = new Token();
    }

    /**
     * Initialize the class, this must be called before any other calls that uses
     * the content server API.
     * 
     * @returns 
     */
    async initialize() {
        this.url = await SecureStore.getItemAsync('contentServerUrl');
        return true;
    }

    async getUrl() {
        if (this.url == undefined) {
            this.url = await SecureStore.getItemAsync('contentServerUrl');
        }
        return this.url;
    }

    /**
     * Save the selected content server
     * 
     * @param {string} accessToken - The access token to save
     * @param {int} validTo - The timestamp when the token expires
     * @param {string} id - The id of the server to save the token for
     * @param {string} ip - The ip of the server to save the token for
     * @returns 
     */
    saveContentServer(accessToken, validTo, id, ip) {
        return new Promise(resolve => {
            this.token.saveContentToken(accessToken, validTo);
            Promise.all([
                SecureStore.setItemAsync('contentServerUrl', ip),
                SecureStore.setItemAsync('contentServerId', id)
            ]).then(() => {
                resolve();
            });
        });
    }

    /**
     * Get the access token for the content server
     * 
     * @returns 
     */
    getAccessToken() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                resolve(token);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Get a list of the current popular movies
     * 
     * @returns 
     */
    getPopularMovies() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/movies/list/popular?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        const movies = data.result;
                        const returnData = [];
                        for (const movie of movies) {
                            returnData.push(
                                new Movie(movie.title, movie.overview, movie.id, movie.images)
                            );
                        }
                        resolve(returnData);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    /**
     * Get a list of the current movie watchlist
     * 
     * @returns 
     */
    getMovieWatchlist() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/movies/list/watchlist?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        const movies = data.result;
                        const returnData = [];
                        for (const movie of movies) {
                            returnData.push(
                                new Movie(movie.title, movie.overview, movie.id, movie.images)
                            );
                        }
                        resolve(returnData);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                })
            });
        });
    }

    /**
     * Get a list of all genres
     * 
     * @returns 
     */
    getGenres() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/genre/list?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        resolve(data.genres);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    /**
     * Get a list of movies by genre
     * 
     * @param {string} genre - The genre to get movies for 
     * @returns 
     */
    getMoviesByGenre(genre) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/movies/list/genre/${genre}?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        const movies = data.result;
                        const returnData = [];
                        for (const movie of movies) {
                            returnData.push(
                                new Movie(movie.title, movie.overview, movie.id, movie.images)
                            );
                        }
                        resolve(returnData);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    /**
     * Get the available languages for a movie
     * 
     * @param {Movie} movie - The movie to get the languages for
     * @returns 
     */
    getMovieLanguages(movie) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/video/${movie.id}/getLanguages?type=movie&token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        resolve(data);

                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    /**
     * Get a movies metadata
     * 
     * @param {Movie} movie - The movie to get the metadata for
     * @returns 
     */
    getMovieMetadata(movie) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/movies/${movie.id}?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        resolve(data.result);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    /**
     * Get the recommended movies for a spciecific movie
     * 
     * @param {Movie} movie - The movie to get the recommendations for
     * @returns 
     */
    getRecommendedMovies(movie) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/movies/${movie.id}/getRecommended?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        const movies = data.movies;
                        const returnData = [];
                        for (const movie of movies) {
                            returnData.push(
                                new Movie(movie.title, movie.overview, movie.id, movie.images)
                            );
                        }
                        resolve(returnData);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    requestAccessToServer(ip) {
        return new Promise((resolve, reject) => {
            this.token.validateMainToken().then(token => {
                const url = `${ip}/api/auth/validate`
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: token
                    })
                }).then(result => {
                    result.json().then(data => {
                        resolve(data);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

}
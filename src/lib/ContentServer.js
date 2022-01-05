import * as SecureStore from 'expo-secure-store';
import { Episode } from './Content/Episode';
import { Movie } from './Content/Movie';
import { Show } from './Content/Show';
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
     * Get a list of TV shows by genre
     * 
     * @param {string} genre - The genre to get shows for
     * @returns 
     */
    getShowsByGenre(genre) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/series/list/genre/${genre}?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        const shows = data.result;
                        const returnData = [];
                        for (const show of shows) {
                            const showToAdd = new Show(show.title, show.overview, show.id, show.images);
                            if (show.nextEpisodeForUser != null) {
                                showToAdd.setNextEpisode(show.nextEpisodeForUser.episode, show.nextEpisodeForUser.episode_id, show.nextEpisodeForUser.season_number);
                            }
                            if (show.episodeProgress != null) {
                                showToAdd.setResumeEpisode(show.episodeProgress.episode, show.episodeProgress.episode_id, show.episodeProgress.season_number, show.episodeProgress.time);
                            }
                            returnData.push(showToAdd);
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
     * Get the available languages for a content
     * 
     * @param {Base} content - The content to get the languages for
     * @returns 
     */
    getContentLanguages(content) {
        return new Promise((resolve, reject) => {
            const type = content.isMovie() ? 'movie' : 'serie';
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/video/${content.id}/getLanguages?type=${type}&token=${token}`;
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

    /**
     * Get the newly added movies
     * 
     * @returns 
     */
    getNewlyAddedMovies() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/movies/list/?orderby=added_date&token=${token}`;
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
     * Get the newly released movies
     * 
     * @returns 
     */
    getNewlyReleasedMovies() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/movies/list/?orderby=release_date&token=${token}`;
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
     * Get the ongoing movies for the user
     * 
     * @returns 
     */
    getOngoingMovies() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/movies/list/ongoing?token=${token}`;
                console.log(url)
                fetch(url).then(result => {
                    result.json().then(data => {
                        const movies = data.result;
                        const returnData = [];
                        for (const movie of movies) {
                            returnData.push(
                                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.watchtime, movie.runtime)
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
     * Get the newly added TV Shows
     * 
     * @returns 
     */
    getNewlyAddedShows() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/series/list/?orderby=added_date&token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        const shows = data.result;
                        const returnData = [];
                        for (const show of shows) {
                            const showToAdd = new Show(show.title, show.overview, show.id, show.images);
                            if (show.nextEpisodeForUser != null) {
                                showToAdd.setNextEpisode(show.nextEpisodeForUser.episode, show.nextEpisodeForUser.episode_id, show.nextEpisodeForUser.season_number);
                            }
                            if (show.episodeProgress != null) {
                                showToAdd.setResumeEpisode(show.episodeProgress.episode, show.episodeProgress.episode_id, show.episodeProgress.season_number, show.episodeProgress.time);
                            }
                            returnData.push(showToAdd);
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
     * Get the show metadata
     * 
     * @param {Show} show - The show to get the metadata for
     * @returns 
     */
    getShowMetadata(show) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/series/${show.id}?token=${token}`;
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

    getSeasonMetadata(season, show) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/series/${show.id}/season/${season.id}?token=${token}`;
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

    getEpisodeMetadata(episodeNumber, showId, seasonNumber) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/series/${showId}/season/${seasonNumber}/episode/${episodeNumber}?token=${token}`;
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

    getOngoingEpisodes() {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/series/list/ongoing?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        const ongoingEpisodes = data.ongoing;
                        const upcomingEpisodes = data.upcoming;
                        const returnData = [];
                        for (const episode of ongoingEpisodes) {
                            let backdrop, poster;
                            for (const image of episode.images) {
                                if (image.type === "POSTER" && image.active) {
                                    poster = image.path;
                                } else if (image.type === "BACKDROP" && image.active) {
                                    backdrop = image.path;
                                }
                            }
                            const episodeToAdd = new Episode(episode.name, episode.overview, episode.internalepisodeid, episode.episode_number, episode.season_number, backdrop);
                            episodeToAdd.setIncludeSeasonInTitle(true);
                            episodeToAdd.setWatchtime(episode.time_watched);
                            episodeToAdd.setRuntime(episode.total_time);
                            returnData.push(episodeToAdd);
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
     * Get the transcoding group id from the server
     * 
     * @param {Base} content - The content to get the transcoding group id for 
     * @returns 
     */
    getTranscodingGroupId(content) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/video/${content.id}/hls/getTranscodingGroupId?token=${token}`;
                fetch(url).then(result => {
                    result.json().then(data => {
                        if (data.found) {
                            resolve(data.group);
                        } else {
                            reject("Not found");
                        }
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
     * Update the watchtime for a movie
     * 
     * @param {Base} content - The content to update the watchtime for 
     * @param {*} time  - The time to update the watchtime to
     * @returns 
     */
    updateWatchtime(content, groupId, time, videoDuration) {
        return new Promise((resolve, reject) => {
            const type = content.isMovie() ? "movie" : "serie";
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/video/${content.id}/currenttime/set?type=${type}&time=${time}&videoDuration=${videoDuration}&group=${groupId}&token=${token}`;
                fetch(url).then(() => {
                    resolve();
                }).catch(err => {
                    console.log("Error updating watchtime", err);
                    reject(err);
                });
            });
        });
    }

    ping(content, transcodingGroupId) {
        return new Promise((resolve, reject) => {
            this.token.validateContentToken().then(token => {
                const url = `${this.url}/api/video/${content.id}/hls/ping?group=${transcodingGroupId}&token=${token}`;
                fetch(url).then(() => {
                    resolve();
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
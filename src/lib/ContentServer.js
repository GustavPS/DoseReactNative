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
            const result = {
              title: 'Popular movies',
              content: [],
              type: 'movies',
              canLoadMore: false
            };
            for (const movie of movies) {
              result.content.push(
                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.trailer)
              );
            }
            resolve(result);
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
            const result = {
              title: 'Watchlist',
              content: [],
              type: 'movies',
              canLoadMore: false
            };
            for (const movie of movies) {
              result.content.push(
                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.trailer)
              );
            }
            resolve(result);
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
  getMoviesByGenre(genre, fetchAll=false) {
    return new Promise((resolve, reject) => {
      this.token.validateContentToken().then(token => {
        let url = `${this.url}/api/movies/list/genre/${genre}?token=${token}`;
        if (fetchAll) {
          url += '&limit=ALL';
        } else {
          url += '&limit=20'
        }
        fetch(url).then(result => {
          result.json().then(data => {
            const movies = data.result;
            const result = {
              title: genre,
              content: [],
              type: 'movies',
              canLoadMore: false
            };
            for (const movie of movies) {
              result.content.push(
                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.trailer)
              );
            }
            result.canLoadMore = result.content.length === 20 && !fetchAll;
            resolve(result);
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
  getShowsByGenre(genre, fetchAll=false) {
    return new Promise((resolve, reject) => {
      this.token.validateContentToken().then(token => {
        let url = `${this.url}/api/series/list/genre/${genre}?token=${token}`;
        if (fetchAll) {
          url += '&limit=ALL';
        } else {
          url += '&limit=20';
        }
        fetch(url).then(result => {
          result.json().then(data => {
            const shows = data.result;
            const result = {
              title: genre,
              content: [],
              type: 'shows',
              canLoadMore: false
            };
            for (const show of shows) {
              const showToAdd = new Show(show.title, show.overview, show.id, show.images);
              if (show.nextEpisodeForUser != null) {
                showToAdd.setNextEpisode(show.nextEpisodeForUser.episode, show.nextEpisodeForUser.episode_id, show.nextEpisodeForUser.season_number);
              }
              if (show.episodeProgress != null) {
                showToAdd.setResumeEpisode(show.episodeProgress.episode, show.episodeProgress.episode_id, show.episodeProgress.season_number, show.episodeProgress.time);
              }
              result.content.push(showToAdd);
            }
            result.canLoadMore = result.content.length === 20 && !fetchAll;

            resolve(result);
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
                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.trailer)
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
            const result = {
              title: 'Newly added movies',
              content: [],
              type: 'movies',
              canLoadMore: false
            };
            for (const movie of movies) {
              result.content.push(
                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.trailer)
              );
            }
            resolve(result);
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
            const result = {
              title: 'Newly released movies',
              content: [],
              type: 'movies',
              canLoadMore: false
            };
            for (const movie of movies) {
              result.content.push(
                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.trailer)
              );
            }
            resolve(result);
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
        fetch(url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': 0
          }
        }).then(result => {
          result.json().then(data => {
            const movies = data.result;
            const result = {
              title: 'Ongoing movies',
              content: [],
              type: 'movies',
              canLoadMore: false
            };
            for (const movie of movies) {
              result.content.push(
                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.trailer, movie.watchtime, movie.runtime)
              );
            }
            resolve(result);
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
            const result = {
              title: 'Newly added TV Shows',
              content: [],
              type: 'shows',
              canLoadMore: false
            };
            for (const show of shows) {
              const showToAdd = new Show(show.title, show.overview, show.id, show.images);
              if (show.nextEpisodeForUser != null) {
                showToAdd.setNextEpisode(show.nextEpisodeForUser.episode, show.nextEpisodeForUser.episode_id, show.nextEpisodeForUser.season_number);
              }
              if (show.episodeProgress != null) {
                showToAdd.setResumeEpisode(show.episodeProgress.episode, show.episodeProgress.episode_id, show.episodeProgress.season_number, show.episodeProgress.time);
              }
              result.content.push(showToAdd);
            }
            resolve(result);
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
      })
    });
  }

  getOngoingEpisodes() {
    return new Promise((resolve, reject) => {
      this.token.validateContentToken().then(token => {
        const url = `${this.url}/api/series/list/ongoing?token=${token}`;
        fetch(url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': 0
          }
        }).then(result => {
          result.json().then(data => {
            const ongoingEpisodes = data.ongoing;
            const upcomingEpisodes = data.upcoming;
            const result = {
              title: 'Ongoing episodes',
              content: [],
              type: 'episodes',
              canLoadMore: false
            };
            for (const episode of [...upcomingEpisodes, ...ongoingEpisodes]) {
              let backdrop, poster;
              for (const image of episode.images) {
                if (image.type === "POSTER" && image.active) {
                  poster = image.path;
                } else if (image.type === "BACKDROP" && image.active) {
                  backdrop = image.path;
                }
              }
              if (episode.season_poster != null) {
                poster = episode.season_poster;
              }

              const episodeToAdd = new Episode(
                episode.name,
                episode.overview,
                episode.internalepisodeid,
                episode.show_id,
                episode.episode_number,
                episode.season_number,
                backdrop,
                episode.show_title
              );
              episodeToAdd.setIncludeSeasonInTitle(true);
              episodeToAdd.setWatchtime(episode.time_watched);
              episodeToAdd.setRuntime(episode.total_time);
              episodeToAdd.setPoster(poster);
              result.content.push(episodeToAdd);
            }
            resolve(result);
          }).catch(err => {
            reject(err);
          });
        }).catch(err => {
          reject(err);
        });
      });
    });
  }

  getNewlyAddedEpisodes() {
    return new Promise((resolve, reject) => {
      this.token.validateContentToken().then(token => {
        const url = `${this.url}/api/series/list/episodes?token=${token}`;
        console.log(url)
        fetch(url).then(result => {
          result.json().then(data => {
            const episodes = data.result;
            const result = {
              title: 'Newly added episodes',
              content: [],
              type: 'episodes',
              canLoadMore: false
            };
            for (const episode of episodes) {
              let backdrop, poster;
              for (const image of episode.images) {
                if (image.type === "POSTER" && image.active) {
                  poster = image.path;
                } else if (image.type === "BACKDROP" && image.active) {
                  backdrop = image.path;
                }
              }
              if (episode.season_poster != null) {
                poster = episode.season_poster;
              }

              const episodeToAdd = new Episode(
                episode.title,
                episode.overview,
                episode.internalepisodeid,
                episode.show_id,
                episode.episode,
                episode.season,
                backdrop,
                episode.show_title
              );
              episodeToAdd.setIncludeSeasonInTitle(true);
              episodeToAdd.setPoster(poster);
              result.content.push(episodeToAdd);
            }
            resolve(result);
          }).catch(err => {
            reject(err);
          });
        }).catch(err => {
          reject(err);
        });
      });
    });
  }

  getMovieTrailer(content) {
    return new Promise((resolve, reject) => {
      this.token.validateContentToken().then(async (token) => {
        const baseUrl = await this.getUrl();
        resolve(`${baseUrl}/api/trailer/${content.id}?type=MOVIE&token=${token}`);
      }).catch(err => {
        reject(err);
      })
    });
  }

  async listAllSections() {
    const genres = await this.getGenres();
    let promises = [
      this.getPopularMovies(),
      this.getOngoingMovies(),
      this.getMovieWatchlist(),
      this.getNewlyAddedMovies(),
      this.getNewlyReleasedMovies(),
      this.getNewlyAddedShows(),
      this.getOngoingEpisodes(),
      this.getNewlyAddedEpisodes()
    ];

    // Append the genres to the promises array
    promises = promises.concat(genres.flatMap(
      (genre) =>
        [
          this.getMoviesByGenre(genre.name),
          this.getShowsByGenre(genre.name)
        ]
    ));
    return Promise.all(promises);
  }

  /**
   * Get the transcoding group id from the server
   * 
   * @param {Base} content - The content to get the transcoding group id for 
   * @returns 
   */
  getTranscodingGroupId(content) {
    return new Promise(async (resolve, reject) => {
      const baseUrl = await this.getUrl();
      this.token.validateContentToken().then(token => {
        const url = `${baseUrl}/api/video/${content.id}/hls/getTranscodingGroupId?token=${token}`;
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
    return new Promise(async (resolve, reject) => {
      const baseUrl = await this.getUrl();
      const type = content.isMovie() ? "movie" : "serie";
      this.token.validateContentToken().then(token => {
        const url = `${baseUrl}/api/video/${content.id}/currenttime/set?type=${type}&time=${time}&videoDuration=${videoDuration}&group=${groupId}&token=${token}`;
        fetch(url).then(() => {
          resolve();
        }).catch(err => {
          console.log("Error updating watchtime", err);
          reject(err);
        });
      });
    });
  }

  getNextEpisode(episode) {
    return new Promise(async (resolve, reject) => {
      const baseUrl = await this.getUrl();

      this.token.validateContentToken().then(token => {
        const url = `${baseUrl}/api/series/getNextEpisode?serie_id=${episode.show_id}&season=${episode.season_number}&episode=${episode.episodeNumber}&token=${token}`;
        console.log(url);
        fetch(url).then(result => {
          result.json().then(data => {
            if (data.foundEpisode) {
              this.getEpisodeMetadata(data.episode, episode.show_id, data.season).then(nextEpisode => {
                const content = new Episode(nextEpisode.name, nextEpisode.overview, nextEpisode.internalepisodeid, episode.show_id, data.episode, data.season, nextEpisode.backdrop);
                resolve(content);
              }).catch(err => {
                reject(err);
              });
            } else {
              resolve(false);
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

  async getSubtitles(content) {
    const type = content.isMovie() ? "movie" : "serie";
    const token = await this.token.validateContentToken();
    const url = `${this.url}/api/subtitles/list?type=${type}&content=${content.id}&token=${token}`;

    return new Promise(resolve => {
      fetch(url).then(result => {
        result.json().then(data => {
          resolve(data.subtitles);
        });
      });
    });
  }

  async getResolutions(content) {
    const type = content.isMovie() ? 'movie' : 'serie';
    const token = await this.token.validateContentToken();
    const url = `${this.url}/api/video/${content.id}/getResolution?type=${type}&token=${token}`;

    return new Promise(resolve => {
      fetch(url).then(result => {
        result.json().then(data => {
          resolve(data);
        });
      })
    });
  }

  /**
   * Search for movies and TV Shows
   * 
   * @param {String} query - The query to search for
   * @returns 
   */
  search(query) {
    return new Promise((resolve, reject) => {
      this.token.validateContentToken().then(token => {
        const url = `${this.url}/api/list/search?token=${token}&query=${query}`;
        fetch(url).then(result => {
          result.json().then(data => {
            const returnData = [];
            const movies = data.movies;
            const shows = data.series;
            for (const movie of movies) {
              returnData.push(
                new Movie(movie.title, movie.overview, movie.id, movie.images, movie.trailer)
              );
            }
            for (const show of shows) {
              returnData.push(
                new Show(show.title, show.overview, show.id, show.images)
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
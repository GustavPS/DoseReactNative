import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, FlatList, Animated, ScrollView, TouchableWithoutFeedback, BackHandler, Image, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ContentList } from '../components/media/ContentList';
import { Poster } from '../components/media/Poster';
import { Splash } from '../components/Splash';
import { ContentServer } from '../lib/ContentServer';
import Token from '../lib/Token';
const img = { uri: "https://image.tmdb.org/t/p/original//qA3O0xaoesnIAmMWYz0RJyFMc97.jpg" };
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import { Movie } from '../lib/Content/Movie';
import { useIsFocused } from '@react-navigation/native';
import { MOVIE_TYPE, SHOW_TYPE } from '../lib/Content/Base';
import { Episode } from '../lib/Content/Episode';
import { LeftMenu } from '../components/LeftMenu';
import { TVEventHandler } from 'react-native';


export const Main = ({ navigation }) => {
    const _tvEventHandler = new TVEventHandler();

    const [contentInView, setContentInView] = React.useState(false);
    const [popularMovies, setPopularMovies] = React.useState([]);
    const heightAnim = useRef(new Animated.Value(100)).current;
    const [selectedContent, setSelectedContent] = useStateWithCallbackLazy(null);
    const [movies, setMovies] = useStateWithCallbackLazy([]);
    const [loading, setLoading] = useStateWithCallbackLazy(true);
    const [firstItemSelected, setFirstItemSelected] = useStateWithCallbackLazy(false);
    const [focusSideMenu, setFocusSideMenu] = React.useState(false);
    const [searching, setSearching] = useStateWithCallbackLazy(false);

    const isFocused = useIsFocused();
    const backHandlerRef = useRef(null);
    const contentInViewRef = useRef();
    const firstItemSelectedRef = useRef();
    firstItemSelectedRef.current = firstItemSelected;
    contentInViewRef.current = contentInView;

    const timerRef = useRef(null);


    const moviesStateRef = useRef();
    moviesStateRef.current = movies;
    const flatListRef = useRef();
    const splashRef = useRef();
    const contentServer = new ContentServer();

    
    const _enableTVEventHandler = () => {
        _tvEventHandler.enable(this, function (cmp, evt) {
            // On press down
            if (evt.eventKeyAction == 0) {
                if (evt && evt.eventType === 'left') {
                    if (firstItemSelectedRef.current && contentInViewRef.current) {
                        setFocusSideMenu(true);
                    }
                } else if (evt && evt.eventType === 'right') {
                    setFocusSideMenu(false);
                }
            }
        });
    }

    const _disableTVEventHandler = () => {
        if (_tvEventHandler) {
            _tvEventHandler.disable();
        }
    }


    const redirectToLogin = () => {
        navigation.navigate('Connect');
    }

    const handleBackButton = () => {
        if (!contentInViewRef.current) {
            setContentInView(true);
            Animated.timing(heightAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: false
            }).start();
            splashRef.current.hideButtons();
            return true;
        } else {
            BackHandler.exitApp();
        }
    }

    useEffect(() => {
        backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

        contentServer.initialize().then(() => {
            contentServer.getGenres().then(genres => {
                const promises = [];
                for (const genre of genres) {
                    promises.push(contentServer.getMoviesByGenre(genre.name));
                    promises.push(contentServer.getShowsByGenre(genre.name));
                }

                const popularMoviesPromise = contentServer.getPopularMovies();
                const ongoingMoviesPromise = contentServer.getOngoingMovies();
                const movieWatchlistPromise = contentServer.getMovieWatchlist();
                const newlyAddedMoviesPromise = contentServer.getNewlyAddedMovies();
                const newlyReleasedMoviesPromise = contentServer.getNewlyReleasedMovies();
                const newlyAddedShowsPromise = contentServer.getNewlyAddedShows();
                const ongoingEpisodesPromise = contentServer.getOngoingEpisodes();
                Promise.all([popularMoviesPromise, ongoingMoviesPromise, movieWatchlistPromise, newlyAddedMoviesPromise, newlyReleasedMoviesPromise, newlyAddedShowsPromise, ongoingEpisodesPromise]).then(([popularMovies, ongoingMovies, movieWatchlist, newlyAddedMovies, newlyReleasedMovies, newlyAddedShows, ongoingEpisodes]) => {
                    const moviesToAdd = [];
                    let indx = 0;
                    if (popularMovies.length > 0) {
                        moviesToAdd.push({
                            id: indx++,
                            title: 'Popular Movies',
                            data: popularMovies,
                        });
                    }
                    if (ongoingMovies.length > 0) {
                        moviesToAdd.push({
                            id: indx++,
                            title: 'Ongoing Movies',
                            data: ongoingMovies,
                            ongoingMovies: true
                        });
                    }
                    if (ongoingEpisodes.length > 0) {
                        moviesToAdd.push({
                            id: indx++,
                            title: 'Ongoing Episodes',
                            data: ongoingEpisodes,
                            backdrop: true,
                            showTitle: true,
                            ongoingEpisodes: true
                        });
                    }
                    if (newlyAddedMovies.length > 0) {
                        moviesToAdd.push({
                            id: indx++,
                            title: 'New Movies',
                            data: newlyAddedMovies,
                        });
                    }
                    if (newlyAddedShows.length > 0) {
                        moviesToAdd.push({
                            id: indx++,
                            title: 'New Shows',
                            data: newlyAddedShows,
                        });
                    }
                    if (newlyReleasedMovies.length > 0) {
                        moviesToAdd.push({
                            id: indx++,
                            title: 'Newly Released Movies',
                            data: newlyReleasedMovies,
                        });
                    }
                    if (movieWatchlist.length > 0) {
                        moviesToAdd.push({
                            id: indx++,
                            title: 'Watchlist',
                            data: movieWatchlist,
                        });
                    }
                    setMovies(moviesToAdd, () => {
                        Promise.all(promises).then(results => {
                            const resultingMovies = [];
                            let lastIndex = moviesStateRef.current.length - 1 // NOTE: Might fail if ids are not set correctly
                            let genreIndex = 0; // Increments every second genre because we are getting 2 results per genre (movies and shows)
                            for (let i = 0; i < results.length; i++) {
                                // Increment genreIndex every second iteration
                                if (i % 2 === 0 && i !== 0) {
                                    genreIndex++;
                                }

                                const genre = genres[genreIndex];
                                const contents = results[i];
                                if (contents.length > 0) {
                                    let title = genre.name;
                                    if (!contents[0].isMovie()) {
                                        title += ' Shows';
                                    }

                                    resultingMovies.push({
                                        id: ++lastIndex,
                                        title: title,
                                        data: contents,
                                    });
                                }
                            }

                            setMovies([...moviesStateRef.current, ...resultingMovies], () => {
                                const randomIndx = Math.floor(Math.random() * moviesStateRef.current.length)
                                const initialSelectedItem = moviesStateRef.current[randomIndx].data[Math.floor(Math.random() * moviesStateRef.current[randomIndx].data.length)];
                                splashRef.current.setSplash(initialSelectedItem);
                                setSelectedContent(initialSelectedItem, () => {
                                    setLoading(false);
                                });
                            });
                        });
                    });
                }).catch(err => {
                    console.log(err)
                    redirectToLogin();
                });


            }).catch(err => {
                console.log(err);
                redirectToLogin();
            })
        });

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
            backHandlerRef.current.remove();
            _disableTVEventHandler();
        }
    }, []);

    const updateContentList = async () => {
        // TODO: Update content list
    }

    useEffect(() => {
        if (isFocused) {
            backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
            _enableTVEventHandler();
            updateContentList();
        } else {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
            backHandlerRef.current.remove();
            _disableTVEventHandler();
        }
        if (isFocused && splashRef != null && !searching) {
            splashRef.current.forceFocus();
        }
        if (isFocused && searching) {
            setSearching(false)
        }
    }, [isFocused]);

    const contentFocused = (item, rowId, isFirstItem) => {
        setFirstItemSelected(isFirstItem);
        const movie = item;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            splashRef.current.setSplash(movie);
        }, 500);

        //splashRef.current.setSplash(movie);
        setSelectedContent(movie);
        if (!contentInView) {
            setContentInView(true);
            Animated.timing(heightAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: false
            }).start((event) => {
                moveFlatListToIndex(rowId, true);
            });
        } else {
            moveFlatListToIndex(rowId, true);
        }
        splashRef.current.hideButtons();
    }

    const contentSelected = (item, rowId) => {
        splashFocused();
    };

    const moveFlatListToIndex = (index, animated) => {
        flatListRef.current.scrollToIndex({
            animated: 1,
            index: index,
            viewOffset: 0,
            viewPosition: 0.1,
        });
    }

    const splashFocused = () => {
        if (contentInView) {
            setContentInView(false);
            Animated.timing(heightAnim, {
                toValue: 100,
                duration: 200,
                useNativeDriver: false
            }).start();
            splashRef.current.showButtons();
        }
    }

    const onPlay = (time) => {
        if (selectedContent.isMovie() || selectedContent.isEpisode()) {
            navigation.navigate('Player', {
                content: selectedContent,
                startTime: time,
            });
        } else {
            contentServer.initialize().then(() => {
                let episodeId, seasonNumber, episodeNumber;
                if (selectedContent.nextEpisode) {
                    episodeId = selectedContent.nextEpisode.episodeId;
                    seasonNumber = selectedContent.nextEpisode.seasonNumber;
                    episodeNumber = selectedContent.nextEpisode.episodeNumber;
                } else if (selectedContent.resumeEpisode) {
                    episodeId = selectedContent.resumeEpisode.episodeId;
                    seasonNumber = selectedContent.resumeEpisode.seasonNumber;
                    episodeNumber = selectedContent.resumeEpisode.episodeNumber;
                } else {
                    console.log(`Tried to start a show that can't be resumed or has a next episode`);
                    return;
                }

                contentServer.getEpisodeMetadata(episodeNumber, selectedContent.id, seasonNumber).then(episode => {
                    const content = new Episode(episode.name, episode.overview, episode.internalepisodeid, selectedContent.id, episodeNumber, episode.backdrop);
                    navigation.navigate('Player', {
                        content: content,
                        startTime: time,
                    });
                });

            });
        }


    }

    const onInfo = () => {
        if (selectedContent.isMovie()) {
            navigation.navigate('MovieInfo', {
                movie: selectedContent,
            });
        } else if (selectedContent.isShow()) {
            navigation.navigate('ShowInfo', {
                show: selectedContent,
            });
        }
    }

    const openSearch = () => {
        setSearching(true, () => {
            navigation.navigate('Search');
        });
    }

    return (
        <View style={styles.page}>
            <LeftMenu focus={focusSideMenu} openSearch={openSearch}></LeftMenu>
            <View style={styles.container}>
                {loading &&
                    <Image source={require('../images/loading.gif')} style={styles.loading} />
                }

                <Splash
                    onFocus={splashFocused}
                    ref={splashRef}
                    onPlay={onPlay}
                    onInfo={onInfo}
                />



                <Animated.View
                    style={[
                        styles.content,
                        {
                            height: heightAnim
                        }
                    ]}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        ref={flatListRef}
                        horizontal={false}
                        data={movies}
                        scrollEnabled={true}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <ContentList
                                onFocus={(selected, isFirstItem) => contentFocused(selected, item.id, isFirstItem)}
                                onPress={(selected) => contentSelected(selected, item.id)}
                                title={item.title}
                                data={item.data}
                                useBackdrop={item.backdrop}
                                showTitle={item.showTitle}
                            />
                        )
                        }
                    />
                </Animated.View>
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#020608"
    },

    page: {
        flex: 1,
        flexDirection: 'row'
    },

    loading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        zIndex: 10,
        width: 100,
        height: 100
    },

    background: {
        flex: 1
    },

    splash: {
        flex: 1,
    },

    content: {
        marginLeft: 15
    },

    scrollViewContainer: {},

    logoContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 20,
        marginLeft: 20,
    },

    description: {
        color: 'white',
        fontSize: 12,
        width: '35%',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },

    title: {
        fontSize: 40,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10

    },
    rowTitle: {
        fontSize: 20,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    }
})
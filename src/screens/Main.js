import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, FlatList, Animated, ScrollView, TouchableWithoutFeedback } from 'react-native';
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

export const Main = ({ navigation }) => {

    const [contentInView, setContentInView] = React.useState(false);
    const [popularMovies, setPopularMovies] = React.useState([]);
    const heightAnim = useRef(new Animated.Value(100)).current;

    const [selectedContent, setSelectedContent] = React.useState(null);

    const [movies, setMovies] = useStateWithCallbackLazy([]);
    const isFocused = useIsFocused();

    const timerRef = useRef(null);


    const moviesStateRef = useRef();
    moviesStateRef.current = movies;
    const flatListRef = useRef();
    const splashRef = useRef();
    const contentServer = new ContentServer();


    const redirectToLogin = () => {
        navigation.navigate('Connect');
    }

    useEffect(() => {
        contentServer.initialize().then(() => {
            contentServer.getGenres().then(genres => {
                const promises = [];
                for (const genre of genres) {
                    promises.push(contentServer.getMoviesByGenre(genre.name));
                }

                const popularMoviesPromise = contentServer.getPopularMovies();
                const movieWatchlistPromise = contentServer.getMovieWatchlist();
                const newlyAddedMoviesPromise = contentServer.getNewlyAddedMovies();
                const newlyReleasedMoviesPromise = contentServer.getNewlyReleasedMovies();
                Promise.all([popularMoviesPromise, movieWatchlistPromise, newlyAddedMoviesPromise, newlyReleasedMoviesPromise]).then(([popularMovies, movieWatchlist, newlyAddedMovies, newlyReleasedMovies]) => {
                    const moviesToAdd = [];
                    if (popularMovies.length > 0) {
                        moviesToAdd.push({
                            id: 0,
                            title: 'Popular Movies',
                            data: popularMovies,
                        });
                    }
                    if (movieWatchlist.length > 0) {
                        moviesToAdd.push({
                            id: 1,
                            title: 'New Movies',
                            data: newlyAddedMovies,
                        });
                    }
                    if (newlyReleasedMovies.length > 0) {
                        moviesToAdd.push({
                            id: 2,
                            title: 'Newly Released Movies',
                            data: newlyReleasedMovies,
                        });
                    }
                    if (movieWatchlist.length > 0) {
                        moviesToAdd.push({
                            id: 3,
                            title: 'Watchlist',
                            data: movieWatchlist,
                        });
                    }
                    setMovies(moviesToAdd, () => {
                        Promise.all(promises).then(results => {
                            const resultingMovies = [];
                            let lastIndex = moviesStateRef.current.length - 1 // NOTE: Might fail if ids are not set correctly
                            for (let i = 0; i < results.length; i++) {
                                const genre = genres[i];
                                const movies = results[i];
                                if (movies.length > 0) {
                                    resultingMovies.push({
                                        id: ++lastIndex,
                                        title: genre.name,
                                        data: movies,
                                    });
                                }
                            }

                            setMovies([...moviesStateRef.current, ...resultingMovies]);
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
    }, []);

    useEffect(() => {
        if (isFocused && splashRef != null) {
            splashRef.current.forceFocus();
        }
    }, [isFocused]);

    const contentFocused = (item, rowId) => {
        const movie = new Movie(item.title, item.description, item.id, item.images);
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
        const movie = new Movie(item.title, item.description, item.id, item.images);
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

    const onPlay = () => {
        navigation.navigate('Player', {
            movie: selectedContent,
            startTime: 0,
        });
    }

    const onInfo = () => {
        navigation.navigate('MovieInfo', {
            movie: selectedContent,
        });
    }

    return (
        <View style={styles.container}>
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
                            onFocus={(selected) => contentFocused(selected, item.id)}
                            onPress={(selected) => contentSelected(selected, item.id)}
                            title={item.title}
                            data={item.data}
                            useBackdrop={false}
                            style={{ marginBottom: 10 }}
                        />
                    )
                    }
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#020608"
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
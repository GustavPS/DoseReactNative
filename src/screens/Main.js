import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, FlatList, Animated, ScrollView } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ContentList } from '../components/media/ContentList';
import { Poster } from '../components/media/Poster';
import { Splash } from '../components/Splash';
import { ContentServer } from '../lib/ContentServer';
import Token from '../lib/Token';
const img = { uri: "https://image.tmdb.org/t/p/original//qA3O0xaoesnIAmMWYz0RJyFMc97.jpg" };
import { Row } from '@reactseals/react-native-leanback';

export const Main = ({ navigation }) => {

    const [contentInView, setContentInView] = React.useState(false);
    const [popularMovies, setPopularMovies] = React.useState([]);
    const heightAnim = useRef(new Animated.Value(100)).current;

    const contentServer = new ContentServer();

    const categories = [
        {
            id: 1,
            title: 'Popular Movies',
        },
        {
            id: 2,
            title: 'Newly addsdfed',
        },
        {
            id: 3,
            title: 'Newly adsdfasded',
        },
        {
            id: 4,
            title: 'Neasdfwly added',
        }
    ];

    const contentFocused = () => {
        if (!contentInView) {
            setContentInView(true);
            Animated.timing(heightAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: false
            }).start();
        }
    }

    const splashFocused = () => {
        if (contentInView) {
            setContentInView(false);
            Animated.timing(heightAnim, {
                toValue: 100,
                duration: 200,
                useNativeDriver: false
            }).start();
        }
    }

    useEffect(() => {
        contentServer.initialize().then(() => {
            contentServer.getPopularMovies().then(movies => {
                setPopularMovies(movies);
            });
        });
    }, []);

    /**
     * 
     *             <Animated.View
                style={[
                    styles.content,
                    {
                        height: heightAnim
                    }
                ]}>

     * 
     * 
     *                     <FlatList
                        horizontal={false}
                        data={categories}
                        keyExtractor={(item) => item.id.toString()}
                        snapToInterval={500}
                        renderItem={({ item }) => (
                            <ContentList
                            onFocus={contentFocused}
                            title={item.title}
                            data={popularMovies}
                        />)
                        }
                    />
     */

    const test = [
        {
            id: 1,
            cardImageUrl: 'https://image.tmdb.org/t/p/original/5iGVofFc0mCr8aJYsVICm42ThIu.jpg',
        }
    ]

    return (
        <View style={styles.container}>
            <Splash onFocus={splashFocused} />

            <View style={{ height: 300 }}>
                <ScrollView >
                    <View setSnapPoint>
                        <Row
                            data={test}
                            attributes={{
                                width: 135,
                                height: 200,
                                hasImageOnly: true,
                            }}
                            style={{ width: '100%', height: 250 }}
                            onFocus={(item) => console.log(item)}
                            onPress={(item) => console.log(item)}
                        />
                        <Row
                            data={test}
                            attributes={{
                                width: 135,
                                height: 200,
                                hasImageOnly: true,
                            }}
                            style={{ width: '100%', height: 250 }}
                            onFocus={(item) => console.log(item)}
                            onPress={(item) => console.log(item)}
                        />
                        <Row
                            data={test}
                            attributes={{
                                width: 135,
                                height: 200,
                                hasImageOnly: true,
                            }}
                            nextFocusUpId={5}
                            style={{ width: '100%', height: 250 }}
                            onFocus={(item) => console.log(item)}
                            onPress={(item) => console.log(item)}
                        />
                    </View>

                </ScrollView>
            </View>
        </View>
    );
};

/*
                    <ContentList
                    onFocus={contentFocused}
                    title={'Popular Movies'}
                    data={popularMovies}
                />

                <ContentList
                    onFocus={contentFocused}
                    title={'Newly added'}
                    data={popularMovies}
                />
                */

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
        //marginLeft: 10,
        flex: 1
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
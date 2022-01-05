import React, { useRef, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, Image, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ContentServer } from '../../lib/ContentServer';
import { ContentList } from '../../components/media/ContentList';
import { Season } from '../../lib/Content/Season';
import { Episode } from '../../lib/Content/Episode';

export const SeasonInfo = ({ route, navigation }) => {
    const { season, show } = route.params;
    const logoPath = season.getLogoPath('original');
    const posterPath = season.getPosterPath('original');
    const title = season.getTitle();
    const contentServer = new ContentServer();

    const [description, setDescription] = React.useState("");
    const [episodes, setEpisodes] = React.useState([]);

    const loadSeasonMetadata = () => {
        contentServer.getSeasonMetadata(season, show).then(metadata => {
            const episodesToAdd = [];
            for (const episode of metadata.episodes) {
                episodesToAdd.push(
                    new Episode(episode.name, episode.overview, episode.internalID, episode.episode, episode.backdrop)
                );
            }
            setEpisodes(episodesToAdd);
            setDescription(metadata.overview);
        });
    }

    useEffect(() => {
        contentServer.initialize().then(() => {
            loadSeasonMetadata();
        });
    }, []);

    return (
        <View style={styles.page}>
            <ImageBackground
                source={{ uri: season.getBackdropPath('original') }}
                resizeMode="cover"
                style={styles.backdrop}
            >
                <View style={styles.opacity} />
                <View style={styles.container}>
                    <View style={styles.content}>
                        {/* Poster */}
                        <Image source={{ uri: posterPath }} style={styles.poster} />


                        <View style={styles.information}>
                            {/* Logo / Title*/}
                            {logoPath != "" ? <Image source={{ uri: logoPath }} style={styles.logo} /> : <Text style={styles.title}>{title}</Text>}

                            {/* Description */}
                            <Text style={styles.description}>{description}</Text>
                        </View>
                    </View>

                    {/* Episodes */}
                    {episodes.length > 0 &&
                        <View style={styles.episodes}>
                            <Text style={styles.episodesTitle}>Episodes</Text>
                            <ContentList
                                data={episodes}
                                style={styles.episodesList}
                                onPress={(episode) => navigation.push('Player', { content: episode, startTime: 0 })}
                                useBackdrop={true}
                                showTitle={true}
                                showDescription={true}
                            />
                        </View>
                    }

                </View>
            </ImageBackground>

        </View>
    );
};

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },

    container: {
        margin: 35,
    },

    content: {
        flexDirection: 'row',
    },

    backdrop: {
        flex: 1,
    },

    opacity: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    logo: {
        width: 400,
        height: 100,
        resizeMode: 'contain',
    },

    title: {
        fontSize: 40,
    },

    poster: {
        width: 140,
        height: 200
    },

    information: {
        flexDirection: 'column',
        flex: 1,
        marginLeft: 20,
    },

    description: {
        fontSize: 12,
        width: '70%'
    },

    episodesTitle: {
        fontSize: 20,
        marginTop: 20,
        marginBottom: -10,
        color: 'white',
        fontWeight: 'bold',
    },

    episodesList: {
        marginLeft: -55
    },



    // Buttons
    button: {
        flexDirection: 'row',
        paddingRight: 10,
        paddingLeft: 10,
        paddingTop: 2.5,
        paddingBottom: 2.5,
        borderRadius: 10,
        backgroundColor: 'whitesmoke',
        marginRight: 10,
        opacity: 0.5
    },

    text: {
        fontSize: 15,
        color: 'black',
        fontWeight: 'bold',
    },

    buttonImage: {
        width: 15,
        height: 15,
        alignSelf: 'center',
        marginRight: 5,
    },


    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
})
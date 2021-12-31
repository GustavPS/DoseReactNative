import React, { useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as SecureStore from 'expo-secure-store';
import Video from 'react-native-video';
import { ContentServer } from '../lib/ContentServer';
import { useEffect } from 'react/cjs/react.development';

export const Player = ({ route, navigation }) => {
    const { movie, startTime } = route.params;
    const [videoSource, setVideoSource] = React.useState(null);
    const [languages, setLanguages] = React.useState([]);
    const videoPlayerRef = useRef(null);

    const contentServer = new ContentServer();

    const findPreferredLanguage = (languages) => {
        const preferredLanguage = languages.find(language => language.shortName == "eng");
        if (preferredLanguage) {
            return preferredLanguage;
        }
        return null;
    }

    const onVideoLoad = () => {
        videoPlayerRef.current.seek(startTime);
    }

    useEffect(() => {
        contentServer.initialize().then(() => {
            Promise.all([contentServer.getAccessToken(), contentServer.getUrl(), contentServer.getMovieLanguages(movie)]).then(([accessToken, contentServerUrl, availableLanguages]) => {
                setLanguages(availableLanguages);
                let preferredLanguage = findPreferredLanguage(availableLanguages);
                console.log(availableLanguages);
                if (!preferredLanguage) {
                    console.log("No preferred language found");
                    preferredLanguage = availableLanguages[0];
                }


                const videoSource = {
                    uri: movie.getSource(contentServerUrl, accessToken, preferredLanguage.stream_index),
                    type: "m3u8"
                }
                setVideoSource(videoSource);
            });
        });
    }, []);


    return (
        <View style={styles.container}>
            {videoSource != null &&
                <Video
                    ref={videoPlayerRef}
                    source={videoSource}
                    style={styles.videoPlayer}
                    onLoad={onVideoLoad}
                    onBuffer={() => { console.log("onBuffer") }}
                    onError={(error) => { console.log("onError", error) }}
                    controls={true}
                />
            }

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },

    videoPlayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
})
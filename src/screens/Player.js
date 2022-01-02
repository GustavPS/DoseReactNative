import React, { useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as SecureStore from 'expo-secure-store';
import Video from 'react-native-video';
import { ContentServer } from '../lib/ContentServer';
import { useEffect } from 'react/cjs/react.development';
import { PlayerButton } from '../components/Player/PlayerButton';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import Slider from '@react-native-community/slider';

export const Player = ({ route, navigation }) => {
    const { movie, startTime } = route.params;
    const [videoSource, setVideoSource] = React.useState(null);
    const [languages, setLanguages] = React.useState([]);
    const [playing, setPlaying] = useStateWithCallbackLazy(true);
    const [currentTime, setCurrentTime] = useStateWithCallbackLazy(0);
    const [duration, setDuration] = useStateWithCallbackLazy(0);
    const [progress, setProgress] = useStateWithCallbackLazy(0);
    const videoPlayerRef = useRef(null);
    const playButtonRef = useRef(null);
    const subtitleButtonRef = useRef(null);
    const videoControlsRef = useRef();

    const contentServer = new ContentServer();

    const findPreferredLanguage = (languages) => {
        const preferredLanguage = languages.find(language => language.shortName == "eng");
        if (preferredLanguage) {
            return preferredLanguage;
        }
        return null;
    }

    const onVideoLoad = (data) => {
        videoPlayerRef.current.seek(startTime);
        setDuration(data.duration);
    }

    useEffect(() => {
        playButtonRef.current.focus();

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


    const onPlay = () => {
        setPlaying(true, () => {
            playButtonRef.current.focus();
        });

    }

    const onPause = () => {
        setPlaying(false, () => {
            playButtonRef.current.focus();
        });
    }

    const onVideoProgress = (progress) => {
        setCurrentTime(progress.currentTime);
        if (duration > 0) {
            setProgress(progress.currentTime / duration);
        }
    }

    // Function that converts time in seconds to a string in the format HH:MM:SS
    const formatTime = (time) => {
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time - (hours * 3600)) / 60);
        let seconds = Math.floor(time - (hours * 3600) - (minutes * 60));

        // Add leading zeros to minutes and seconds if needed
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ":" + minutes + ":" + seconds;
    }

    return (
        <View style={styles.container}>

            {videoSource != null &&
                <Video
                    ref={videoPlayerRef}
                    source={videoSource}
                    style={styles.videoPlayer}
                    paused={!playing}
                    onLoad={onVideoLoad}
                    onProgress={onVideoProgress}
                    onBuffer={() => { console.log("onBuffer") }}
                    onError={(error) => { console.log("onError", error) }}
                />
            }

            <TouchableHighlight style={styles.controls}>
                <View>
                    <View style={styles.upperControls}>

                    </View>

                    <View style={styles.lowerControls}>
                        {/* Play button */}
                        {playing &&
                            <PlayerButton
                                ref={playButtonRef}
                                type="pause"
                                onPress={onPause}
                            />
                        }
                        {/* Pause button */}
                        {!playing &&
                            <PlayerButton
                                ref={playButtonRef}
                                type="play"
                                onPress={onPlay}
                            />
                        }
                        <Text style={styles.progressText}>{`${formatTime(currentTime)}`}</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            value={progress * 100}
                            minimumTrackTintColor="#FFFFFF"
                            maximumTrackTintColor="white"
                            disabled={true}
                        />

                        <Text style={styles.progressText}>{`${formatTime(duration)}`}</Text>

                        <PlayerButton
                            type="subtitle"
                            ref={subtitleButtonRef}
                            style={{marginRight: 10}}
                        />
                        <PlayerButton
                            type="settings"
                        />
                    </View>
                </View>
            </TouchableHighlight>
        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },

    videoPlayer: {
        flex: 1
    },

    controls: {
        flex: 1,
        height: '100%',
        backgroundColor: "rgba(0,0,0,0.0)",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
    },

    lowerControls: {
        position: "absolute",
        bottom: 0,
        padding: 10,
        flexDirection: "row",
    },

    slider: {
        width: 670,
    },

    progressText: {
        marginHorizontal: 10,
        alignSelf: "center",
    }

})
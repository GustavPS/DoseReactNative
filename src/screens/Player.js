import React, { useRef, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, TouchableWithoutFeedback, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as SecureStore from 'expo-secure-store';
import Video from 'react-native-video';
import { ContentServer } from '../lib/ContentServer';
import { PlayerButton } from '../components/Player/PlayerButton';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import Slider from '@react-native-community/slider';
import { SettingsBox } from '../components/Player/SettingsBox';
import { TVEventHandler } from 'react-native';

export const Player = ({ route, navigation }) => {
    const { movie, startTime } = route.params;
    const _tvEventHandler = new TVEventHandler();
    const [videoSource, setVideoSource] = React.useState(null);
    const [languages, setLanguages] = React.useState([]);
    const [playing, setPlaying] = useStateWithCallbackLazy(true);
    const [currentTime, setCurrentTime] = useStateWithCallbackLazy(0);
    const [duration, setDuration] = useStateWithCallbackLazy(0);
    const [subtitles, setSubtitles] = useStateWithCallbackLazy([]);
    const [resolutions, setResolutions] = useStateWithCallbackLazy([]);
    const [progress, setProgress] = useStateWithCallbackLazy(0);
    const [showSubtitleSettingsBox, setShowSubtitleSettingsBox] = useStateWithCallbackLazy(false);
    const [showResolutionSettingsBox, setShowResolutionSettingsBox] = useStateWithCallbackLazy(false);
    const [selectedResolution, setSelectedResolution] = useStateWithCallbackLazy(0);
    const [selectedSubtitle, setSelectedSubtitle] = useStateWithCallbackLazy(-1);
    const [showSettings, setShowSettings] = useStateWithCallbackLazy(true);
    const [transcodingGroupId, setTranscodingGroupId] = useStateWithCallbackLazy(null);

    const showSettingsRef = useRef();
    const playingRef = useRef();
    const transcodingGroupidRef = useRef();
    const currentTimeRef = useRef();
    currentTimeRef.current = currentTime;
    transcodingGroupidRef.current = transcodingGroupId;
    playingRef.current = playing;
    showSettingsRef.current = showSettings;
    const hideSettingsTimeout = useRef(null);
    const updateWatchtimeTimeout = useRef(null);
    const pingTimeout = useRef(null);
    const videoPlayerRef = useRef(null);
    const playButtonRef = useRef(null);
    const subtitleButtonRef = useRef(null);
    const resolutionButtonRef = useRef(null);
    const videoControlsRef = useRef();
    const contentServer = new ContentServer();
    const HIDE_SETTINGS_TIMEOUT = 8000;

    const _enableTVEventHandler = () => {
        _tvEventHandler.enable(this, function (cmp, evt) {
            // On press down
            if (evt.eventKeyAction == 0) {
                if (evt && evt.eventType === 'right') {
                    console.log(evt.eventType);
                } else if (evt && evt.eventType === 'up') {
                    console.log(evt.eventType);
                } else if (evt && evt.eventType === 'left') {
                    console.log(evt.eventType);
                } else if (evt && evt.eventType === 'down') {
                    console.log(evt.eventType);
                } else if (evt && evt.eventType === 'select') {
                    if (!showSettingsRef.current) {
                        if (playingRef.current) {
                            onPause();
                        } else {
                            onPlay();
                        }
                    }

                }

                setShowSettings(true);
                resetHideControlsTimeout();
            }

        });
    }

    const resetHideControlsTimeout = () => {
        if (hideSettingsTimeout.current) {
            clearTimeout(hideSettingsTimeout.current);
        }
        hideSettingsTimeout.current = setTimeout(() => {
            setShowSettings(false);
        }, HIDE_SETTINGS_TIMEOUT);
    }

    const _disableTVEventHandler = () => {
        if (_tvEventHandler) {
            _tvEventHandler.disable();
        }
    }

    const findPreferredLanguage = (languages) => {
        const preferredLanguage = languages.find(language => language.shortName == "eng");
        if (preferredLanguage) {
            return preferredLanguage;
        }
        return null;
    }

    const onVideoLoad = (data) => {
        contentServer.initialize().then(() => {
            contentServer.getTranscodingGroupId(movie).then(transcodingGroupId => {
                setTranscodingGroupId(transcodingGroupId);

                updateWatchtimeTimeout.current = setInterval(() => {
                    contentServer.updateWatchtime(movie, transcodingGroupId, currentTimeRef.current, data.duration);
                }, 5000);

                pingTimeout.current = setInterval(() => {
                    contentServer.ping(movie, transcodingGroupId);
                }, 10000);
            });
        });
        videoPlayerRef.current.seek(startTime);

        const subtitlesToAdd = [];
        for (const subtitle of data.textTracks) {
            if (subtitle.language != "") {
                subtitlesToAdd.push(subtitle);
            }
        }

        subtitlesToAdd.push({
            language: "Disabled",
            index: -1,
        })
        console.log(data.videoTracks);
        setSubtitles(subtitlesToAdd);
        setResolutions(data.videoTracks);
        setDuration(data.duration);
    }

    useEffect(() => {
        _enableTVEventHandler();
        playButtonRef.current.focus();
        resetHideControlsTimeout();

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

        return () => {
            if (hideSettingsTimeout.current) {
                clearTimeout(hideSettingsTimeout.current);
            }
            if (updateWatchtimeTimeout.current) {
                clearTimeout(updateWatchtimeTimeout.current);
            }
            if (pingTimeout.current) {
                clearTimeout(pingTimeout.current);
            }
            _disableTVEventHandler()
        };
    }, []);

    useEffect(() => {
        if (showSettings) {
            playButtonRef.current.focus();
        }
    }, [showSettings]);


    const onPlay = () => {
        setPlaying(true, () => {
            if (playButtonRef && playButtonRef.current) {
                playButtonRef.current.focus();
            }
        });

    }

    const onPause = () => {
        setPlaying(false, () => {
            if (playButtonRef && playButtonRef.current) {
                playButtonRef.current.focus();
            }
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


    const toggleSubtitleSettingsBox = () => {
        setShowResolutionSettingsBox(false);
        if (showSubtitleSettingsBox) {
            setShowSubtitleSettingsBox(false, () => {
                subtitleButtonRef.current.focus();
            });
        } else {
            setShowSubtitleSettingsBox(true);
        }
    }

    const toggleResolutionSettingsBox = () => {
        setShowSubtitleSettingsBox(false);
        if (showResolutionSettingsBox) {
            setShowResolutionSettingsBox(false, () => {
                resolutionButtonRef.current.focus();
            });
        } else {
            setShowResolutionSettingsBox(true);
        }
    }

    const changeQuality = (resolution) => {
        setSelectedResolution(resolution);
    }

    const changeSubtitle = (index) => {
        setSelectedSubtitle(index);
    }

    const onVideoError = (data) => {
        const timeAtError = currentTime;
        console.log(`onError at time ${timeAtError}`, data);

        /*
        // Reset the video
        setPlaying(false, () => {
            setPlaying(true);
            videoPlayerRef.current.seek(timeAtError);
        });*/
    }

    const updateWatchTime = () => {
        if (playing) {
        }
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
                    onError={onVideoError}
                    selectedVideoTrack={{
                        type: "resolution",
                        value: selectedResolution
                    }}
                    selectedTextTrack={{
                        type: selectedSubtitle != -1 ? "index" : "disabled",
                        value: selectedSubtitle
                    }}
                />
            }

            {showSettings &&
                <TouchableHighlight style={styles.controls}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={styles.upperControls}>
                        </View>

                        {showSubtitleSettingsBox &&
                            <SettingsBox
                                title="Subtitles"
                            >
                                <FlatList
                                    data={subtitles}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            activeOpacity={1.0}
                                            style={{ opacity: 0.3 }}
                                            onPress={() => changeSubtitle(item.index)}
                                        >
                                            <Text style={styles.settingTitle}>{item.language}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </SettingsBox>
                        }

                        {showResolutionSettingsBox &&
                            <SettingsBox
                                title="Resolutions"
                            >
                                <FlatList
                                    data={resolutions}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            activeOpacity={1.0}
                                            style={{ opacity: 0.3 }}
                                            onPress={() => changeQuality(parseInt(item.height))}
                                        >
                                            <Text style={styles.settingTitle}>
                                                {item.width == 0 && item.height == 0 ? "Directplay" : item.width + "x" + item.height}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </SettingsBox>
                        }
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
                                style={{ marginRight: 10 }}
                                onPress={toggleSubtitleSettingsBox}
                            />
                            <PlayerButton
                                type="settings"
                                onPress={toggleResolutionSettingsBox}
                                ref={resolutionButtonRef}
                            />
                        </View>
                    </View>
                </TouchableHighlight>
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
    },

    settingTitle: {
        textTransform: 'capitalize',
        fontSize: 18,
        textAlign: "center",
        marginVertical: 2,
        borderColor: "#01071B",
        borderWidth: 2,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        padding: 5,
        borderRadius: 5,

    }

})
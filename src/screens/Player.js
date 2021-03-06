import React, { useRef, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, TouchableWithoutFeedback, TouchableOpacity, FlatList, BackHandler, Image } from 'react-native';
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
    const { content, startTime, haveReloaded } = route.params;

    /* STATES */
    const _tvEventHandler = new TVEventHandler();
    const [videoSource, setVideoSource] = useStateWithCallbackLazy(null);
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
    const [showSettings, setShowSettings] = useStateWithCallbackLazy(false);
    const [transcodingGroupId, setTranscodingGroupId] = useStateWithCallbackLazy(null);
    const [seeking, setSeeking] = useStateWithCallbackLazy(false);
    const [currentSeekTime, setCurrentSeekTime] = useStateWithCallbackLazy(0);
    const [loading, setLoading] = useStateWithCallbackLazy(true);
    const [isDoneInitializing, setIsDoneInitializing] = useStateWithCallbackLazy(false);
    const [nextEpisode, setNextEpisode] = useStateWithCallbackLazy(false);
    const [showNextEpisodeView, setShowNextEpisodeView] = useStateWithCallbackLazy(false);
    const [wait, setWait] = useStateWithCallbackLazy(true);

    /* REFS */
    const backHandlerRef = useRef(null);
    const showSettingsRef = useRef();
    const playingRef = useRef();
    const transcodingGroupidRef = useRef();
    const currentTimeRef = useRef();
    const currentSeekTimeRef = useRef();
    const durationRef = useRef();
    const seekingRef = useRef();
    const loadingRef = useRef();
    const isDoneInitializingRef = useRef();
    const showNextEpisodeViewRef = useRef();
    const nextEpisodeRef = useRef();
    nextEpisodeRef.current = nextEpisode;
    showNextEpisodeViewRef.current = showNextEpisodeView;
    isDoneInitializingRef.current = isDoneInitializing;
    loadingRef.current = loading;
    seekingRef.current = seeking;
    durationRef.current = duration;
    currentSeekTimeRef.current = currentSeekTime;
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
    const nextEpisodeButtonRef = useRef(null);
    const videoControlsRef = useRef();
    const contentServer = new ContentServer();
    const HIDE_SETTINGS_TIMEOUT = 8000;

    /* FUNCTIONS */
    const _enableTVEventHandler = () => {
        _tvEventHandler.enable(this, function (cmp, evt) {
            // On press down
            if (evt.eventKeyAction == 0) {
                // Don't show controls if we're seeking and if the video is doing the initial load
                let shouldShowSettings = !seekingRef.current && (!loadingRef.current || durationRef.current > 0) && !showNextEpisodeViewRef.current;


                if (evt && (evt.eventType === 'right' || evt.eventType === 'left')) {
                    if (!showSettingsRef.current || seekingRef.current) {
                        shouldShowSettings = false;
                        setSeeking(true);
                        setPlaying(false);

                        let changeSeekWith = 0;
                        if (evt.eventType === 'right') {
                            changeSeekWith = 10;
                        } else if (evt.eventType === 'left') {
                            changeSeekWith = -10;
                        }

                        const newSeekValue = Math.max(0, Math.min(currentSeekTimeRef.current + changeSeekWith, durationRef.current));
                        setCurrentSeekTime(newSeekValue);
                    }
                } else if (evt && evt.eventType === 'select') {
                    if (seekingRef.current) {
                        videoPlayerRef.current.seek(currentSeekTimeRef.current);
                        setPlaying(true);
                        setSeeking(false);
                        setCurrentSeekTime(currentTimeRef.current);
                    } else if (!showSettingsRef.current) {
                        if (playingRef.current) {
                            onPause();
                        } else {
                            onPlay();
                        }
                    }

                }
                setShowSettings(shouldShowSettings);
                resetHideControlsTimeout();
            }

        });
    }

    const handleBackButton = () => {
        if (showSettingsRef.current) {
            setShowSettings(false);
            return true;
        }
        if (seekingRef.current) {
            setSeeking(false);
            setPlaying(true);
            return true;
        }
        return false;
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

    const startPings = () => {
        console.log("STARTING STUFF");
        contentServer.initialize().then(() => {
            contentServer.getTranscodingGroupId(content).then(transcodingGroupId => {
                setTranscodingGroupId(transcodingGroupId);

                updateWatchtimeTimeout.current = setInterval(() => {
                    contentServer.updateWatchtime(content, transcodingGroupId, currentTimeRef.current, durationRef.current);
                    content.watchtime = Math.floor(currentTimeRef.current);
                }, 5000);

                pingTimeout.current = setInterval(() => {
                    contentServer.ping(content, transcodingGroupId);
                }, 10000);
            });
        });
    }

    // Once this is called, we can start pinging the server and the initialization is done
    const onSeek = (data) => {
        if (!isDoneInitializingRef.current) {
            startPings();
            setIsDoneInitializing(true);
        }
    }

    const onVideoLoad = (data) => {
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
        setLoading(false);
    }

    useEffect(() => {

        backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        _enableTVEventHandler();
        if (playButtonRef.current) {
            playButtonRef.current.focus();
        }
        resetHideControlsTimeout();

        contentServer.initialize().then(() => {
            if (content.isEpisode()) {
                contentServer.getNextEpisode(content).then(nextEpisode => {
                    setNextEpisode(nextEpisode);
                }).catch(err => {
                    console.log(err);
                    setNextEpisode(false);
                });
            }


            Promise.all([contentServer.getAccessToken(), contentServer.getUrl(), contentServer.getContentLanguages(content)]).then(([accessToken, contentServerUrl, availableLanguages]) => {
                setLanguages(availableLanguages);
                let preferredLanguage = findPreferredLanguage(availableLanguages);
                console.log(availableLanguages);
                if (!preferredLanguage) {
                    console.log("No preferred language found");
                    preferredLanguage = availableLanguages[0];
                }


                const videoSource = {
                    uri: content.getSource(contentServerUrl, accessToken, preferredLanguage.stream_index),
                    type: "m3u8"
                }
                console.log("setting", videoSource);
                setVideoSource(videoSource, () => {
                    setTimeout(() => {
                        setWait(false);
                    }, 1000);
                });

            }).catch(err => {
                console.log(err);
            })
        });

        return () => {
            console.log("UNMOUNTING ST UFF")
            setVideoSource(null);
            if (hideSettingsTimeout.current) {
                clearTimeout(hideSettingsTimeout.current);
            }
            if (updateWatchtimeTimeout.current) {
                clearTimeout(updateWatchtimeTimeout.current);
            }
            if (pingTimeout.current) {
                clearTimeout(pingTimeout.current);
            }
            _disableTVEventHandler();

            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
            backHandlerRef.current.remove();
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
        setCurrentSeekTime(progress.currentTime);
        setLoading(false);
        if (duration > 0) {
            setProgress(progress.currentTime / duration);
            if (progress.currentTime / duration > 0.90 && !showNextEpisodeViewRef.current && nextEpisodeRef.current != false) {
                setShowNextEpisodeView(true, () => {
                    nextEpisodeButtonRef.current.setNativeProps({
                        hasTVPreferredFocus: true
                    });
                });
            }
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
    }

    const playNextEpisode = () => {
        navigation.replace("Player", { content: nextEpisodeRef.current, startTime: 0 });
    }

    const updateWatchTime = () => {
        if (playing) {
        }
    }

    useEffect(() => {
        if (videoSource != null) {
            console.log("not null")
            console.log({
                videoSource: videoSource.uri,
                type: videoSource.type,
            })
        }

    }, [videoSource])

    return (
        <View style={styles.container}>

            {loading &&
                <Image source={require('../images/loading.gif')} style={styles.loading} />
            }

            {videoSource != null && videoSource.type == "m3u8" && videoSource.uri != "" && !wait &&
                <Video
                    ref={videoPlayerRef}
                    source={{
                        uri: videoSource.uri,
                        type: videoSource.type
                    }}
                    style={styles.videoPlayer}
                    paused={!playing}
                    onLoad={onVideoLoad}
                    onProgress={onVideoProgress}
                    onBuffer={() => { setLoading(true) }}
                    onError={onVideoError}
                    onSeek={onSeek}
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

            {showSettings && (!loading || duration > 0) &&
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
            {seeking &&
                <View style={{ flex: 1, flexDirection: 'row', position: 'absolute', bottom: 0, padding: 10 }}>
                    <Text style={styles.progressText}>{`${formatTime(currentSeekTime)}`}</Text>
                    <Slider
                        style={[
                            styles.slider,
                            {
                                width: 800
                            }
                        ]}
                        minimumValue={0}
                        maximumValue={100}
                        value={duration > 0 ? currentSeekTime / duration * 100 : 0}
                        minimumTrackTintColor="#FFFFFF"
                        maximumTrackTintColor="white"
                        disabled={true}
                    />
                    <Text style={styles.progressText}>{`${formatTime(duration)}`}</Text>
                </View>
            }
            {showNextEpisodeView &&
                <View style={styles.nextEpisodeView}>
                    <TouchableOpacity
                        activeOpacity={1.0}
                        style={[
                            styles.nextEpisodeButton
                        ]}
                        onPress={playNextEpisode}
                        ref={nextEpisodeButtonRef}
                    >
                        <View style={styles.nextEpisodeInnerColor}></View>
                        <Text style={styles.nextEpisodeText}>Next episode {Math.floor(duration - currentTime)}</Text>
                    </TouchableOpacity>
                </View>

            }
        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
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
    },

    nextEpisodeView: {
        position: "absolute",
        bottom: 50,
        right: 25,
        flex: 1
    },

    nextEpisodeButton: {
        backgroundColor: 'white',
        position: 'relative',
        padding: 10,
        borderRadius: 5,
        flex: 1,
    },

    nextEpisodeText: {
        color: 'black'
    }

})
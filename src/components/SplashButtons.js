
import React, { useRef, useImperativeHandle, useEffect, useState } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image, findNodeHandle } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useStateWithCallbackLazy } from 'use-state-with-callback';


export const SplashButtons = React.forwardRef((props, ref) => {
    const playImage = require('../images/play.png');
    const infoImage = require('../images/info.png');
    const [continueFrom, setContinueFrom] = useStateWithCallbackLazy(0);

    const playButtonRef = useRef();
    const resumeButtonRef = useRef();
    const infoButtonRef = useRef();

    useImperativeHandle(ref, () => ({
        focus() {
            if (resumeButtonRef.current) {
                resumeButtonRef.current.setNativeProps({
                    hasTVPreferredFocus: true
                });
            } else {
                playButtonRef.current.setNativeProps({
                    hasTVPreferredFocus: true
                });
            }
        }
    }));

    useEffect(() => {
        setContinueFrom(props.continueFrom, () => {
            resumeButtonRef.current.setNativeProps({
                hasTVPreferredFocus: true
            });
        });
    }, [props]);

    useEffect(() => {
        playButtonRef.current.setNativeProps({
            nextFocusRight: findNodeHandle(infoButtonRef.current)
        });
        infoButtonRef.current.setNativeProps({
            nextFocusLeft: findNodeHandle(playButtonRef.current)
        });
    }, []);

    const secondsToTime = (secs) => {
        let hours = Math.floor(secs / (60 * 60));
        let minutes = Math.floor((secs - (hours * 60 * 60)) / 60);
        let seconds = secs - (hours * 60 * 60) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    }

    const onPress = (time) => {
        props.onPlay(time);
    }

    return (
        <View style={styles.buttonContainer}>
            {continueFrom > 0 &&
                <TouchableOpacity
                    activeOpacity={1.0}
                    style={styles.button}
                    onPress={() => onPress(continueFrom)}
                    onFocus={props.onFocus}
                    onBlur={() => { console.log("called onblur") }}
                    ref={resumeButtonRef}
                >
                    <Image source={playImage} style={styles.buttonImage} />
                    <Text style={styles.text}>Resume at {secondsToTime(continueFrom)}</Text>
                </TouchableOpacity>
            }

            <TouchableOpacity
                activeOpacity={1.0}
                style={styles.button}
                onPress={() => onPress(0)}
                onFocus={props.onFocus}
                onBlur={() => { console.log("called onblur") }}
                ref={playButtonRef}
            >
                <Image source={playImage} style={styles.buttonImage} />
                <Text style={styles.text}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={1.0}
                style={styles.button}
                onPress={props.onInfo}
                onFocus={props.onFocus}
                onBlur={() => { console.log("called onblur") }}
                ref={infoButtonRef}
            >
                <Image source={infoImage} style={styles.buttonImage} />
                <Text style={styles.text}>More Info</Text>
            </TouchableOpacity>
        </View>


    );
});

const styles = StyleSheet.create({
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

import React, { useRef, useImperativeHandle, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image, findNodeHandle } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';


export const SplashButtons = React.forwardRef((props, ref) => {
    const playImage = require('../images/play.png');
    const infoImage = require('../images/info.png');

    const playButtonRef = useRef();
    const infoButtonRef = useRef();

    useImperativeHandle(ref, () => ({
        focus() {
            playButtonRef.current.setNativeProps({
                hasTVPreferredFocus: true
            });
        }
    }));

    useEffect(() => {
        playButtonRef.current.setNativeProps({
            nextFocusRight: findNodeHandle(infoButtonRef.current)
        });
        infoButtonRef.current.setNativeProps({
            nextFocusLeft: findNodeHandle(playButtonRef.current)
        });
    }, []);

    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                activeOpacity={1.0}
                style={styles.button}
                onPress={props.onPlay}
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
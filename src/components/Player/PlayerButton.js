
import React, { useRef, useImperativeHandle } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image, findNodeHandle } from 'react-native';

export const PlayerButton = React.forwardRef((props, ref) => {
    const type = props.type;
    const [focused, setFocused] = React.useState(false);
    const buttonRef = useRef();
    let image;
    if (type === 'play') {
        image = require('../../images/play.png');
    } else if (type === 'pause') {
        image = require('../../images/pause.png');
    } else if (type === 'subtitle') {
        image = require('../../images/subtitles.png');
    } else if (type === 'settings') {
        image = require('../../images/setting.png');
    } else if (type === 'info') {
        image = require('../../images/info.png');
    }

    useImperativeHandle(ref, () => ({
        focus() {
            buttonRef.current.setNativeProps({
                hasTVPreferredFocus: true
            });
        }
    }));

    const onFocus = () => {
        setFocused(true);
        if (props.onFocus) {
            props.onFocus();
        }
    }

    const onPress = () => {
        if (props.onPress) {
            props.onPress();
        }
    }


    return (
        <TouchableOpacity 
            underlayColor={'transparent'}
            ref={buttonRef}
            style={[styles.button, props.style]}
            onPress={onPress}
            onFocus={onFocus}
            onBlur={() => setFocused(false)}
            activeOpacity={1.0}
            nextFocusUp={props.blockFocusUp ? findNodeHandle(buttonRef.current) : null}
        >
            <Image
                source={image}
                style={[
                    focused ? styles.active : styles.inactive,
                    styles.buttonImage,
                ]}
                tintColor={'#fff'}
            />
        </TouchableOpacity >

    );
});

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'transparent',
        justifyContent: 'center',

    },

    buttonImage: {
        width: 35,
        height: 35,
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },

    active: {
        transform: [{
            scale: 1.2
        }]
    },

    inactive: {
        transform: [{
            scale: 1
        }]
    }
})

import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { TouchableButton } from './TouchableButton';
const img = { uri: "https://image.tmdb.org/t/p/original//qA3O0xaoesnIAmMWYz0RJyFMc97.jpg" };


export const Splash = React.forwardRef((props, ref) => {
    return (
        <View style={styles.splash}>
        <ImageBackground source={img} resizeMode="cover" style={styles.background}>
            <View style={styles.logoContainer}>
                <Text style={styles.title}>Don't Look UP</Text>
                <Text style={styles.description}>Two astronomers go on a media tour to warn humankind of a planet-killing comet hurtling toward Earth. The response from a distracted world: Meh.</Text>

                <View style={styles.buttonContainer}>
                    <TouchableButton title="Play" icon="play" onFocus={props.onFocus} />
                    <TouchableButton title="More info" icon="info" onFocus={props.onFocus} />

                </View>
            </View>
        </ImageBackground>
    </View>
    );
});

const styles = StyleSheet.create({
    background: {
        flex: 1
    },

    splash: {
        flex: 1,
    },

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
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },

    title: {
        fontSize: 40,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },

    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },

    button: {
        flexDirection: 'row'
    },

    buttonImage: {
        width: 50,
        height: 50,
    }
})
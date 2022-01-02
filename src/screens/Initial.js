import React, { useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react/cjs/react.development';
import Token from '../lib/Token';

export const Initial = ({ navigation }) => {
    useEffect(() => {
        const token = new Token();
        Promise.all([token.isMainTokenValid(), token.isContentTokenValid()]).then(([mainTokenValid, contentTokenValid]) => {
            const signedIn = mainTokenValid && contentTokenValid;
            console.log(`Initial: signedIn: ${signedIn}, mainTokenValid: ${mainTokenValid}, contentTokenValid: ${contentTokenValid}`);
            if (signedIn) {
                navigation.navigate('Main');
            } else {
                if (mainTokenValid) {
                    navigation.navigate('Connect');
                } else {
                    navigation.navigate('MainServer');
                }
            }
        });
    }, []);

    return (
        <></>
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
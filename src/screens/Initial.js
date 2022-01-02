import React, { useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react/cjs/react.development';
import Token from '../lib/Token';

export const Initial = ({ navigation }) => {
    useEffect(() => {
        const token = new Token();
        Promise.all([token.validateMainToken(), token.isContentTokenValid()]).then(([mainToken, contentTokenValid]) => {
            navigation.navigate('Main');
        }).catch(err => {
            console.log(err);
            navigation.navigate('Connect');
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
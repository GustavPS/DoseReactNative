import React, { useRef, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Token from '../lib/Token';

export const Initial = ({ navigation }) => {
    useEffect(() => {
        const token = new Token();
        token.isMainTokenStored().then(isMainTokenStored => {
            if (isMainTokenStored) {
                token.validateContentToken().then(() => {
                    navigation.navigate('Main');
                }).catch((err) => {
                    console.log(err);
                    navigation.navigate('Connect');
                });
            } else {
                navigation.navigate('MainServer');
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
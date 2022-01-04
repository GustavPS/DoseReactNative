
import React, { useRef, useImperativeHandle } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image } from 'react-native';

export const SettingsBox = React.forwardRef((props, ref) => {
    const centered = props.centered;
    const title = props.title;


    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.box,
                    centered ? styles.centered : styles.notCentered,
                ]}>
                <Text style={styles.title}>{title}</Text>
                {props.children}
            </View>
        </View>


    );
});

const styles = StyleSheet.create({
    box: {
        backgroundColor: '#020608',
        minHeight: 350,
        maxHeight: 350,
        minWidth: 300,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,

        elevation: 16,
    },

    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 30,
        textAlign: 'center',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    }
})
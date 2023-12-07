
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        maxHeight: 300,
        minWidth: 200,
        borderRadius: 7,
        padding:0,
        margin: 0,
        color: 'rgba(215, 215, 215, 1)'
    },
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        color: 'white',
        textTransform: 'uppercase',
        marginTop: 5,
        marginBottom: 5
    }
})
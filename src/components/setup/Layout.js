import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import background from '../../images/login_bg.jpg'

export const Layout = ({ title, description, children }) => {
    return (
        <View style={{ flexDirection: "row", backgroundColor: Colors.darker, flex: 1 }}>
            <ImageBackground
                source={background}
                style={styles.background}
                resizeMode='contain'
                blurRadius={3}
            >
                <View style={styles.blur}></View>
            </ImageBackground>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        width: '100%',
        height: '100%',
        position: 'absolute'
    },
    blur: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        height: '100%',
        width: '100%',
    }
})
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export const Layout = ({ title, description, children }) => {
    return (
        <View style={{ flexDirection: "row", backgroundColor: Colors.darker, flex: 1 }}>
            <View style={styles.about}>
                <Text style={styles.aboutTitle}>{title}</Text>
                <Text style={styles.aboutDescription}>{description}</Text>
            </View>
            <View style={styles.veritcalDivider} />
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    about: {
        marginTop: 32,
        marginLeft: 32,
        marginRight: 32
    },
    aboutTitle: {
        color: Colors.lighter,
        fontSize: 24
    },
    aboutDescription: {
        color: Colors.lighter,
        fontSize: 12
    },

    veritcalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: "#ababab",
    }
})
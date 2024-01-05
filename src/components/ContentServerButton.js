import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, FlatList, TouchableWithoutFeedback } from 'react-native';

export const ContentServerButton = (props) => {
    const [active, setActive] = React.useState(false);

    return (
        <TouchableWithoutFeedback
            onPress={() => {
                props.onSelect(props.id);
            }}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            style={[
                active ? styles.active : null
            ]}
        >
            <View style={[
                styles.item,
                active ? styles.active : null
            ]}>
                <Text style={styles.itemTitle}>{props.server_name}</Text>
                <Text style={styles.itemIp}>{props.server_ip}</Text>
            </View>
        </TouchableWithoutFeedback>

    );
};

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#191919',
        marginVertical: 8,
        marginHorizontal: 16,
        paddingHorizontal: 30,
        paddingVertical: 5,
        borderRadius: 10,
        height: 60,
    },
    itemTitle: {
        fontSize: 20,
        color: 'white'
    },
    itemIp: {
        fontSize: 12,
        color: 'whitesmoke'
    },
    active: {
        borderColor: 'whitesmoke',
        borderWidth: 1
    }
})
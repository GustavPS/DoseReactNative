import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, FlatList, Animated, TouchableWithoutFeedback } from 'react-native';
import { Poster } from './Poster';
import { Row } from '@reactseals/react-native-leanback';
const img = { uri: "https://image.tmdb.org/t/p/original//qA3O0xaoesnIAmMWYz0RJyFMc97.jpg" };


export const ContentList = (props) => {
    const { data, useBackdrop } = props;
    const convertDataToRow = (data) => {
        const returnList = [];
        for (const item of data) {
            returnList.push({
                id: item.id,
                cardImageUrl: item.getPosterPath('w500')
            });
        }
        return returnList;
    }
    const rows = convertDataToRow(data);

    const getDataFromRowItem = (selected) => {
        for (const item of data) {
            if (item.id == selected.id) {
                return item;
            }
        }
    }

    return (
        <View style={[styles.container, props.style]}>
            <Text style={styles.rowTitle}>{props.title}</Text>
            <Row
                data={rows}
                attributes={{
                    width: 75,
                    height: 130,
                }}
                style={{ width: '100%', height: 150 }}
                onFocus={(item) => props.onFocus(getDataFromRowItem(item))}
                onPress={(item) => props.onPress(getDataFromRowItem(item))}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: -30 // Margin minus because Row has weird margin that can't be removed
    },

    rowTitle: {
        textTransform: 'capitalize',
        fontSize: 18,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        marginBottom: 5,
        marginLeft: 50
    },
    // Invisible border to prevent scroll from overlapping
    list: {
        borderColor: 'rgba(52, 52, 52, 0.0)',
        borderWidth: 1,
    }
})
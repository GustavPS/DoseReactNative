import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, FlatList, Animated, TouchableWithoutFeedback } from 'react-native';
import { Poster } from './Poster';
import { Row } from '@reactseals/react-native-leanback';
const img = { uri: "https://image.tmdb.org/t/p/original//qA3O0xaoesnIAmMWYz0RJyFMc97.jpg" };


export const ContentList = (props) => {
    const { data, useBackdrop } = props;
    const width = useBackdrop ? 225 : 75;
    const height = useBackdrop ? 100 : 130;

    const convertDataToRow = (data) => {
        const returnList = [];
        for (const item of data) {
            const img = useBackdrop ? item.getBackdropPath('w500') : item.getPosterPath('w500');
            const data = {
                id: item.id,
                cardImageUrl: img,
                displayLiveBadge: false,
            }

            if (item.watchtime > 0 && item.runTime > 0) {
                data.progress = Math.round(item.watchtime / item.runTime * 100);
            }
            returnList.push(data);
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

    const onFocus = (selected) => {
        if (props.onFocus != null) {
            props.onFocus(getDataFromRowItem(selected));
        }
    }

    const onPress = (selected) => {
        if (props.onPress != null) {
            props.onPress(getDataFromRowItem(selected));
        }
    }

    return (
        <View style={[styles.container, props.style]}>
            <Text style={styles.rowTitle}>{props.title}</Text>
            <Row
                data={rows}
                attributes={{
                    width: width,
                    height: height,
                }}
                style={{ width: '100%', height: 150 }}
                onFocus={(item) => onFocus(item)}
                onPress={(item) => onPress(item)}
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
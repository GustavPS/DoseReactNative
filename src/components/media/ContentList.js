import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GalleryItem from '../GalleryItem';
const img = { uri: "https://image.tmdb.org/t/p/original/qA3O0xaoesnIAmMWYz0RJyFMc97.jpg" };


export const ContentList = (props) => {
    const { data, useBackdrop, showTitle, showDescription } = props;
    const width = useBackdrop ? 225 : 75;
    const height = useBackdrop ? 100 : 130;
    let styleHeight = useBackdrop ? 180 : 150;
    if (showDescription) {
        styleHeight += 50;
    }

    const convertDataToRow = (data) => {
        const returnList = [];
        for (const item of data) {
            const img = useBackdrop ? item.getBackdropPath('w500') : item.getPosterPath('w500');
            const data = {
                id: item.id,
                cardImageUrl: img,
                displayLiveBadge: false,
            }
            if (showTitle) {
                data.title = item.getTitle();
            }
            if (showDescription) {
                data.description = item.getDescription();
            }
            if (item.watchtime > 0 && item.runTime > 0) {
                data.progress = Math.round(item.watchtime / item.runTime * 100);
            }
            returnList.push(data);
        }
        return returnList;
    }

    const getDataFromRowItem = (selected) => {
        for (const item of data) {
            if (item.id == selected.id) {
                return item;
            }
        }
    }
    const rows = convertDataToRow(data);

    const onFocus = (selected) => {
        if (props.onFocus != null) {
            props.onFocus(getDataFromRowItem(selected), selected.index === 0);
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
            <ScrollView
                horizontal style={styles.row}
                showsHorizontalScrollIndicator={false}
            >
                {
                    data.map((item, i) => {console.log(item)})
                }
                {data.map((item, i) => (
                    <GalleryItem
                        key={i}
                        item={item}
                        poster={`https://image.tmdb.org/t/p/w500${item.poster}`}
                        index={i}
                        hasTVPreferredFocus={i === 0}
                        onPress={onPress}
                        onFocus={onFocus}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        marginLeft: 50,
        display: 'flex',
        paddingLeft: 45,
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
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: 156,
        width: '100%',
    }
})
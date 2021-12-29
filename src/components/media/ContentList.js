import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, FlatList, Animated } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Poster } from './Poster';
const img = { uri: "https://image.tmdb.org/t/p/original//qA3O0xaoesnIAmMWYz0RJyFMc97.jpg" };


export const ContentList = (props) => {
    const data = props.data;
    /*
    const data = [
        {
            id: 1,
            title: 'Last Night in Soho',
            poster: 'https://image.tmdb.org/t/p/original/5iGVofFc0mCr8aJYsVICm42ThIu.jpg',
        },
        {
            id: 2,
            title: 'Last Night in Soho',
            poster: 'https://image.tmdb.org/t/p/original/5iGVofFc0mCr8aJYsVICm42ThIu.jpg',
        },
        {
            id: 3,
            title: 'Last Night in Soho',
            poster: 'https://image.tmdb.org/t/p/original/5iGVofFc0mCr8aJYsVICm42ThIu.jpg',
        },
        {
            id: 4,
            title: 'Last Night in Soho',
            poster: 'https://image.tmdb.org/t/p/original/5iGVofFc0mCr8aJYsVICm42ThIu.jpg',
        },
        {
            id: 5,
            title: 'Last Night in Soho',
            poster: 'https://image.tmdb.org/t/p/original/5iGVofFc0mCr8aJYsVICm42ThIu.jpg',
        },
        {
            id: 6,
            title: 'Last Night in Soho',
            poster: 'https://image.tmdb.org/t/p/original/5iGVofFc0mCr8aJYsVICm42ThIu.jpg',
        },
        {
            id: 7,
            title: 'Last Night in Soho',
            poster: 'https://image.tmdb.org/t/p/original/5iGVofFc0mCr8aJYsVICm42ThIu.jpg',
        },
    ];
    */

    const renderItem = ({ item }) => (
        <Poster title={item.title} poster={item.getPosterPath('original')} onFocus={props.onFocus} style={styles.poster} />
    )

    return (
        <View style={styles.container}>
                <Text style={styles.rowTitle}>{props.title}</Text>
                <FlatList
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    data={data}
                    autoFocus={true}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    poster: {
        marginRight: 15
    },
    rowTitle: {
        fontSize: 20,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
        marginBottom: 5
    }
})
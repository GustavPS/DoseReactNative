import React, { useRef, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as SecureStore from 'expo-secure-store';
import Token from '../lib/Token';
import { ContentServer } from '../lib/ContentServer';
import { ContentList } from '../components/media/ContentList';
import { Grid } from '@reactseals/react-native-leanback';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

export const Search = ({ navigation }) => {
    const contentServer = new ContentServer();

    /* STATES */
    const [results, setResults] = useStateWithCallbackLazy([]);
    const [contents, setContents] = useStateWithCallbackLazy([]);
    const [showResults, setShowResults] = useStateWithCallbackLazy(true);

    /* REFS */
    const searchRef = useRef();
    const contentsRef = useRef();

    /* STATE REFS */
    contentsRef.current = contents;

    /* FUNCTIONS */
    const onChangeText = (text) => {
        if (text.length > 3) {
            contentServer.initialize().then(() => {
                contentServer.search(text).then(data => {
                    const rows = convertDataToRow(data);
                    setContents(data);
                    setResults(rows, () => {
                        setShowResults(false, () => {
                            setShowResults(true);
                        })
                    });

                });
            });
        }
    };

    const convertDataToRow = (data) => {
        const returnList = [];
        for (const item of data) {
            const img = item.getPosterPath('w500');
            const data = {
                id: item.id,
                cardImageUrl: img,
                displayLiveBadge: false,
            }
            returnList.push(data);
        }
        return returnList;
    }

    
    const getDataFromRowItem = (selected) => {
        for (const item of contentsRef.current) {
            if (item.id == selected.id) {
                return item;
            }
        }
    }

    const onPress = (selected) => {
        const data = getDataFromRowItem(selected);
        if (data.isMovie()) {
            navigation.navigate('MovieInfo', { movie: data });
        } else if (data.isShow()) {
            navigation.navigate('ShowInfo', { show: data });
        }
    }

    return (
        <View style={styles.container}>
            <TouchableHighlight
                onPress={() => {
                    searchRef.current.focus();
                }}
                onFocus={() => {
                    searchRef.current.focus();
                }}
            >
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor={Colors.white}
                    ref={searchRef}
                    onChangeText={onChangeText}
                />
            </TouchableHighlight>

            <View style={styles.searchResult}>
                <Text style={styles.rowTitle}>Search Results</Text>
                {showResults &&
                    <Grid
                        data={results}
                        attributes={{
                            width: 130,
                            height: 200,
                        }}
                        numOfCols={6}
                        style={{ flex: 1 }}
                        onPress={onPress}
                    />
                }
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#020608',
    },

    input: {
        height: 40,
        width: 350,
        margin: 12,
        borderWidth: 1,
        borderColor: '#ababab',
        borderRadius: 5,
        padding: 5,
        color: Colors.lighter,
        alignSelf: 'center',
    },

    searchResult: {
        flex: 1,
    },

    rowTitle: {
        color: Colors.white,
        fontSize: 24,
        marginLeft: 32,
    }
});
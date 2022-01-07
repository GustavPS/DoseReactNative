import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, FlatList, TouchableWithoutFeedback, TouchableOpacity, Image, Animated, findNodeHandle } from 'react-native';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

export const LeftMenu = (props) => {
    /* CONSTANTS */
    const FOCUSED_WIDTH = 130;
    const UNFOCUSED_WIDTH = 50;

    /* STATES */
    const [anythingFocused, setAnythingFocused] = React.useState(false);
    const [focusable, setFocusable] = useStateWithCallbackLazy(false);

    /* REFS */
    const widthAnim = useRef(new Animated.Value(UNFOCUSED_WIDTH)).current;
    const searchButtonRef = useRef();
    const settingsButtonRef = useRef();
    const focusableRef = useRef();
    const anythingFocusedRef = useRef();
    const hideTimeout = useRef();

    /* STATE REFS */
    anythingFocusedRef.current = anythingFocused;
    focusableRef.current = focusable;

    /* USE EFFECTS */
    useEffect(() => {
        setFocusable(props.focus, () => {
            if (focusableRef.current) {
                setFocus();
            } else {
                handleBlur();
            }
        });
    }, [props]);

    /* FUNCTIONS */
    const setFocus = () => {
        searchButtonRef.current.setNativeProps({
            hasTVPreferredFocus: true,
            nextFocusDown: findNodeHandle(settingsButtonRef.current),
            nextFocusLeft: findNodeHandle(searchButtonRef.current),
            nextFocusUp: findNodeHandle(searchButtonRef.current)
        });

        settingsButtonRef.current.setNativeProps({
            nextFocusUp: findNodeHandle(searchButtonRef.current),
            nextFocusLeft: findNodeHandle(settingsButtonRef.current),
            nextFocusDown: findNodeHandle(settingsButtonRef.current),
        });

    }

    const handleFocus = () => {
        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
        }

        if (!anythingFocusedRef.current) {
            Animated.timing(widthAnim, {
                toValue: FOCUSED_WIDTH,
                duration: 300,
                useNativeDriver: false
            }).start();
            setAnythingFocused(true);
        }
    }

    const handleBlur = () => {
        hideTimeout.current = setTimeout(() => {
            Animated.timing(widthAnim, {
                toValue: UNFOCUSED_WIDTH,
                duration: 300,
                useNativeDriver: false
            }).start();
            setAnythingFocused(false);
        }, 100);
    }

    const onPressSearch = () => {
        if (props.openSearch) {
            props.openSearch();
        }
    }

    const renderClickableButtons = () => {
        return (
            <Animated.View
                style={[
                    styles.container,
                    {
                        width: widthAnim
                    }
                ]}
            >
                <LinearGradient
                    // Background Linear Gradient
                    colors={['rgba(0, 0, 0, 0.9)', 'transparent']}
                    style={styles.linearGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={onPressSearch}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        style={styles.touchableButton}
                        ref={searchButtonRef}
                        activeOpacity={1}


                    >
                        <Image source={require('../images/search.png')} style={[styles.searchImage, styles.button]} tintColor={'rgba(225, 221, 223, 0.8)'} />
                        <Text style={[
                            styles.buttonText,
                            {
                                opacity: anythingFocusedRef.current ? 1 : 0
                            }
                        ]}
                        >
                            Search
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log("pressed")}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        style={styles.touchableButton}
                        activeOpacity={1}
                        ref={settingsButtonRef}

                    >
                        <Image source={require('../images/setting.png')} style={[styles.button]} tintColor={'rgba(225, 221, 223, 0.8)'} />
                        <Text style={[
                            styles.buttonText,
                            {
                                opacity: anythingFocusedRef.current ? 1 : 0
                            }
                        ]}
                        >
                            Settings
                        </Text>
                    </TouchableOpacity>

                </View>

            </Animated.View>
        );
    }

    const renderUnclickableButtons = () => {
        return (
            <Animated.View
                style={[
                    styles.container,
                    {
                        width: widthAnim
                    }
                ]}
            >

                <View style={styles.buttonContainer}>
                    <View
                        style={styles.touchableButton}
                    >
                        <Image source={require('../images/search.png')} style={[styles.searchImage, styles.button]} tintColor={'rgba(225, 221, 223, 0.8)'} />
                        <Text style={[
                            styles.buttonText,
                            {
                                opacity: anythingFocusedRef.current ? 1 : 0
                            }
                        ]}
                        >
                            Search
                        </Text>

                    </View>

                    <View
                        style={styles.touchableButton}
                    >
                        <Image source={require('../images/setting.png')} style={[styles.button]} tintColor={'rgba(225, 221, 223, 0.8)'} />
                        <Text style={[
                            styles.buttonText,
                            {
                                opacity: anythingFocusedRef.current ? 1 : 0
                            }
                        ]}
                        >
                            Settings
                        </Text>
                    </View>

                </View>

            </Animated.View>
        );
    }

    return (
        <>
            {focusable ? renderClickableButtons() : renderUnclickableButtons()}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 1,
        flexDirection: 'column',
    },

    linearGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },

    buttonContainer: {
        position: 'absolute',
        top: '50%',
        marginLeft: 5,
        transform: [{ translateY: -50 }],
    },

    button: {
        width: 25,
        height: 25,
        marginVertical: 10,
    },

    touchableButton: {
        opacity: 0.5,
        flexDirection: 'row',
    },

    buttonText: {
        alignSelf: 'center',
        marginLeft: 10,
        fontSize: 12,
        color: 'white',
    }
})
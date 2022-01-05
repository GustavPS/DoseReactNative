
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { TouchableButton } from './TouchableButton';
import { LinearGradient } from 'expo-linear-gradient';
import { SplashButtons } from './SplashButtons';
import { MOVIE_TYPE, SHOW_TYPE } from '../lib/Content/Base';

const img = { uri: "https://image.tmdb.org/t/p/original//qA3O0xaoesnIAmMWYz0RJyFMc97.jpg" };


export const Splash = React.forwardRef((props, ref) => {
    const [backdrop, setBackdrop] = React.useState({});
    const [title, setTitle] = React.useState("");
    const [logo, setLogo] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [buttonsVisible, setButtonsVisible] = React.useState(true);
    const [content, setContent] = React.useState(null);
    const buttonsRef = useRef();

    useImperativeHandle(ref, () => ({
        setSplash(content) {
            setContent(content);
            setBackdrop({ uri: content.getBackdropPath('original') });
            setTitle(content.title);
            const description = content.description.length > 100 ? content.description.substring(0, 100) + "..." : content.description;
            setDescription(description);
            const logo = content.getLogoPath('original');
            if (logo) {
                setLogo(logo);
            } else {
                setLogo("");
            }
        },

        hideButtons() {
            setButtonsVisible(false);
        },

        showButtons() {
            setButtonsVisible(true);
        },


        forceFocus() {
            console.log("FORCING FOCUS")
            if (buttonsRef != null) {
                buttonsRef.current.focus();
            }
        }
    }));

    useEffect(() => {
        if (buttonsVisible) {
            buttonsRef.current.focus();
        }
    }, [buttonsVisible]);

    return (
        <View style={styles.splash}>
            <ImageBackground source={backdrop} resizeMode="cover" style={styles.background}>
                <LinearGradient
                    // Background Linear Gradient
                    colors={['transparent', 'rgba(2,6,8,1)']}
                    style={styles.linearGradient}
                />
                <View style={styles.logoContainer}>
                    {logo != "" ? <Image source={{ uri: logo }} style={styles.logo} /> : <Text style={styles.title}>{title}</Text>}

                    <Text style={styles.description}>{description}</Text>

                    {buttonsVisible &&
                        <SplashButtons
                            ref={buttonsRef}
                            onPlay={props.onPlay}
                            onInfo={props.onInfo}
                            content={content}
                        />
                    }
                </View>
            </ImageBackground>
        </View>
    );
});

const styles = StyleSheet.create({
    background: {
        flex: 1
    },

    splash: {
        flex: 1,
    },
    linearGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },

    logo: {
        width: 500,
        height: 150,
        resizeMode: 'contain',
    },

    logoContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 20,
        marginLeft: 20,
    },

    description: {
        color: 'white',
        fontSize: 12,
        width: '35%',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },

    title: {
        fontSize: 40,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },

    button: {
        flexDirection: 'row'
    },

    buttonImage: {
        width: 50,
        height: 50,
    }
})
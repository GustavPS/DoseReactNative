
import React, { useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';


export const Poster = React.forwardRef((props, ref) => {
    const [focused, setFocused] = React.useState(false);

    const img = { uri: props.poster };

    const onFocus = () => {
        props.onFocus();
        setFocused(true);
        
    }


    return (
        <TouchableHighlight
            onFocus={onFocus}
            onBlur={() => setFocused(false)}
        >
            <ImageBackground
                source={img}
                resizeMode='cover'
                style={[
                    focused ? styles.poster : styles.posterBlurred,
                    props.style
                ]}>
            </ImageBackground>

        </TouchableHighlight>
    );
});

const styles = StyleSheet.create({
    poster: {
        height: 200,
        width: 135
    },
    
    posterBlurred: {
        height: 200,
        width: 135,
        opacity: 0.3
    }
});
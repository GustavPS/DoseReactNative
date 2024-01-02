
import React, { useRef } from 'react';
import { StyleSheet, TouchableHighlight, ImageBackground } from 'react-native';


export const Backdrop = React.forwardRef((props, ref) => {
    const [focused, setFocused] = React.useState(false);

    const img = { uri: props.backdrop };
    console.log(props.poster);
    const onFocus = () => {
        props.onFocus();
        setFocused(true);
    }


    return (
        <TouchableHighlight
            onFocus={onFocus}
            onBlur={() => setFocused(false)}
            onPress={props.onPress}
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
        width: 395
    },
    
    posterBlurred: {
        height: 130,
        width: 75,
        opacity: 0.3
    }
});
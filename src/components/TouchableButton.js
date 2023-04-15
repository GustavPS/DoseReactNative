
import React, { useRef, useImperativeHandle } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';


export const TouchableButton = React.forwardRef((props, ref) => {
  let image;
  if (props.icon === 'play') {
    image = require('../images/play.png');
  } else if (props.icon === 'info') {
    image = require('../images/info.png');
  }

  const buttonRef = useRef();

  useImperativeHandle(ref, () => ({
    focus() {
      buttonRef.current.setNativeProps({
        hasTVPreferredFocus: true
      });
    }
  }));

  return (
    <TouchableOpacity
      activeOpacity={1.0}
      style={styles.button}
      onPress={props.onPress}
      onFocus={props.onFocus}
      ref={buttonRef}
    >
      <Image source={image} style={styles.buttonImage} />
      <Text style={styles.text}>{props.title}</Text>
    </TouchableOpacity>

  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 2.5,
    paddingBottom: 2.5,
    borderRadius: 10,
    backgroundColor: 'whitesmoke',
    marginRight: 10,
    opacity: 0.5
  },

  text: {
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
  },

  buttonImage: {
    width: 15,
    height: 15,
    alignSelf: 'center',
    marginRight: 5,
  }
})
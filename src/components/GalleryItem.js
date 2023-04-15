import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  findNodeHandle,
  Text,
} from 'react-native';

const GalleryItem = ({
  item,
  poster,
  hasTVPreferredFocus,
  blockFocusRight,
  blockFocusLeft,
  onFocus,
  index,
  onPress
}) => {
  const [focus, setFocus] = useState(hasTVPreferredFocus);
  const plusIcon = require('../images/circle-plus.png');

  const handleFocus = () => {
    setFocus(true);
    if (onFocus) {
      onFocus({
        item: item,
        index: index
      });
    }
  };

  const onBlur = () => {
    setFocus(false);
  };

  const handlePress = () => {
    console.log(item);
    if (onPress != null) {
      onPress(item);
    }
  };

  const touchableHighlightRef = useRef(null);
  const onRef = useCallback((ref) => {
    if (ref) {
      touchableHighlightRef.current = ref;
    }
  }, []);

  return (
    <TouchableHighlight
      onFocus={handleFocus}
      onBlur={onBlur}
      onPress={handlePress}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={[styles.wrapper, focus ? styles.wrapperFocused : null]}
      ref={onRef}
      nextFocusRight={
        blockFocusRight ? findNodeHandle(touchableHighlightRef.current) : null
      }
      nextFocusLeft={
        blockFocusLeft ? findNodeHandle(touchableHighlightRef.current) : null
      }>
      <View>
        {poster &&
          <Image style={styles.image} source={{ uri: poster }}/>
        }
        {poster == null &&
          <View style={[styles.image, styles.grayscale]} >
            <Image source={plusIcon} style={styles.plusIcon} tintColor={'#fff'}/>
            <Text style={styles.text}>View more</Text>
          </View>
        }
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderColor: 'transparent',
    borderWidth: 3,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  wrapperFocused: {
    borderColor: 'whitesmoke',
  },
  image: {
    width: 101,
    height: 150,
    borderRadius: 5,
  },
  grayscale: {
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  text: {
    color: 'white',
    textAlign: 'center',
    position: 'absolute',
    bottom: 5,
    fontSize: 11,
    width: '100%'
  },
  plusIcon: {
    width: 50,
    height: 50,
  }
});

export default GalleryItem;
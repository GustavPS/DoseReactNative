import React, { useState, useCallback, useRef } from 'react';
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

  const usingPoster = item.poster != null;

  const img = item.poster != null ? poster : `https://image.tmdb.org/t/p/w500${item.backdrop}`;


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
      <View style={styles.listItem}>
        {usingPoster &&
          <View>
            <Image style={styles.poster} source={{ uri: img }}/>
            {poster == null &&
              <View style={[styles.image, styles.grayscale]} >
                <Image source={plusIcon} style={styles.plusIcon} tintColor={'#fff'}/>
                <Text style={styles.text}>View more</Text>
              </View> 
            }
          </View>
        }
        {!usingPoster &&
          <View>
            {console.log(img)}
            <Image style={styles.backdrop} source={{ uri: img }}/>
            <View style={styles.episodeTitle}>
              <Text style={{color: 'white'}}>{item.title.length > 27 ? item.title.substring(0, 27) +  '...' : item.title}</Text>
            </View>
            <View style={styles.episodeNumber}>
              <Text style={{color: 'white'}}>{item.episodeNumber}</Text>
            </View>
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
    display: 'flex',
    flex: 1
  },
  wrapperFocused: {
    borderColor: 'whitesmoke',
  },
  poster: {
    width: 101,
    height: 150,
    borderRadius: 5,
  },
  backdrop: {
    width: 300,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
    zIndex: -1
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
  },
  episodeTitle: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeNumber: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginRight: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
  }
});


export default GalleryItem;


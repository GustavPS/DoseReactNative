
import React, { useRef, useImperativeHandle, useEffect, useState } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, TouchableOpacity, Image, findNodeHandle } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useStateWithCallbackLazy } from 'use-state-with-callback';


export const SplashButtons = React.forwardRef((props, ref) => {
  const playImage = require('../images/play.png');
  const infoImage = require('../images/info.png');
  //const [continueFrom, setContinueFrom] = useStateWithCallbackLazy(0);
  //const [resumeEpisodeName, setResumeEpisodeName] = useStateWithCallbackLazy('');
  const [content, setContent] = useStateWithCallbackLazy(null);

  const contentRef = useRef();
  contentRef.current = content;
  const nextEpisodeButtonRef = useRef();
  const playButtonRef = useRef();
  const resumeButtonRef = useRef();
  const infoButtonRef = useRef();
  const resumeEpisodeButtonRef = useRef();

  const setFocus = () => {
    if (contentRef.current) {
      if (contentRef.current.isMovie()) {
        if (contentRef.current.watchtime > 0) {
          resumeButtonRef.current.setNativeProps({
            hasTVPreferredFocus: true
          });
        } else {
          playButtonRef.current.setNativeProps({
            hasTVPreferredFocus: true
          });
        }
      } else if (contentRef.current.isShow()) {
        if (contentRef.current.nextEpisode) {
          nextEpisodeButtonRef.current.setNativeProps({
            hasTVPreferredFocus: true
          });
        } else if (contentRef.current.resumeEpisode) {
          resumeEpisodeButtonRef.current.setNativeProps({
            hasTVPreferredFocus: true
          });
        } else {
          infoButtonRef.current.setNativeProps({
            hasTVPreferredFocus: true
          });
        }
      } else if (contentRef.current.isEpisode()) {
        playButtonRef.current.setNativeProps({
          hasTVPreferredFocus: true
        });
      }
    }
  }

  useImperativeHandle(ref, () => ({
    focus() {
      setFocus();
    }
  }));

  useEffect(() => {
    setContent(props.content, () => {
      setFocus();
    });
  }, [props]);

  useEffect(() => {
    if (playButtonRef.current != undefined && infoButtonRef.current != undefined) {
      playButtonRef.current.setNativeProps({
        nextFocusRight: findNodeHandle(infoButtonRef.current)
      });
      infoButtonRef.current.setNativeProps({
        nextFocusLeft: findNodeHandle(playButtonRef.current)
      });
    }
  }, []);

  const secondsToTime = (secs) => {
    let hours = Math.floor(secs / (60 * 60));
    let minutes = Math.floor((secs - (hours * 60 * 60)) / 60);
    let seconds = secs - (hours * 60 * 60) - (minutes * 60);

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return `${hours > 0 ? hours + ':' : ''}${minutes}:${seconds}`;
  }

  const onPress = (time) => {
    props.onPlay(time);
  }

  const renderMovieButtons = () => {
    return (
      <View style={styles.buttonContainer}>
        {content != null && content.watchtime > 0 &&
          <TouchableOpacity
            activeOpacity={1.0}
            style={styles.button}
            onPress={() => onPress(content.watchtime)}
            onFocus={props.onFocus}
            ref={resumeButtonRef}
          >
            <Image source={playImage} style={styles.buttonImage} />
            <Text style={styles.text}>Resume at {secondsToTime(content.watchtime)}</Text>
          </TouchableOpacity>
        }

        <TouchableOpacity
          activeOpacity={1.0}
          style={styles.button}
          onPress={() => onPress(0)}
          onFocus={props.onFocus}
          ref={playButtonRef}
        >
          <Image source={playImage} style={styles.buttonImage} />
          <Text style={styles.text}>Play</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1.0}
          style={styles.button}
          onPress={props.onInfo}
          onFocus={props.onFocus}
          ref={infoButtonRef}
        >
          <Image source={infoImage} style={styles.buttonImage} />
          <Text style={styles.text}>More Info</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderShowButtons = () => {
    return (
      <View style={styles.buttonContainer}>
        {content != null && content.nextEpisode &&
          <TouchableOpacity
            activeOpacity={1.0}
            style={styles.button}
            onPress={() => onPress(0)}
            onFocus={props.onFocus}
            ref={nextEpisodeButtonRef}
          >
            <Image source={playImage} style={styles.buttonImage} />
            <Text style={styles.text}>Play {content.getNextEpisodeName()}</Text>
          </TouchableOpacity>
        }

        {content != null && content.resumeEpisode &&
          <TouchableOpacity
            activeOpacity={1.0}
            style={styles.button}
            onPress={() => onPress(content.getResumeEpisodeTime())}
            onFocus={props.onFocus}
            ref={resumeEpisodeButtonRef}
          >
            <Image source={playImage} style={styles.buttonImage} />
            <Text style={styles.text}>Resume {content.getResumeEpisodeName()}</Text>
          </TouchableOpacity>
        }

        <TouchableOpacity
          activeOpacity={1.0}
          style={styles.button}
          onPress={props.onInfo}
          onFocus={props.onFocus}
          ref={infoButtonRef}
        >
          <Image source={infoImage} style={styles.buttonImage} />
          <Text style={styles.text}>More Info</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderEpisodeButtons = () => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={1.0}
          style={styles.button}
          onPress={() => onPress(content.watchtime)}
          onFocus={props.onFocus}
          ref={playButtonRef}
        >
          <Image source={infoImage} style={styles.buttonImage} />
          <Text style={styles.text}>{content.watchtime > 0 ? `Resume from ${secondsToTime(content.watchtime)}` : "Play"}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>
      {content != null && content.isMovie() && renderMovieButtons()}
      {content != null && content.isShow() && renderShowButtons()}
      {content != null && content.isEpisode() && renderEpisodeButtons()}
    </>
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
  },


  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
})
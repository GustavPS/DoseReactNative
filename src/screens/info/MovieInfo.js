import React, { useRef, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, Image, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ContentServer } from '../../lib/ContentServer';
import { ContentList } from '../../components/media/ContentList';
import { useIsFocused } from '@react-navigation/native';

export const MovieInfo = ({ route, navigation }) => {
  const { movie } = route.params;
  const logoPath = movie.getLogoPath('original');
  const posterPath = movie.getPosterPath('original');
  const title = movie.getTitle();
  const description = movie.getDescription();
  const playImage = require('../../images/play.png');
  const contentServer = new ContentServer();

  const [movieMetadata, setMovieMetadata] = React.useState(null);
  const [recommendedMovies, setRecommendedMovies] = React.useState([]);
  const [resumeTime, setResumeTime] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const isFocused = useIsFocused();

  const loadMovieMetadata = () => {
    contentServer.getMovieMetadata(movie).then(metadata => {
      if (metadata.currentTime != undefined) {
        setResumeTime(metadata.currentTime);
      } else {
        setResumeTime(0);
      }
      setMovieMetadata(metadata);
    });
  }

  const loadRecommendedMovies = () => {
    contentServer.getRecommendedMovies(movie).then(movies => {
      setRecommendedMovies(movies);
    });
  }

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

  const onPlay = (startTime) => {
    navigation.navigate('Player', { content: movie, startTime: startTime });
  }

  useEffect(() => {
    if (isFocused) {
      contentServer.initialize().then(() => {
        loadMovieMetadata();
        loadRecommendedMovies();
      });
    }
  }, [isFocused]);

  return (
    <View style={styles.page}>
      <ImageBackground
        source={{ uri: movie.getBackdropPath('original') }}
        resizeMode="cover"
        style={styles.backdrop}
      >
        <View style={styles.opacity} />
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Poster */}
            <Image source={{ uri: posterPath }} style={styles.poster} />


            <View style={styles.information}>
              {/* Logo / Title*/}
              {logoPath != "" ? <Image source={{ uri: logoPath }} style={styles.logo} /> : <Text style={styles.title}>{title}</Text>}

              {/* Description */}
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {/* Play Button */}
            <TouchableOpacity
              activeOpacity={1.0}
              style={styles.button}
              onBlur={() => { console.log("called onblur") }}
              onPress={() => onPlay(0)}
            >
              <Image source={playImage} style={styles.buttonImage} />
              <Text style={styles.text}>Play</Text>
            </TouchableOpacity>

            {/* Continue watching button */}
            {resumeTime != 0 &&
              <TouchableOpacity
                activeOpacity={1.0}
                style={styles.button}
                onBlur={() => { console.log("called onblur") }}
                onPress={() => onPlay(resumeTime)}
              >
                <Image source={playImage} style={styles.buttonImage} />
                <Text style={styles.text}>Resume at {secondsToTime(resumeTime)}</Text>
              </TouchableOpacity>
            }
          </View>

          {/* Recommended movies */}
          {recommendedMovies.length > 0 &&
            <View style={styles.recommended}>
              <Text style={styles.recommendedTitle}>Recommended</Text>
              <ContentList
                data={recommendedMovies}
                style={styles.recommendedList}
                onPress={(movie) => navigation.push('MovieInfo', { movie: movie })}
                useBackdrop={true} />
            </View>
          }

        </View>
      </ImageBackground>

    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  container: {
    margin: 35,
  },

  content: {
    flexDirection: 'row',
  },

  backdrop: {
    flex: 1,
  },

  opacity: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  logo: {
    width: 400,
    height: 100,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 40,
    color: 'white'
  },

  poster: {
    width: 140,
    height: 200
  },

  information: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 20,
  },

  description: {
    fontSize: 12,
    width: '70%',
    color: 'white'
  },

  recommendedTitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: -10,
    color: 'white',
    fontWeight: 'bold',
  },

  recommendedList: {
    marginLeft: -55
  },



  // Buttons
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
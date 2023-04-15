import React, { useRef, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, ImageBackground, Image, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ContentServer } from '../../lib/ContentServer';
import { ContentList } from '../../components/media/ContentList';
import { Season } from '../../lib/Content/Season';

export const ShowInfo = ({ route, navigation }) => {
  const { show } = route.params;
  const logoPath = show.getLogoPath('original');
  const posterPath = show.getPosterPath('original');
  const title = show.getTitle();
  const description = show.getDescription();
  const contentServer = new ContentServer();
  const [seasons, setSeasons] = React.useState([]);

  const loadShowMetadata = () => {
    console.log("HALLLOO")
    contentServer.getShowMetadata(show).then(metadata => {
      const seasonsToAdd = [];
      for (const season of metadata.seasons) {
        seasonsToAdd.push(new Season(season.name, season.season_id, season.poster_path, show.backdrop));
      }
      setSeasons(seasonsToAdd);
    });
  }


  useEffect(() => {
    contentServer.initialize().then(() => {
      loadShowMetadata();
    });
  }, []);

  return (
    <View style={styles.page}>
      <ImageBackground
        source={{ uri: show.getBackdropPath('original') }}
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

          {/* Seasons */}
          {seasons.length > 0 &&
            <View style={styles.seasons}>
              <Text style={styles.seasonsTitle}>Seasons</Text>
              <ContentList
                data={seasons}
                style={styles.seasonsList}
                onPress={(season) => navigation.push('SeasonInfo', { season: season, show: show })}
              />
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

  seasonsTitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: -10,
    color: 'white',
    fontWeight: 'bold',
  },

  seasonsList: {
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
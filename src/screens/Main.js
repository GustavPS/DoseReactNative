import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ContentServer } from '../lib/ContentServer';
import Video from 'react-native-video';
import { LinearGradient } from 'expo-linear-gradient';
import { GalleryList } from '../components/GalleryList';
import { useIsFocused } from '@react-navigation/native';


export const Main = ({ navigation }) => {
  const [sections, setSections] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const isFocused = useIsFocused();

  let changeBackgroundTimeout = null;
  const contentServer = new ContentServer();

  useEffect(() => {
    if (isFocused) {
      console.log('Updating data');
      contentServer.initialize().then(async () => {
        const sectionList = await contentServer.listAllSections();
        setSections(removeEmptySections(sectionList));
      });
    }
  }, [isFocused]);


  const removeEmptySections = (sections) => {
    return sections.filter(section => section.content.length > 0);
  }

  const onFocusContent = async ({ item }) => {
    clearTimeout(changeBackgroundTimeout);
    changeBackgroundTimeout = setTimeout(async () => {
      if (item.isMovie() && item.haveTrailer) {
        console.log('Changing trailer');
        const trailer = await contentServer.getMovieTrailer(item);
        setTrailer(trailer);
      } else {
        console.log('Changing image');
        setTrailer(null);
      }
      setSelectedContent(item);
    }, 300);
  }

  const onItemSelected = (item) => {
    if (item.isMovie()) {
      navigation.navigate('MovieInfo', {
        movie: item
      });
    } else if (item.isShow()) {
      navigation.navigate('ShowInfo', {
        show: item
      });
    } else if (item.isEpisode()) {
      // TODO: Start at current time
      navigation.navigate('Player', {
        content: item,
        startTime: item.watchtime
      });
    }
  }

  return (
    <View style={styles.container}>
      {selectedContent != null &&
        <View
          style={styles.background}
        >
          {trailer != null &&
            <Video
              focusable={false}
              source={{
                uri: trailer
              }}
              style={styles.trailer}
              paused={false}
              resizeMode='cover'
              repeat={true}
            />
          }
          {trailer == null &&
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/original/${selectedContent.backdrop}` }}
              style={styles.trailer}
              resizeMode='contain'
            />
          }

          <View style={styles.textContainer}>
            {selectedContent.logo != null &&
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/original/${selectedContent.logo}` }}
                style={styles.logo}
                resizeMode='contain'
              />
            }
            {selectedContent.logo == null && selectedContent.isEpisode() &&
              <>
                <Text style={styles.title}>{selectedContent.showTitle}</Text>
                <Text style={styles.subtitle}>{selectedContent.getTitle()}</Text>
              </>
            }
            {selectedContent.logo == null && !selectedContent.isEpisode() &&
              <Text style={styles.title}>{selectedContent.getTitle()}</Text>
            }
            <Text style={styles.description}>{selectedContent.description}</Text>
          </View>
        </View>
      }
      <LinearGradient
        colors={['#00000000', '#000000']}
        style={{ height: '100%', width: '100%' }}>
      </LinearGradient>

      <GalleryList
        sections={sections}
        style={styles.sections}
        onFocus={onFocusContent}
        onItemSelected={onItemSelected}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  trailer: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  container: {
    flex: 1,
    backgroundColor: '#020608'
  },
  textContainer: {
    position: 'absolute',
    zIndex: 100,
    left: 25,
    top: 25,
    width: '40%',
  },
  description: {
    color: 'white',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logo: {
    width: 200,
    height: 100,
  },
  sections: {
    top: '60%',
    position: 'absolute',
    height: 440
  },
  title: {
    fontSize: 40,
    color: 'white'
  },
  subtitle: {
    color: 'white',
    fontSize: 15,
    marginBottom: 10
  }
})
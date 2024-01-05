import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ContentServer } from '../lib/ContentServer';
import { GalleryList } from '../components/GalleryList';
import { useNavigation } from '@react-navigation/native';
import { Splash } from '../components/Splash';
import LongPressOverlay from '../components/LongPressOverlay';
import LinearGradient from 'react-native-linear-gradient';


export const Main = ({ navigation }) => {
  const [sections, setSections] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const nav = useNavigation();
  const [isScreenFocused, setIsScreenFocused] = useState(false);
  let changeBackgroundTimeout = null;
  const contentServer = new ContentServer();


  useEffect(() => {
    const unsubscribe = nav.addListener('focus', () => {
      setIsScreenFocused(true);
    });

    return unsubscribe;
  }, [nav]);


  useEffect(() => {
    if (isScreenFocused) {
      console.log('Updating data');
      contentServer.initialize().then(async () => {
        let sectionList = await contentServer.listAllSections();
        setSections(orderSections(removeEmptySections(sectionList)));
        setIsScreenFocused(false); // Reset the state after updating the data
      });
    }
  }, [isScreenFocused]);

  

  const removeEmptySections = (sections) => {
    return sections.filter(section => section.content.length > 0);
  }

  const orderSections = (sections) => {
    // magic to make sure ongoing stuff is at the top
    const orderedSections = [];
    if (sections.filter(section => section.title === "Ongoing movies").length > 0) {
      orderedSections.push(...sections.filter(section => section.title === "Ongoing movies"));
    }
    if (sections.filter(section => section.title === "Ongoing episodes").length > 0) {
      orderedSections.push(...sections.filter(section => section.title === "Ongoing episodes"));
    }
    orderedSections.push(...sections.filter(section => section.title != "Ongoing episodes" && section.title != "Ongoing movies"))
    return orderedSections;
  }

  const onFocusContent = async ({ item }) => {
    clearTimeout(changeBackgroundTimeout);
    changeBackgroundTimeout = setTimeout(async () => {
      if (item.isMovie() && item.haveTrailer) {
        const trailer = await contentServer.getMovieTrailer(item);
        setTrailer(trailer);
      } else {
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
      navigation.navigate('Player', {
        content: item,
        startTime: item.watchtime
      });
    }
  }

  const onViewMore = (genre, type) => {
    navigation.navigate('Genre', {
      genre: genre,
      type: type
    });
  }

  return (
    <View style={styles.container}>
      <Splash
        item={selectedContent}
        trailer={trailer}
      />

      <GalleryList
        sections={sections}
        style={styles.sections}
        onFocus={onFocusContent}
        onItemSelected={onItemSelected}
        onViewMore={onViewMore}
      />
      
        
      <LinearGradient  start={{x: 0, y: 0.85}} end={{x: 0, y: 1}} colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']} style={styles.fadeOverlay}>
      </LinearGradient>
      
      
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
    height: 400,
    display: 'flex',
  },
  title: {
    fontSize: 40,
    color: 'white'
  },
  subtitle: {
    color: 'white',
    fontSize: 15,
    marginBottom: 10
  },
  fadeOverlay: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  }
})
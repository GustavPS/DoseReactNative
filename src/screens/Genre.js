import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react"
import { ContentServer } from "../lib/ContentServer";
import { ScrollView, StyleSheet, View } from "react-native";
import GalleryItem from "../components/GalleryItem";
import { Splash } from "../components/Splash";
import { GalleryList } from "../components/GalleryList";

export const Genre = ({ navigation, route }) => {
  const { genre, type } = route.params;

  const [content, setContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [trailer, setTrailer] = useState(null);

  const isFocused = useIsFocused();

  let changeBackgroundTimeout = null;
  const contentServer = new ContentServer();

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = () => {
    contentServer.initialize().then(async () => {
      const contentList = type === 'movies' ?
        await contentServer.getMoviesByGenre(genre, true) :
        await contentServer.getShowsByGenre(genre, true);

      // Split the list into 7s to show it correctly on the screen
      const data = contentList.content;
      const result = [];
      const chunkSize = 7;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.splice(0, chunkSize);
        result.push({
          content: chunk
        });
      }

      setContent(result);
    });
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
    }
  }


  return (
    <View style={styles.container}>
      <Splash
        item={selectedContent}
        trailer={trailer}
      />

      <GalleryList
        sections={content}
        style={styles.sections}
        hideViewMoreButton={true}
        onFocus={onFocusContent}
        onItemSelected={onItemSelected}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020608'
  },
  scroll: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  sections: {
    top: '40%',
    position: 'absolute',
    width: '100%',
    height: 312,
  },
  invisibleFooter: {
    height: 500,
    width: 300
  }
})
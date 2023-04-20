import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react"
import { ContentServer } from "../lib/ContentServer";
import { ScrollView, StyleSheet, View } from "react-native";
import GalleryItem from "../components/GalleryItem";
import { Splash } from "../components/Splash";
import { GalleryList } from "../components/GalleryList";

export const Genre = ({ route }) => {
  const { genre, type } = route.params;

  const [content, setContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [trailer, setTrailer] = useState(null);

  const isFocused = useIsFocused();

  let changeBackgroundTimeout = null;
  const contentServer = new ContentServer();

  useEffect(() => {
    if (isFocused) {
      console.log('type: ' + type)
      contentServer.initialize().then(async () => {
        const contentList = type === 'movie' ?
          await contentServer.getMoviesByGenre(genre) :
          await contentServer.getShowsByGenre(genre);

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
  }, [isFocused]);


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
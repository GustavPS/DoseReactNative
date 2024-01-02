import React, { useEffect, useRef } from "react";
import { Animated, FlatList, StyleSheet, View } from "react-native"
import Gallery from "./Gallery";

export const GalleryList = ({ sections, style, onFocus, onItemSelected, onViewMore, hideViewMoreButton }) => {
  const sectionListRef = useRef();
  const ITEM_HEIGHT = 186;
  const FIRST_SCROLL = 166;

  const handleItemFocus = ({ item, index }) => {
    let offset = ITEM_HEIGHT * index;
    sectionListRef.current.scrollToOffset({
      offset, 
      animated: true,
      useNativeDriver: true
      
    });

    if (onFocus != null) {
      onFocus({
        item, index
      });
    }
  }

  const onViewMoreFocus = ({ _item, index }) => {
    sectionListRef.current.scrollToIndex({
      animated: true,
      index: index,
      useNativeDriver: true
    });
  }

  const getSectionTitle = (section) => {
    return section.type === 'shows' ? `${section.title} Shows` : section.title;
  }

  return (
    <FlatList
      hasTVPreferredFocus={true}
      style={[styles.sections, style]}
      showsVerticalScrollIndicator={false}
      decelerationRate={0}
      data={sections}
      keyExtractor={(item, index) => index}
      ref={sectionListRef}
      scrollEnabled={false}
      initialScrollIndex={0}
      initialNumToRender={4}
      removeClippedSubviews={false}
      getItemLayout={(data, index) => (
        {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
      )}
      onScrollToIndexFailed={(info) => console.log(info)}
      renderItem={({ item, index }) => {
        return (
          <Gallery
            title={getSectionTitle(item)}
            items={item.content}
            rowNumber={index}
            index={index}
            onFocus={handleItemFocus}
            onViewMoreFocus={onViewMoreFocus}
            onViewMorePress={() => onViewMore(item.title, item.type)}
            onPress={onItemSelected}
            hideViewMoreButton={hideViewMoreButton || !item.canLoadMore}
          />
        )
      }}
      ListFooterComponent={() => <View style={styles.footer} />}
    />
  )
}

// Footer to make the last row visible
const styles = StyleSheet.create({
  sections :{
    flex: 1
    
  },
  footer: {
    height: 300,
    width: 200
  }
})
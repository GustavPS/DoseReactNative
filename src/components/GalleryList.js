import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native"
import Gallery from "./Gallery";

export const GalleryList = ({ sections, style, onFocus, onItemSelected, onViewMore, hideViewMoreButton }) => {
  const sectionListRef = useRef();

  const handleItemFocus = ({ item, index }) => {
    sectionListRef.current.scrollToIndex({
      animated: true,
      index: index
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
      index: index
    });
  }

  const getSectionTitle = (section) => {
    return section.type === 'shows' ? `${section.title} Shows` : section.title;
  }

  return (
    <FlatList
      style={[styles.sections, style]}
      showsVerticalScrollIndicator={false}
      decelerationRate={0}
      data={sections}
      keyExtractor={(item, index) => index}
      ref={sectionListRef}
      scrollEnabled={false}
      initialScrollIndex={0}
      removeClippedSubviews={false}
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
  sections: {
    flex: 1
  },
  footer: {
    height: 300,
    width: 200
  }
})
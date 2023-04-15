import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import GalleryItem from './GalleryItem';

const Gallery = ({ rowNumber, items, title, index, onFocus, onViewMoreFocus, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal style={styles.row}
        showsHorizontalScrollIndicator={false}
      >
        {items.map((item, i) => (
          <GalleryItem
            key={i}
            item={item}
            poster={`https://image.tmdb.org/t/p/w500/${item.poster}`}
            hasTVPreferredFocus={rowNumber === 0 && i === 0}
            blockFocusLeft={i === 0}
            index={index}
            onPress={onPress}
            onFocus={onFocus}
          />
        ))}

        <GalleryItem
          key={items.length + 1}
          index={index}
          blockFocusRight={true}
          onFocus={onViewMoreFocus}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10
  },
  title: {
    marginLeft: 15,
    marginBottom: 2,
    fontSize: 13,
    color: 'whitesmoke',
    textTransform: 'capitalize'
  }
});

export default Gallery;
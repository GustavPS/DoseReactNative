import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import Video from "react-native-video"

export const Splash = ({ item, trailer }) => {


  return (
    <>
      {item != null &&
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
              source={{ uri: `https://image.tmdb.org/t/p/original/${item.backdrop}` }}
              style={styles.trailer}
              resizeMode='contain'
            />
          }

          <View style={styles.textContainer}>
            {item.logo != null &&
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/original/${item.logo}` }}
                style={styles.logo}
                resizeMode='contain'
              />
            }
            {item.logo == null && item.isEpisode() &&
              <>
                <Text style={styles.title}>{item.showTitle}</Text>
                <Text style={styles.subtitle}>{item.getTitle()}</Text>
              </>
            }
            {item.logo == null && !item.isEpisode() &&
              <Text style={styles.title}>{item.getTitle()}</Text>
            }
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      }
      <LinearGradient
        colors={['#00000000', '#000000']}
        style={{ height: '100%', width: '100%' }}>
      </LinearGradient>
    </>
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
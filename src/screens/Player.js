import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Video, { TextTrackType } from 'react-native-video';
import { ContentServer } from '../lib/ContentServer';
import { DirectplayVideo } from '../components/VideoPlayer/DirectplayVideo';
import { HlsVideo } from '../components/VideoPlayer/HlsVideo';

export const Player = ({ route, navigation }) => {
  const { startTime, haveReloaded } = route.params;

  const [content, setContent] = useState(route.params.content);

  const [directplayVideoSource, setDirectplayVideoSource] = useState(null);
  const [hlsVideoSource, setHlsVideoSource] = useState(null);
  const [usingDirectplay, setUsingDirectplay] = useState(true);
  const [subtitles, setSubtitles] = useState([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [resolutions, setResolutions] = useState([]);
  const [currentTime, setCurrentTime] = useState(startTime ?? 0);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [nextEpisodeExists, setNextEpisodeExists] = useState(false);

  const hlsPlayerRef = useRef(null);
  const directplayPlayerRef = useRef(null);

  const contentServer = new ContentServer();

  useEffect(() => {
    setShowNextEpisode(false);
    contentServer.initialize().then(() => {
      setup();
    });
  }, [content]);

  /**
  * Get a list of subtitles that react-native-video understands
  * @param {Subtitle} subtitles - Subtitle list that content-server responds with
   */
  const formatSubtitles = async (subtitles, content, contentServer) => {
    const url = await contentServer.getUrl();
    const token = await contentServer.getAccessToken();

    return subtitles.map(subtitle => {
      return {
        title: subtitle.language,
        language: subtitle.language,
        type: TextTrackType.VTT,
        uri: content.getSubtitleUrl(url, token, subtitle.id)
      }
    })
  }

  const findPreferredLanguage = (languages) => {
    const preferredLanguage = languages.find(language => language.shortName == "eng");
    if (preferredLanguage) {
      return preferredLanguage;
    }
    console.log('No preferred language found, defaulting to first language');
    return languages[0];
  }

  const getDirectplaySource = (url, accessToken, preferredLanguage) => {
    return {
      uri: content.getDirectplaySource(url, accessToken, preferredLanguage),
      type: 'mp4'
    }
  }

  const getHlsSource = (url, accessToken, preferredLanguage) => {
    return {
      uri: content.getSource(url, accessToken, preferredLanguage),
      type: 'm3u8'
    }
  }

  const setup = async () => {
    const [accessToken, url, languages, subtitles, resolutions] = await Promise.all([
      contentServer.getAccessToken(),
      contentServer.getUrl(),
      contentServer.getContentLanguages(content),
      contentServer.getSubtitles(content),
      contentServer.getResolutions(content)
    ]);

    const formatedSubtitles = await formatSubtitles(subtitles, content, contentServer);
    const availableResolutions = resolutions.resolutions;
    if (resolutions.directplay) {
      availableResolutions.push('Directplay');
    }

    setSubtitles(formatedSubtitles);
    setResolutions(availableResolutions);

    if (resolutions.directplay) {
      setupDirectplay(url, accessToken, languages);
    } else {
      setupHls(url, accessToken, languages);
    }

    if (content.isEpisode()) {
      const nextEpisode = await contentServer.getNextEpisode(content);
      setNextEpisodeExists(nextEpisode !== false);
    }
  }

  const setupDirectplay = (url, accessToken, languages) => {
    const preferredLanguage = findPreferredLanguage(languages);
    const directplay = getDirectplaySource(url, accessToken, preferredLanguage.stream_index);

    setUsingDirectplay(true);
    setDirectplayVideoSource(directplay);
  }

  const setupHls = (url, accessToken, languages) => {
    const preferredLanguage = findPreferredLanguage(languages);
    const hls = getHlsSource(url, accessToken, preferredLanguage.stream_index);

    setUsingDirectplay(false);
    setHlsVideoSource(hls);
  }

  const switchToHls = async ({ resolution }) => {
    setDirectplayVideoSource(null);

    const [accessToken, url, languages] = await Promise.all([
      contentServer.getAccessToken(),
      contentServer.getUrl(),
      contentServer.getContentLanguages(content)
    ]);
    setupHls(url, accessToken, languages);
    hlsPlayerRef.current.changeResolution(resolution)
  }

  const switchToDirectplay = async () => {
    setHlsVideoSource(null);

    const [accessToken, url, languages] = await Promise.all([
      contentServer.getAccessToken(),
      contentServer.getUrl(),
      contentServer.getContentLanguages(content)
    ]);
    setupDirectplay(url, accessToken, languages);
  }

  // Seek to requested time and select previous selected subtitle if exists
  const onLoad = () => {
    const player = usingDirectplay ? directplayPlayerRef.current : hlsPlayerRef.current;
    // Find selected subtitle index and use that if found
    // TODO: Make a function that first tries to find direct url match,
    // If not found, try to search for same language,
    // If not found, try to search for english
    if (selectedSubtitle != null) {
      for (let i = 0; i < subtitles.length; i++) {
        if (subtitles[i].uri === selectedSubtitle.uri) {
          player.selectSubtitle(i);
          break;
        }
      }
    }
    player.seek(currentTime);
  }

  const onVideoProgress = async (currentTime, duration) => {
    setCurrentTime(currentTime);

    const groupId = !usingDirectplay ? await contentServer.getTranscodingGroupId(content) : undefined;
    contentServer.updateWatchtime(content, groupId, currentTime, duration)

    if (duration - currentTime <= 40 && !showNextEpisode && nextEpisodeExists) {
      setShowNextEpisode(true);
    }
  }

  const playNextEpisode = async () => {
    const nextEpisode = await contentServer.getNextEpisode(content);
    setHlsVideoSource(null);
    setDirectplayVideoSource(null);
    setCurrentTime(0);
    setContent(nextEpisode);
  }

  return (
    <View style={styles.container}>
      {usingDirectplay &&
        <DirectplayVideo
          source={directplayVideoSource}
          style={styles.videoPlayer}
          subtitles={subtitles}
          resolutions={resolutions}
          onChangeResolution={switchToHls}
          onSelectSubtitle={setSelectedSubtitle}
          onVideoProgress={onVideoProgress}
          onLoad={onLoad}
          ref={directplayPlayerRef}
        />
      }
      {!usingDirectplay &&
        <HlsVideo
          source={hlsVideoSource}
          style={styles.videoPlayer}
          subtitles={subtitles}
          resolutions={resolutions}
          onDirectplay={switchToDirectplay}
          onSelectSubtitle={setSelectedSubtitle}
          onVideoProgress={onVideoProgress}
          onLoad={onLoad}
          ref={hlsPlayerRef}
        />
      }

      {showNextEpisode &&
        <TouchableOpacity
          style={styles.nextEpisodeOuter}
          activeOpacity={1.0}
          hasTVPreferredFocus={true}
          onPress={playNextEpisode}
        >
          <Text style={styles.nextEpisodeText}>Next episode</Text>
        </TouchableOpacity>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  videoPlayer: {
    flex: 1
  },

  nextEpisodeOuter: {
    backgroundColor: 'black',
    borderRadius: 5,
    width: 100,
    position: 'absolute',
    bottom: 100,
    right: 50,
    opacity: 0.5
  },
  nextEpisodeText: {
    alignSelf: 'center',
    color: 'white',
    opacity: 1,
    margin: 2
  }

})
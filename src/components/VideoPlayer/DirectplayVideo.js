import React, { Component, createRef } from "react";
import Video, { TextTrackType } from "react-native-video";
import { ContentServer } from "../../lib/ContentServer";
import { StyleSheet, View, Text } from 'react-native';
import { VideoControls } from "./VideoControls";

export class DirectplayVideo extends Component {

  constructor(props) {
    super(props);
    this.player = createRef(null);

    this.state = {
      currentTime: 0,
      duration: 0,
      paused: false,
      subtitle: null, // active subtitle
      textTracks: [] // Used to ignore the built in subtitles in the file
    }

    this.onVideoProgress = this.onVideoProgress.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onVideoError = this.onVideoError.bind(this);
    this.seek = this.seek.bind(this);
    this.selectSubtitle = this.selectSubtitle.bind(this);
    this.disableSubtitles = this.disableSubtitles.bind(this);
    this.changeResolution = this.changeResolution.bind(this);
    this.onLoad = this.onLoad.bind(this);
  }

  onLoad(data) {
    this.setState({
      textTracks: data.textTracks
    }, () => {
      if (this.props.onLoad) {
        this.props.onLoad();
      }
    });
  }

  onPlay() {
    this.setPaused(false);
  }

  onPause() {
    this.setPaused(true);
  }

  seek(newTime) {
    console.log(`[DIRECTPLAY] Seeking to ${newTime}`)
    this.setState({
      currentTime: newTime
    });
    this.player.current.seek(newTime);
    this.onPlay();
  }

  setPaused(paused) {
    this.setState({
      paused: paused
    });
  }

  onVideoProgress(progress) {
    this.setState({
      currentTime: progress.currentTime,
      duration: progress.seekableDuration
    });

    this.props.onVideoProgress(progress.currentTime, progress.seekableDuration);
  }

  onVideoError(error) {
    console.log('[DIRECTPLAY] error');
    console.log(error);
  }

  selectSubtitle(index) {
    /**
     * "Our" subtitles are placed at the end of the videos textTrack.
     * If the video have, for example, 3 embedded subs and we provide 2
     * that we want to show the list will look like:
     *  [embedded1, embedded2, embedded3, real1, real2]
     * We only want to be able to choose real1 and reald2.
     * To do that, take the num of all textTracks (5) minus the real subtitles (2)
     * 5 - 2 = 3
     * Now we now that the starting index for our subs is 3.
     */
    const embeddedSubtitles = this.state.textTracks.length - this.props.subtitles.length;
    const newSubtitle = embeddedSubtitles + index;
    console.log(`[DIRECTPLAY] Changing to subtitle index: ${newSubtitle}`);
    this.setState({
      subtitle: newSubtitle
    });

    /**
     * Send event to parent with the new subtitle
     * We send the entire subtitle so the parent know which language
     */
    this.props.onSelectSubtitle(this.props.subtitles[index]);
  }

  disableSubtitles() {
    this.setState({
      subtitle: null
    });
  }

  /**
   * 
   * @param {String} resolution - The resolution to switch to
   */
  changeResolution(resolution) {
    const options = {
      resolution: resolution
    }
    this.props.onChangeResolution(options);
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.source != null &&
          <Video
            source={{
              uri: this.props.source.uri
            }}
            style={styles.videoPlayer}
            onLoad={this.onLoad}
            onProgress={this.onVideoProgress}
            onError={this.onVideoError}
            ref={this.player}
            paused={this.state.paused}
            textTracks={this.props.subtitles ?? []}
            selectedTextTrack={{
              type: this.state.subtitle != null ? 'index' : 'disabled',
              value: this.state.subtitle
            }}
            progressUpdateInterval={1000}
            useTextureView={false}
          />
        }

        <VideoControls
          logo={this.props.logo}
          onPlay={this.onPlay}
          onPause={this.onPause}
          paused={this.state.paused}
          currentTime={this.state.currentTime}
          duration={this.state.duration}
          onSeek={this.seek}
          subtitles={this.props.subtitles}
          onSelectSubtitle={this.selectSubtitle}
          onDisableSubtitles={this.disableSubtitles}
          resolutions={this.props.resolutions ?? []}
          onSelectResolution={this.changeResolution}
        ></VideoControls>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoPlayer: {
    flex: 1
  }
});
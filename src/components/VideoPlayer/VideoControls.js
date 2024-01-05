import React, { Component } from "react";
import Slider from '@react-native-community/slider';
import { StyleSheet, View, TVEventHandler, Text, FlatList, Image, BackHandler } from 'react-native';
import { PlayerButton } from "../Player/PlayerButton";
import { SettingsBox } from "../Player/SettingsBox";
import { SelectableText } from "../SelectableText";


const SEEK_TIME_CHANGE = 10;

export class VideoControls extends Component {
  constructor(props) {
    super(props);
    this.showControlTimeout = null;
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));

    this.state = {
      visible: false,
      seek: {
        seeking: false,
        time: 0
      },
      subtitlesVisible: false,
      resolutionsVisible: false
    }

    this.tvEventHandler = new TVEventHandler();
    this.playButton = React.createRef(null);
    this.subtitleButton = React.createRef(null);
    this.resolutionButton = React.createRef(null);
    this.hiddenButton = React.createRef(null);

    this.toggleSubtitleBox = this.toggleSubtitleBox.bind(this);
    this.toggleResolutionsBox = this.toggleResolutionsBox.bind(this);
  }

  componentDidMount() {
    this.enableTvEventHandler();
    this.showControls();
    this.hiddenButton.current.focus();

  }

  componentWillUnmount() {
    this.disableTvEventHandler();
    clearTimeout(this.showControlTimeout);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    this.backHandler.remove();
  }

  componentDidUpdate(_prevProps, prevState) {
    if (this.playButton.current == null) {
      return;
    }

    // Focus play button if we just opened the controls or stopped seeking
    if ((!prevState.visible && this.state.visible) ||
      (prevState.seek.seeking && !this.state.seek.seeking)) {
      this.playButton.current.focus();
    }

  }

  formatTime(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time - (hours * 3600)) / 60);
    let seconds = Math.floor(time - (hours * 3600) - (minutes * 60));

    // Add leading zeros to minutes and seconds if needed
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return hours + ":" + minutes + ":" + seconds;
  }

  calculateProgress(currentTime, duration) {
    if (isNaN(currentTime) || isNaN(duration) || duration === 0) {
      return 0;
    }

    return currentTime / duration * 100;
  }

  getSliderValue(currentTime, duration) {
    if (this.state.seek.seeking) {
      const progress = this.calculateProgress(this.state.seek.time, duration);
      return progress;
    }
    return this.calculateProgress(currentTime, duration);
  }

  getCurrentTime(currentTime) {
    if (this.state.seek.seeking) {
      return this.formatTime(this.state.seek.time);
    }
    return this.formatTime(currentTime);
  }

  toggleSubtitleBox() {
    // Stop the timeout if we open the box,
    // Start it again if we are closing them
    if (!this.state.subtitlesVisible) {
      clearTimeout(this.showControlTimeout);
    } else {
      this.showControls();
    }

    this.setState({
      subtitlesVisible: !this.state.subtitlesVisible
    });
  }

  toggleResolutionsBox() {
        // Stop the timeout if we open the box,
    // Start it again if we are closing them
    if (!this.state.resolutionsVisible) {
      clearTimeout(this.showControlTimeout);
    } else {
      this.showControls();
    }

    this.setState({
      resolutionsVisible: !this.state.resolutionsVisible
    });
  }

  showControls() {
    clearTimeout(this.showControlTimeout);
    this.setState({
      visible: true
    })

    this.showControlTimeout = setTimeout(() => {
      this.setState({
        visible: false,
        subtitlesVisible: false,
        resolutionsVisible: false
      });
    }, 3000);
  }

  /**
   * Handle what happens when the user presses the back button.
   * If we are seeking, stop seeking and play again.
   * If the subtitle settings are open, hide it and force focus on subtitle button
   * If we are not seeking but the controls are visible, hide the controls
   * @returns true/false
   */
  handleBackButton() {
    if (this.state.seek.seeking) {
      this.setState({
        seek: {
          seeking: false,
          time: 0
        }
      });
      this.props.onPlay();
      return true;
    }

    if (this.state.subtitlesVisible) {
      this.toggleSubtitleBox();
      this.subtitleButton.current.focus();
      return true;
    }

    if (this.state.resolutionsVisible) {
      this.toggleResolutionsBox();
      this.resolutionButton.current.focus();
      return true;
    }

    if (this.state.visible) {
      this.setState({
        visible: false
      });
      return true;
    }
    return false;
  }

  /**
   * Enable the tv event handlers (button presses)
   */
  enableTvEventHandler() {
    console.log("Enabling tv event handler");
    this.tvEventHandler.enable(this, (_cmp, event) => {
      console.log(event);
      console.log("Kepress detected");
      if (event.eventKeyAction === 1) {
        if (event.eventType === 'select') {
          if (this.state.seek.seeking) {
            this.props.onSeek(this.state.seek.time);
            this.setState({
              seek: {
                seeking: false,
                time: 0
              }
            });
          }
        } else if ((event.eventType === 'right' || event.eventType === 'left') || (event.eventType === 'longRight' || event.eventType === 'longLeft')) {
          // If the controls are open, and we are not seeking we should not seek
          if (this.state.visible && !this.state.seek.seeking) {
            // Call because we still have to restart the clearTimeout in this function
            this.showControls(event.eventType);
            return;
          }

          const startTime = this.state.seek.time === 0 ? this.props.currentTime : this.state.seek.time;
          const newTime = (event.eventType === 'right') || (event.eventType === 'longRight')
            ? Math.min(startTime + SEEK_TIME_CHANGE, this.props.duration)
            : Math.max(startTime - SEEK_TIME_CHANGE, 1);

          if (!this.props.paused) {
            this.props.onPause();
          }

          this.setState({
            seek: {
              seeking: true,
              time: newTime
            }
          });
        }
        this.showControls(event.eventType);
      }
    });
  }

  /**
   * Disable the tv event handler
   */
  disableTvEventHandler() {
    if (this.tvEventHandler) {
      this.tvEventHandler.disable();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {/* Hidden button to focus on when we want to hide the controls so that we get keypress events*/}
        <PlayerButton
          type="settings"
          style={styles.hiddenButton}
          ref={this.hiddenButton}
          onFocus={() => this.playButton?.current?.focus()}
        />
        {/* Controls */}
        {this.state.visible &&
        <>
          <View style={styles.header}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w500/${this.props.logo}` }}
                style={styles.logo}
                resizeMode='center'
              />
          </View>
        
          <View style={styles.lower}>
            {!this.state.seek.seeking &&
              <PlayerButton
                type={this.props.paused ? 'play' : 'pause'}
                onPress={this.props.paused ? this.props.onPlay : this.props.onPause}
                ref={this.playButton}
              />
            }
            <Text style={styles.progressText}>{this.getCurrentTime(this.props.currentTime)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={this.getSliderValue(this.props.currentTime, this.props.duration)}
              disabled={true}
              thumbTintColor="white"
              minimumTrackTintColor="white"
              maximumTrackTintColor="rgba(255, 255, 255, 0.5)"
            />
            <Text style={styles.progressText}>{this.formatTime(this.props.duration)}</Text>
            
            {
              this.props.subtitles.length > 0 && !this.state.seek.seeking &&
              <PlayerButton
                type="subtitle"
                style={styles.rightButtons}
                onPress={this.toggleSubtitleBox}
                ref={this.subtitleButton}
              />
            }

            {
              !this.state.seek.seeking &&
              <PlayerButton
                type="settings"
                style={styles.rightButtons}
                onPress={this.toggleResolutionsBox}
                ref={this.resolutionButton}
              />
            }

            
          </View>
        </>
        }
        {/* Subtitle settings */}
        {this.state.subtitlesVisible &&
          <SettingsBox
            title="Subtitles"
          >
            <FlatList
              data={this.props.subtitles}
              keyExtractor={(_item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <SelectableText
                  blockFocusLeft={true}
                  blockFocusRight={true}
                  hasTVPreferredFocus={index === 0}
                  text={item.language}
                  onPress={() => this.props.onSelectSubtitle(index)}
                  passedStyle={{color: "rgba(230, 230, 230, 1)"}}
                />
              )}
            />
            <SelectableText
              text={'Disabled'}
              blockFocusLeft={true}
              blockFocusDown={true}
              blockFocusRight={true}
              onPress={this.props.onDisableSubtitles}
              passedStyle={{color: "rgba(230, 230, 230, 1)"}}

            />

          </SettingsBox>
        }

        {/* Resolution settings */}
        {this.state.resolutionsVisible &&
          <SettingsBox
            title="Resolution"
          >
            <FlatList
              data={this.props.resolutions}
              keyExtractor={(_item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <SelectableText
                  blockFocusLeft={true}
                  blockFocusRight={true}
                  hasTVPreferredFocus={index === 0}
                  blockFocusDown={index == this.props.resolutions.length - 1}
                  text={item}
                  onPress={() => this.props.onSelectResolution(item)}
                  passedStyle={{color: "rgba(230, 230, 230, 1)"}}
                />
              )}
            />
          </SettingsBox>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 10
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    marginLeft: 15,
    marginTop: 25
  },
  logo: {
    width: 170,
    height: 100,
  },
  lower: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    padding: 10
  },
  settingsText: {
    color: 'red'
  },
  slider: {
    flex: 1,
    color: 'white',
  },
  progressText: {
    alignSelf: 'center',
    marginHorizontal: 10,
    color: 'white'
  },
  rightButtons: {
    marginEnd: 10
  },
  hiddenButton: {
    opacity: 0,
    zIndex: -1,
    position: 'absolute',
    width: 1,
    height: 1,
    left: -30,
    bottom: 0,
  }
});
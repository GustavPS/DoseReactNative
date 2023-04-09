import React, { Component } from "react";
import Slider from '@react-native-community/slider';
import { StyleSheet, View, TVEventHandler, Text, FlatList, TouchableOpacity, findNodeHandle, BackHandler } from 'react-native';
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
    this.enableTvEventHandler();

    this.toggleSubtitleBox = this.toggleSubtitleBox.bind(this);
    this.toggleResolutionsBox = this.toggleResolutionsBox.bind(this);
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
        visible: false
      });
    }, 5000);
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
    this.tvEventHandler.enable(this, (_cmp, event) => {
      if (event.eventKeyAction === 0) {
        if (event && event.eventType === 'select') {
          if (this.state.seek.seeking) {
            this.props.onSeek(this.state.seek.time);
            this.setState({
              seek: {
                seeking: false,
                time: 0
              }
            });
          }
        } else if (event && (event.eventType === 'right' || event.eventType === 'left')) {
          // If the controls are open, and we are not seeking we should not seek
          if (this.state.visible && !this.state.seek.seeking) {
            // Call because we still have to restart the clearTimeout in this function
            this.showControls(event.eventType);
            return;
          }

          const startTime = this.state.seek.time === 0 ? this.props.currentTime : this.state.seek.time;
          const newTime = event.eventType === 'right'
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
        {/* Controls */}
        {this.state.visible &&
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
            />
            <Text style={styles.progressText}>{this.formatTime(this.props.duration)}</Text>

            <PlayerButton
              type="subtitle"
              style={styles.rightButtons}
              onPress={this.toggleSubtitleBox}
              ref={this.subtitleButton}
            />

            <PlayerButton
              type="settings"
              style={styles.rightButtons}
              onPress={this.toggleResolutionsBox}
              ref={this.resolutionButton}
            />
          </View>
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
                />
              )}
            />
            <SelectableText
              text={'Disabled'}
              blockFocusLeft={true}
              blockFocusDown={true}
              blockFocusRight={true}
              onPress={this.props.onDisableSubtitles}
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
                  blockFocusDown={index == this.props.resolutions.length - 1}
                  hasTVPreferredFocus={index === 0}
                  text={item}
                  onPress={() => this.props.onSelectResolution(item)}
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
  lower: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    padding: 10
  },
  slider: {
    flex: 1
  },
  progressText: {
    alignSelf: 'center',
    marginHorizontal: 10
  },
  rightButtons: {
    marginEnd: 10
  }
});
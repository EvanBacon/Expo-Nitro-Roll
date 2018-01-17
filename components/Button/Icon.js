import React, { Component } from 'react';
import { Image, StyleSheet } from 'react-native';
import TouchableBounce from 'react-native/Libraries/Components/Touchable/TouchableBounce';
import { FontAwesome } from '@expo/vector-icons'; // 6.2.0

import AudioManager from '../../Manager/AudioManager';

export default class Icon extends Component {
  static defaultProps = {
    soundIn: 'button_in',
    soundOut: 'button_out',
    size: 30,
    color: '#ffffff',
  };

  render() {
    const {
      onPress,
      size,
      color,
      name,
      soundOut,
      soundIn,
      source,
      style,
      iconStyle,
    } = this.props;
    return (
      <TouchableBounce
        onPress={onPress}
        onPressIn={() => AudioManager.sharedInstance.playAsync(soundIn)}
        onPressOut={() => AudioManager.sharedInstance.playAsync(soundOut)}
        style={[styles.container, style]}
      >
        <FontAwesome
          size={size}
          color={color}
          name={name}
          style={[styles.icon, iconStyle]}
        />
      </TouchableBounce>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    minWidth: 64,
    aspectRatio: 1,
    borderRadius: 64 / 2,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  icon: {
    backgroundColor: 'transparent',
  },
});

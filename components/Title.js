import * as Animatable from 'react-native-animatable';

import React from 'react';
import { Text, Image, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Assets from '../Assets';

class Title extends React.Component {
  render() {
    const { game } = this.props;
    return (
      <Animatable.View
        pointerEvents="none"
        animation={game === 'menu' ? 'slideInLeft' : 'fadeOutLeft'}
        style={styles.container}
      >
        <Image source={Assets.images['title.png']} style={styles.image} />
      </Animatable.View>
    );
  }
}

export default connect(({ game }) => ({ game }))(Title);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'contain',
    width: 170,
    aspectRatio: 1,
  },
});

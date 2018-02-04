import { dispatch } from '@rematch/core';
import React from 'react';

import Icon from './Icon';

class Cancel extends React.Component {
  onPress = () => {
    this.props.onPress && this.props.onPress();
  };
  render() {
    const { onPress, name, ...props } = this.props;
    return (
      <Icon
        color="#20D8FD"
        style={{ borderColor: '#20D8FD' }}
        onPress={this.onPress}
        name="times"
        {...props}
      />
    );
  }
}

export default Cancel;

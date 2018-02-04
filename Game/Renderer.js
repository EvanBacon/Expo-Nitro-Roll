import ExpoTHREE from 'expo-three';
import { PixelRatio } from 'react-native';

export default gl => {
  const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
  const scale = PixelRatio.get();

  const renderer = ExpoTHREE.renderer({
    gl,
  });
  renderer.setPixelRatio(scale);
  renderer.setSize(width / scale, height / scale);
  renderer.setClearColor(0x000000, 0);
  return renderer;
};

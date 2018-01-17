import ExpoTHREE, { THREE } from 'expo-three';

require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/postprocessing/MaskPass');
require('three/examples/js/shaders/CopyShader');
require('three/examples/js/shaders/HorizontalBlurShader');
require('three/examples/js/shaders/VerticalBlurShader');
require('three/examples/js/shaders/DotScreenShader');
require('three/examples/js/shaders/RGBShiftShader');
require('three/examples/js/shaders/VignetteShader');

require('three/examples/js/shaders/ColorifyShader');
require('three/examples/js/shaders/ConvolutionShader');
require('three/examples/js/shaders/FilmShader');

require('three/examples/js/postprocessing/DotScreenPass');
require('three/examples/js/postprocessing/BloomPass');
require('three/examples/js/postprocessing/FilmPass');

require('three/examples/js/shaders/LuminosityShader');
require('three/examples/js/shaders/SobelOperatorShader');
require('three/examples/js/shaders/ParallaxShader');

export default (gl, renderer, scene, camera) => {
  const { drawingBufferWidth: width, drawingBufferHeight: _height } = gl;

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  const effectSobel = new THREE.ShaderPass(THREE.SobelOperatorShader);
  effectSobel.renderToScreen = true;
  effectSobel.uniforms.resolution.value.x = window.innerWidth;
  effectSobel.uniforms.resolution.value.y = window.innerHeight;

  composer.addPass(effectSobel);

  return composer;
};

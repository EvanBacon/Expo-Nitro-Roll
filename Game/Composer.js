import ExpoTHREE, { THREE } from 'expo-three';

require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/shaders/CopyShader');
require('three/examples/js/shaders/FXAAShader');
require('three/examples/js/postprocessing/OutlinePass');
require('three/examples/js/shaders/SobelOperatorShader');

export default (gl, renderer, scene, camera) => {
  const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  const effectSobel = new THREE.ShaderPass(THREE.SobelOperatorShader);
  effectSobel.uniforms.resolution.value.x = window.innerWidth;
  effectSobel.uniforms.resolution.value.y = window.innerHeight;
  effectSobel.renderToScreen = true;
  composer.addPass(effectSobel);

  return composer;
};

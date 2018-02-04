import ExpoTHREE, { THREE } from 'expo-three';

require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/shaders/CopyShader');
require('three/examples/js/shaders/FXAAShader');
require('three/examples/js/postprocessing/OutlinePass');
require('three/examples/js/shaders/SobelOperatorShader');

// require('three/examples/js/nodes/GLNode');
// require('three/examples/js/nodes/RawNode');
// require('three/examples/js/nodes/TempNode');
// require('three/examples/js/nodes/InputNode');
// require('three/examples/js/nodes/ConstNode');
// require('three/examples/js/nodes/FunctionNode');
// require('three/examples/js/nodes/FunctionCallNode');
// require('three/examples/js/nodes/NodeBuilder');
// require('three/examples/js/nodes/NodeLib');
// require('three/examples/js/nodes/NodeMaterial');
// require('three/examples/js/nodes/accessors/PositionNode');
// require('three/examples/js/nodes/accessors/NormalNode');
// require('three/examples/js/nodes/accessors/UVNode');
// require('three/examples/js/nodes/accessors/ColorsNode');
// require('three/examples/js/nodes/inputs/IntNode');
// require('three/examples/js/nodes/inputs/FloatNode');
// require('three/examples/js/nodes/inputs/ColorNode');
// require('three/examples/js/nodes/inputs/Vector2Node');
// require('three/examples/js/nodes/inputs/Vector3Node');
// require('three/examples/js/nodes/inputs/Vector4Node');
// require('three/examples/js/nodes/inputs/TextureNode');
// require('three/examples/js/nodes/inputs/CubeTextureNode');
// require('three/examples/js/nodes/inputs/ScreenNode');
// require('three/examples/js/nodes/math/Math1Node');
// require('three/examples/js/nodes/math/Math2Node');
// require('three/examples/js/nodes/math/Math3Node');
// require('three/examples/js/nodes/math/OperatorNode');
// require('three/examples/js/nodes/utils/SwitchNode');
// require('three/examples/js/nodes/utils/JoinNode');
// require('three/examples/js/nodes/utils/TimerNode');
// require('three/examples/js/nodes/utils/ColorAdjustmentNode');
// require('three/examples/js/nodes/utils/BlurNode');
// require('three/examples/js/nodes/postprocessing/NodePass');

// const InvertedNode = (_alpha = 1) => {
//   const alpha = new THREE.FloatNode(_alpha);
//   const screen = new THREE.ScreenNode();
//   const inverted = new THREE.Math1Node(screen, THREE.Math1Node.INVERT);
//   const fade = new THREE.Math3Node(
//     screen,
//     inverted,
//     alpha,
//     THREE.Math3Node.MIX,
//   );
//   // nodepass.renderToScreen = true;
//   // composer.addPass( nodepass );
//   return fade;
// };

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

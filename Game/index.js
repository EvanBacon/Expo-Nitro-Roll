import ExpoTHREE from 'expo-three';

import Composer from './Composer';

import Game from './Game';
import { PixelRatio } from 'react-native';
import Renderer from './Renderer';
class Machine {
  time = 0;

  onContextCreateAsync = async gl => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const scale = PixelRatio.get();
    this.renderer = Renderer(gl);
    this.game = new Game(width, height, this.renderer);
    await this.game.loadAsync();

    this.composer = Composer(
      gl,
      this.renderer,
      this.game.scene,
      this.game.camera,
    );
  };

  onTouchesBegan = state => this.game.onTouchesBegan(state);

  onResize = layout => {
    const { scale } = layout;
    const width = layout.width;
    const height = layout.height;
    if (this.renderer) {
      this.renderer.setPixelRatio(scale);
      this.renderer.setSize(width, height);
    }
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    if (this.game) {
      this.game.onResize(layout);
    }
  };

  onRender = delta => {
    this.time += delta;

    this.game.update(delta, this.time);
    // this.renderer.render(this.game.scene, this.game.camera);
    this.composer.render(delta);
  };
}

export default Machine;

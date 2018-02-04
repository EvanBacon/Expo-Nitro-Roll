import { THREE } from 'expo-three';

import Settings from '../../../constants/Settings';
import GameObject from '../core/GameObject';
import Factory from '../Factory';
import Platform from './Platform';

const width = Settings.cubeSize * Settings.cubesWide;

class Terrain extends GameObject {
  loadAsync = async scene => {
    for (let i = 0; i < Settings.cubesWide + 2; i++) {
      const square = await this.add(new Platform());
      square.x = i * Settings.cubeSize;
    }

    await super.loadAsync(scene);
  };

  recycle = index => {
    this.objects[index].position.x += this.children.length * Settings.cubeSize;
    this.subIndex = (index + 1) % this.objects.length;
  };
  update(delta, time) {
    super.update(delta, time);
  }
}
export default Terrain;

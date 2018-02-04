import { THREE } from 'expo-three';

import Settings from '../../../constants/Settings';
import GameObject from '../core/GameObject';
import Factory from '../Factory';
import Platform from './Platform';

const width = Settings.cubeSize * Settings.cubesWide;

const endOffset = Settings.cubesWide * Settings.cubeSize;
class Terrain extends GameObject {
  loadAsync = async scene => {
    for (let i = 0; i < Settings.cubesWide; i++) {
      const square = await this.add(new Platform());
      square.x = i * Settings.cubeSize;
    }
    await super.loadAsync(scene);
  };

  get index() {
    return this._index;
  }
  set index(value) {
    if (value === this._index) {
      return;
    }
    this._index = value;
    console.log('Terrain: index', value, endOffset);
    const object = this.objects.shift();
    this.objects.push(object);
    object.position.x += endOffset;
  }
}
export default Terrain;

import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import Factory from '../Factory';
import Settings from '../../../constants/Settings';

const radius = Settings.cubeSize;
global.platformGeom =
  global.platformGeom || new THREE.BoxBufferGeometry(radius - 0.4, 500, radius);

global.platformMatIndex = 0;
class Platform extends GameObject {
  loadAsync = async scene => {
    const materials = Object.keys(Factory.shared.materials);
    let key = materials[global.platformMatIndex];
    while (key === 'red') {
      global.platformMatIndex =
        (global.platformMatIndex + 1) % materials.length;
      key = materials[global.platformMatIndex];
    }
    const material = Factory.shared.materials[key]; //.clone();

    const mesh = new THREE.Mesh(global.platformGeom, material);
    this.y = -250 + radius / 2;
    this.add(mesh);
    await super.loadAsync(scene);
  };
}

export default Platform;

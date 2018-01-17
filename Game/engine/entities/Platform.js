import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import flatMaterial from '../utils/flatMaterial';
import randomColor from '../utils/randomColor';

class Platform extends GameObject {
  loadAsync = async scene => {
    const radius = 40;

    const color = randomColor({
      luminosity: 'dark',
      hue: '#69301B',
    });

    global.platformGeom =
      global.platformGeom || new THREE.BoxBufferGeometry(radius, 500, radius);

    const mesh = new THREE.Mesh(global.platformGeom, flatMaterial({ color }));
    this.y = -250 + radius / 2;
    this.add(mesh);
    await super.loadAsync(scene);
  };
}

export default Platform;

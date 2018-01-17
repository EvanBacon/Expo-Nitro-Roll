import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import Factory from '../Factory';
import randomColor from '../utils/randomColor';

class Cuboid extends GameObject {
  loadAsync = async scene => {
    const radius = 40;

    const color = randomColor({
      luminosity: 'dark',
      hue: '#69301B',
    });

    global.cuboidGeom =
      global.cuboidGeom || new THREE.BoxBufferGeometry(radius, radius, radius);

    const mesh = new THREE.Mesh(
      global.cuboidGeom,
      Factory.shared.materials.red,
    );
    this.add(mesh);
    await super.loadAsync(scene);
  };

  update(delta, time) {
    super.update(delta, time);
    if (this.speed) {
      const height = 100;
      const sin = Math.sin(time * this.speed) + 1;
      const alt = sin * height;
      this.y = 40 + alt;

      this.collidable = this.y < 70;
    }
  }
}

export default Cuboid;

import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import Factory from '../Factory';
import Settings from '../../../constants/Settings';

const radius = Settings.cubeSize;
const height = 100;
global.cuboidGeom =
  global.cuboidGeom || new THREE.BoxBufferGeometry(radius, radius, radius);
class Cuboid extends GameObject {
  loadAsync = async scene => {
    const mesh = new THREE.Mesh(
      global.cuboidGeom,
      Factory.shared.materials.red,
    );

    this.cube = mesh;
    this.group = new THREE.Group();
    this.group.add(mesh);
    this.add(this.group);

    await super.loadAsync(scene);
  };

  updatePivot = () => {
    const rotation = this.group.rotation.z;
    const rounded = Math.floor(Math.abs(rotation) % (Math.PI * 2));
    const half = radius / 2;
    this.group.position.set(half, -half, 0);
    switch (rounded) {
      case 0:
        this.cube.position.set(-half, half, 0);
        break;
      case Math.floor(Math.PI * 0.5):
        this.cube.position.set(-half, -half, 0);
        break;
      case Math.floor(Math.PI):
        this.cube.position.set(half, -half, 0);
        break;
      case Math.floor(Math.PI * 1.5):
        this.cube.position.set(half, half, 0);
        break;
    }
  };

  update(delta, time) {
    super.update(delta, time);
    if (this.speed) {
      const sin = Math.sin(time * this.speed) + 1;
      const alt = sin * height;
      this.y = 40 + alt;

      this.collidable = this.y < 70;
    }
  }
}

export default Cuboid;

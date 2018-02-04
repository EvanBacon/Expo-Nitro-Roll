import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import Factory from '../Factory';
import Settings from '../../../constants/Settings';
import randomRange from '../utils/randomRange';

const radius = Settings.cubeSize;
const height = 100;
global.cuboidGeom =
  global.cuboidGeom || new THREE.BoxBufferGeometry(radius, radius, radius);
class Cuboid extends GameObject {
  _index = 0;

  loadAsync = async scene => {
    this._mat = Factory.shared.materials.red.clone();
    const mesh = new THREE.Mesh(global.cuboidGeom, this._mat);
    this.cube = mesh;

    this.group = new THREE.Group();
    this.group.add(mesh);
    this.add(this.group);

    await super.loadAsync(scene);
  };

  updatePivot = () => {
    const offset = Math.PI * 1.5;
    const rotation = this._index * Math.PI / 2 + offset;
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
}

export default Cuboid;

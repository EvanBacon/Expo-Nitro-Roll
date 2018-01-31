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
  loadAsync = async scene => {
    this._mat = Factory.shared.materials.red.clone();
    // this._mat.transparent = true
    const mesh = new THREE.Mesh(global.cuboidGeom, this._mat);

    this.cube = mesh;
    // mesh.add(this.outline);
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

  get index() {
    return this.x / radius;
  }
  updateClass = () => {
    const { index } = this;
    const levelSize = 12;
    this.enemyClass = Math.floor(randomRange(0, index / levelSize));
    // console.warn(this.enemyClass, index, 'f');
    this._mat.transparent = false;
    // this.rotation.y = 0;
    // this.rotation.x = 0;
  };

  get outline() {
    const material = Exotic.Factory.shared.materials.white.clone();
    material.side = THREE.BackSide;
    const mesh = new THREE.Mesh(global.cuboidGeom, material);
    mesh.scale.multiplyScalar(1.1);
    return mesh;
  }

  update(delta, time) {
    super.update(delta, time);
    if (this.speed) {
      const { index } = this;
      const modulo = index % 3;
      // this.speed += (index % 3) * 0.2;
      const sin = Math.sin(time * this.speed) + 1;
      let alt = sin * height;
      this.y = radius + alt;

      switch (this.enemyClass) {
        case 0:
          {
          }
          break;
        case 1:
          {
            const offset = modulo * Math.PI * 0.336;
            this.rotation.y += offset * delta * 0.5;
          }
          break;
        case 2:
          {
            const offset = modulo * Math.PI * 0.336;
            this.rotation.x += offset * delta * 0.5;
          }
          break;
        case 3:
          this.rotation.x = 0;
          this.scale.y = 1.2 - Math.abs(sin);
          const _radius = radius * this.scale.y;
          this.y = _radius + alt;
          break;
        case 4:
          this._mat.transparent = true;
          this._mat.opacity = Math.abs(sin + modulo * 3);
          break;
        default:
          this.updateClass();
          break;
      }

      this.collidable = this.y < radius * this.scale.y * 1.5;
    }
  }
}

export default Cuboid;

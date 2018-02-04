import { THREE } from 'expo-three';

import Settings from '../../../constants/Settings';
import GameObject from '../core/GameObject';
import Factory from '../Factory';
import easeInQuad from '../math/easeInQuad';

const radius = Settings.cubeSize;
const height = 100;
global.cuboidGeom =
  global.cuboidGeom || new THREE.BoxBufferGeometry(radius, radius, radius);
class Cuboid extends GameObject {
  canMove = true;
  loadAsync = async scene => {
    this._mat = Factory.shared.materials.red.clone();
    const mesh = new THREE.Mesh(global.cuboidGeom, this._mat);
    this.cube = mesh;

    this.group = new THREE.Group();
    this.group.add(mesh);
    this.add(this.group);
    const half = radius / 2;
    this.group.position.set(half, -half, 0);
    this.cube.position.set(-half, half, 0);

    this.x = Settings.initialCube * Settings.cubeSize;
    this.y = Settings.cubeSize;

    this.rotating = false;

    await super.loadAsync(scene);
  };

  updatePivot = () => {
    const offset = 0;
    const rotation = this.index * Math.PI / 2 + offset;
    this.group.rotation.z = Math.abs(rotation) % (Math.PI * 2);
    const rounded = Math.floor(this.group.rotation.z);
    const half = radius / 2;
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

  get rotating() {
    return this._rotating;
  }
  set rotating(value) {
    if (value === this._rotating) {
      return;
    }
    if (value) {
      const angle = this.group.rotation.z;
      this.animation = {
        current: angle,
        target: angle - Math.PI / 2,
        timestamp: this.time,
        duration: Settings.moveAnimationDuration,
      };
    } else {
      this.animation = null;
    }
    this.canMove = !value;
    this._rotating = value;
  }
  get index() {
    return Math.round(this.x / Settings.cubeSize);
  }

  update(delta, time) {
    this.time = time;
    super.update(delta, time);
    if (this._rotating) {
      const { current, target, duration, timestamp } = this.animation;

      const currentTime = time - timestamp;
      if (currentTime < duration) {
        this.group.rotation.z = easeInQuad(
          currentTime,
          current,
          target,
          duration,
        );
        this.x = easeInQuad(currentTime, moveHome, moveTarget, duration);
        this.onMove && this.onMove(this.x);
      } else {
        this.onMove && this.onMove(moveTarget);
        this.x = moveHome;

        this.group.rotation.z = target;
        this.rotating = false;
        this.updatePivot();
        this.onComplete && this.onComplete();
      }
    }
  }
}

const moveTarget = Settings.initialCube + 1 * Settings.cubeSize;
const moveHome = Settings.initialCube * Settings.cubeSize;
export default Cuboid;

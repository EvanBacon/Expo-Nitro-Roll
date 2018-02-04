import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import Factory from '../Factory';
import Settings from '../../../constants/Settings';
import randomRange from '../utils/randomRange';

const radius = Settings.cubeSize;
const height = radius * 5;
const maxScale = height / radius;
const halfSize = radius / 2;
const halfHeight = height / 2;
const forgivness = 0.7;
global.cuboidGeom =
  global.cuboidGeom || new THREE.BoxBufferGeometry(radius, radius, radius);
class Obstacle extends GameObject {
  loadAsync = async scene => {
    this._mat = Factory.shared.materials.red.clone();
    const mesh = new THREE.Mesh(global.cuboidGeom, this._mat);

    this.add(mesh);
    await super.loadAsync(scene);
  };

  get index() {
    return this.x / radius - Settings.initialCube;
  }

  updateClass = () => {
    const { index } = this;
    const levelSize = 10;
    this.enemyClass =
      classes[
        Math.floor(Math.min(randomRange(0, index / levelSize), classes.length))
      ];
    this._mat.transparent = false;
    this.rotation.y = 0;
    this.rotation.x = 0;
    this.scale.y = 1;
  };

  update(delta, time) {
    super.update(delta, time);
    if (this.speed) {
      const { index } = this;
      const modulo = index % 3;
      // this.speed += (index % 3) * 0.2;
      let sin = (Math.sin(time * this.speed) + 1) / 2;
      let alt = sin * height;
      this.y = radius + alt;
      this.bottom = alt;

      switch (this.enemyClass) {
        case 'nothing':
          break;
        case 'scale-down':
          {
            this.scale.y = maxScale * sin;
            const _radius = radius * this.scale.y;
            const upoffset = _radius * (1 - sin);
            this.y = halfSize + _radius * 0.5 + (height - _radius);
            this.bottom = this.y - _radius;
          }
          break;
        case 'scale-center':
          {
            sin = (Math.sin(time * this.speed * 0.5) + 1) / 2;
            this.scale.y = maxScale * sin;
            const _radius = radius * this.scale.y;
            const upoffset = _radius * (1 - sin);
            const momentum = (height - _radius) / 2;
            this.y = halfSize + _radius * 0.5 + momentum;
            this.bottom = this.y - _radius / 2;
          }
          break;
        case 'rotate-y':
          {
            const offset = modulo * Math.PI * 0.336;
            this.rotation.y += offset * delta * 0.5;
          }
          break;
        case 'rotate-x':
          {
            const offset = modulo * Math.PI * 0.336;
            this.rotation.x += offset * delta * 0.5;
          }
          break;
        case 'opacity':
          {
            this._mat.transparent = true;
            this._mat.opacity = Math.abs(sin + modulo * 3);
          }
          break;
        default:
          this.updateClass();
          break;
      }

      this.collidable = this.bottom < radius * forgivness;
    }
  }
}

const classes = [
  'nothing',
  'rotate-y',
  'scale-down',
  'rotate-x',
  'scale-center',
  'opacity',
];

export default Obstacle;

import GameObject from '../core/GameObject';
import Obstacles from './Obstacles';
import Terrain from './Terrain';
import Settings from '../../../constants/Settings';
import easeInQuad from '../math/easeInQuad';

class Level extends GameObject {
  loadAsync = async scene => {
    this.terrain = await this.add(new Terrain());
    this.obstacles = await this.add(new Obstacles());
    this.obstacles.onCollide = () => this.onCollide();
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
    this.obstacles.index = value;
    this.terrain.index = value;
  }

  move = () => {
    this.animation = {
      timestamp: this.time,
      duration: Settings.moveAnimationDuration,
      current: this.x,
      target: this.x - Settings.cubeSize,
    };
  };
  update(delta, time) {
    this.time = time;
    super.update(delta, time);
    if (this.animation) {
      const { current, target, duration, timestamp } = this.animation;
      const currentTime = time - timestamp;
      if (currentTime < duration) {
        this.x = easeInQuad(currentTime, current, target, duration);
      } else {
        this.x = target;
        this.animation = null;
      }
    }
  }
}

export default Level;

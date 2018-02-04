import GameObject from '../core/GameObject';
import Terrain from './Terrain';
import randomRange from '../utils/randomRange';
import Settings from '../../../constants/Settings';
import Obstacle from './Obstacle';

class Obstacles extends GameObject {
  killed = [];
  combo = 0;
  _index = 0;
  get index() {
    return this._index;
  }
  set index(value) {
    if (value === this._index) {
      return;
    }
    this._index = value;
    this.recycle(value);
  }

  async loadAsync() {
    await this.addObstacle();
    return super.loadAsync(arguments);
  }

  recycle = async index => {
    this.index = index;
    let obstacle = this.objects[0];
    /// Remove
    console.log('obstacles: add', obstacle.index, index);

    if (
      obstacle &&
      !obstacle.dead &&
      obstacle.index <= index - (Settings.initialCube + 1)
    ) {
      obstacle.dead = true;
      this.killed.push(obstacle);
      obstacle = null;
    }

    /// Add
    const attempt = randomRange(0, 9);
    if (attempt > 4 && this.combo < 3) {
      await this.addObstacle();
    } else {
      this.combo = 0;
    }
  };

  addObstacle = async () => {
    this.combo += 1;
    let obstacle;
    if (this.killed.length > 0) {
      obstacle = this.killed.shift();
      obstacle.dead = false;
      obstacle.updateClass();
    } else {
      obstacle = await this.add(new Obstacle());
    }

    obstacle.speed = Math.min(
      randomRange(3, 3.25) + this.index * 0.01,
      Settings.maxSpeed,
    );
    obstacle._index = this.maxIndex;
    obstacle.x = obstacle._index * Settings.cubeSize;
    console.log('added obstacle', this.index, obstacle._index, obstacle.x);
  };

  get maxIndex() {
    return this.index + Settings.cubesWide;
  }

  update(delta, time) {
    super.update(delta, time);
    const index = this.index; // + Settings.initialCube;
    for (let object of this.objects) {
      if (index === object.index) {
        if (object.collidable) {
          this.onCollide();
        }
        return;
      }
    }
  }
}

export default Obstacles;

import GameObject from '../core/GameObject';
import Terrain from './Terrain';
import randomRange from '../utils/randomRange';
import Settings from '../../../constants/Settings';

class Level extends GameObject {
  deadEnemies = [];
  enemyCombo = 0;
  playerIndex = Settings.initialCube;
  subIndex = 0;

  loadAsync = async scene => {
    this.terrain = await this.add(new Terrain());
    this.enemies = await this.add(new Group());
    await super.loadAsync(scene);
  };

  finishedMoving = () => {    
    let enemy = this.enemies.objects[0];
    if (
      this.enemies.objects.length > 0 &&
      enemy.x <= this.terrain.objects[this.subIndex].x &&
      enemy.dead !== true
    ) {
      enemy.dead = true;
      this.deadEnemies.push(enemy);
      enemy = null;
    }

    this.terrain.recycle(this.subIndex);

    if (randomRange(0, 9) > 4 && this.enemyCombo < 3) {
        await this.addEnemy();
        this.enemyCombo += 1;
      } else {
        this.enemyCombo = 0;
      }
  }
  addEnemy = async () => {
    const count = this.terrain.objects.length;
    let enemy;
    if (this.deadEnemies.length > 0) {
      enemy = this.deadEnemies.shift();
      enemy.dead = false;
      enemy.updateClass();
    } else {
      enemy = await this.enemies.add(new Obstacle());
    }

    enemy.speed = Math.min(
      randomRange(3, 3.25) + this.score * 0.01,
      Settings.maxSpeed,
    );
    const index = ((this.subIndex || 0) + count - 1) % count;
    enemy.x = this.terrain.objects[index].x;
    enemy.index = Math.round(enemy.x / Settings.cubeSize);
  };

  collision = () => {
    for (let enemy of this.enemies.objects) {
      if (this.playerIndex === enemy.index) {
        if (enemy.collidable) {
          this.onCollide();
        }
        return;
      }
    }
  };

  update(delta, time) {
    super.update(delta, time);
    if (this.enemies) {
      this.collision();
    }
  }
}

export default Level;

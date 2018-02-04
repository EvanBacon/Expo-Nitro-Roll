import Settings from '../constants/Settings';
import { dispatch } from '@rematch/core';
import ExpoTHREE, { THREE } from 'expo-three';
import { Expo as ExpoEase, Linear, TweenLite } from 'gsap';

import AudioManager from '../Manager/AudioManager';
import GameObject from './engine/core/GameObject';
import Group from './engine/core/Group';
import Cuboid from './engine/entities/Cuboid';
import Lighting from './engine/entities/Lighting';
import Platform from './engine/entities/Platform';
import Stars from './engine/entities/Stars';
import randomRange from './engine/utils/randomRange';
import Obstacle from './engine/entities/Obstacle';

const height = Settings.cubeSize * 12;
const width = Settings.cubeSize * 7;

class Game extends GameObject {
  gameEnded = false;

  constructor(width, height, renderer) {
    super();
    this.renderer = renderer;
    this._width = width;
    this._height = height;
    dispatch.score.reset();
    this.score = 0;
    dispatch.game.menu();
  }

  createScene = () => {
    return new THREE.Scene();
  };

  createCameraAsync = async (width, height) => {
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    camera.position.set(0, 100, 400);
    camera.lookAt(new THREE.Vector3(10, 80, 0));
    camera.ogPosition = camera.position.clone();

    return camera;
  };

  async reset() {
    super.reset();
    dispatch.game.menu();
    this.camera.position.x = width / Settings.cubeSize * Settings.cubeSize / 2;

    AudioManager.sharedInstance.playAsync('song', true, false);
    await this.loadGame();
    this.gameEnded = false;
  }

  get color() {
    return new THREE.Color(`hsl(20, 100%, 0%)`);
  }

  async loadAsync() {
    this.scene = this.createScene();
    const { color } = this;
    // this.scene.background = color;
    this.scene.fog = new THREE.Fog(color, 100, 950);

    this.scene.add(this);
    this.camera = await this.createCameraAsync(this._width, this._height);

    const types = [new Lighting(this), new Stars(this)];
    const promises = types.map(type => this.add(type));
    await Promise.all(promises);
    await this.loadGame();
    await super.loadAsync(this.scene);
    this.gameEnded = false;
  }

  loadGame = async () => {
    if (this.levelGroup) {
      this.terrainGroup = null;
      this.enemyGroup = null;
      this.remove(this.levelGroup);
      this.levelGroup = null;
    }

    this.levelGroup = await this.add(new Group());
    this.terrainGroup = await this.levelGroup.add(new Group());
    this.enemyGroup = await this.levelGroup.add(new Group());

    this.camera.position.x = width / Settings.cubeSize * Settings.cubeSize / 2;
    for (let i = 0; i < width / Settings.cubeSize + 2; i++) {
      const square = await this.terrainGroup.add(new Platform());
      square.x = i * Settings.cubeSize;
    }

    if (this.hero) {
      this.remove(this.hero);
    }
    this.hero = await this.add(new Cuboid());
    this.hero.x = (Settings.initialCube - 1) * Settings.cubeSize;
    this.hero.y = Settings.cubeSize;
    this.hero.canMove = true;
    this.hero._index = 0;
    this.hero.updatePivot();
    this.addEnemy();
  };

  onTouchesBegan = async ({ pageX: x, pageY: y }) => {
    this.moveSquare();
    dispatch.game.play();

    if (Math.round(randomRange(0, 3)) === 0) {
      // this.takeScreenshot();
    }
  };

  takeScreenshot = async () => {
    if (this.screenShotTaken) {
      return;
    }
    this.screenShotTaken = true;

    await dispatch.screenshot.updateAsync({
      ref: global.gameRef,
      width: this._width,
      height: this._height,
    });
  };

  gameOver = (animate = true) => {
    if (this.gameEnded) {
      return;
    }
    this.gameEnded = true;

    this.takeScreenshot();
    this.screenShotTaken = false;
    dispatch.score.reset();
    this.score = 0;
    this.hero.canMove = false;
    AudioManager.sharedInstance.pauseAsync('song');
    const name = 'bass_0' + Math.round(randomRange(0, 8));
    AudioManager.sharedInstance.playAsync(name);

    const duration = 0.8;

    TweenLite.to(this.scale, duration, {
      y: 0.0001,
      z: 0.0001,
      ease: ExpoEase.easeOut,
      onComplete: () => {
        this.reset();

        TweenLite.to(this.scale, duration, {
          x: 1,
          y: 1,
          z: 1,
          ease: Linear.easeNone,
        });
      },
    });
  };

  moveSquare = () => {
    if (this.hero.canMove) {
      AudioManager.sharedInstance.playAsync(
        'pop_0' + Math.round(randomRange(0, 1)),
      );
      this.hero.canMove = false;
      dispatch.score.increment();
      this.score += 1;

      this.hero._index =
        (this.levelGroup.x / Settings.cubeSize - Settings.initialCube) * -1;
      TweenLite.to(this.levelGroup, Settings.moveAnimationDuration, {
        x: this.levelGroup.x - Settings.cubeSize,
      });
      TweenLite.to(this.hero, Settings.moveAnimationDuration, {
        x: this.hero.x - Settings.cubeSize,
        onComplete: () => {
          this.hero.x = Settings.initialCube * Settings.cubeSize;
        },
      });

      const targetRotation = this.hero.group.rotation.z - Math.PI / 2;
      TweenLite.to(this.hero.group.rotation, Settings.moveAnimationDuration, {
        z: targetRotation,
        onComplete: async () => {
          this.hero.group.rotation.z = targetRotation;
          this.hero.updatePivot();
          this.hero.canMove = true;
          const index = this.terrainGroup.subIndex || 0;
          let enemy = this.enemyGroup.objects[0];
          if (
            this.enemyGroup.objects.length > 0 &&
            enemy.x <= this.terrainGroup.objects[index].x &&
            enemy.dead !== true
          ) {
            enemy.dead = true;
            // this.enemyGroup.remove(enemy);
            this.deadEnemies.push(enemy);
            enemy = null;
          }

          this.terrainGroup.objects[index].position.x +=
            this.terrainGroup.children.length * Settings.cubeSize;
          this.terrainGroup.subIndex =
            (index + 1) % this.terrainGroup.objects.length;

          if (randomRange(0, 9) > 4 && this.enemyCombo < 3) {
            await this.addEnemy();
            this.enemyCombo += 1;
          } else {
            this.enemyCombo = 0;
          }
        },
      });
    }
  };
  enemyCombo = 0;

  collision = () => {
    const playerIndex = Math.floor(
      (this.hero.x - this.levelGroup.x) / Settings.cubeSize,
    );

    for (let enemy of this.enemyGroup.objects) {
      const index = Math.floor(enemy.x / Settings.cubeSize);
      if (playerIndex === index) {
        if (enemy.collidable) {
          this.gameOver();
        }
        return;
      }
    }
  };

  deadEnemies = [];

  addEnemy = async () => {
    const count = this.terrainGroup.objects.length;

    let enemy;
    if (this.deadEnemies.length > 0) {
      enemy = this.deadEnemies.shift();
      enemy.dead = false;
      enemy.updateClass();
    } else {
      enemy = await this.enemyGroup.add(new Obstacle());
    }

    enemy.speed = Math.min(
      randomRange(3, 3.25) + this.score * 0.01,
      Settings.maxSpeed,
    );
    const index = ((this.terrainGroup.subIndex || 0) + count - 1) % count;
    enemy.x = this.terrainGroup.objects[index].x;
  };

  update(delta, time) {
    super.update(delta, time);
    if (this.enemyGroup) {
      this.collision();
    }
  }

  onResize = ({ width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}

export default Game;

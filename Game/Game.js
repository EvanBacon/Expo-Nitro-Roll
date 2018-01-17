import Settings from '../constants/Settings';
import { dispatch } from '@rematch/core';
import ExpoTHREE, { THREE } from 'expo-three';
import { Expo as ExpoEase, Linear, TweenMax } from 'gsap';

import AudioManager from '../Manager/AudioManager';
import GameObject from './engine/core/GameObject';
import Group from './engine/core/Group';
import Cuboid from './engine/entities/Cuboid';
import Lighting from './engine/entities/Lighting';
import Platform from './engine/entities/Platform';
import Stars from './engine/entities/Stars';
import randomRange from './engine/utils/randomRange';

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
    return new THREE.Color(`hsl(20, 100%, 70%)`);
  }

  async loadAsync() {
    this.scene = this.createScene();
    const { color } = this;
    this.scene.background = color;
    this.scene.fog = new THREE.Fog(color, 100, 950);

    this.scene.add(this);
    this.camera = await this.createCameraAsync(this._width, this._height);

    const types = [new Lighting(), new Stars()];
    const promises = types.map(type => this.add(type));
    await Promise.all(promises);
    await this.loadGame();
    await super.loadAsync(this.scene);
    this.gameEnded = false;
  }

  loadGame = async () => {
    if (this.terrainGroup) {
      this.remove(this.terrainGroup);
    }
    this.terrainGroup = await this.add(new Group());

    if (this.enemyGroup) {
      this.remove(this.enemyGroup);
    }
    this.enemyGroup = await this.add(new Group());
    this.camera.position.x = width / Settings.cubeSize * Settings.cubeSize / 2;
    for (let i = 0; i < width / Settings.cubeSize + 2; i++) {
      const square = await this.terrainGroup.add(new Platform());
      square.x = i * Settings.cubeSize;
    }

    if (this.hero) {
      this.remove(this.hero);
    }
    this.hero = await this.add(new Cuboid());
    this.hero.x = Settings.initialCube * Settings.cubeSize;
    this.hero.y = Settings.cubeSize;
    this.hero.canMove = true;

    this.addEnemy();
  };

  onTouchesBegan = async ({ pageX: x, pageY: y }) => {
    this.moveSquare();
    dispatch.game.play();

    if (Math.round(randomRange(0, 3)) === 0) {
      this.takeScreenshot();
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

    this.hero.canMove = false;
    AudioManager.sharedInstance.pauseAsync('song');
    const name = 'bass_0' + Math.round(randomRange(0, 8));
    AudioManager.sharedInstance.playAsync(name);

    const duration = 0.8;

    TweenMax.to(this.scale, duration, {
      y: 0.0001,
      z: 0.0001,
      ease: ExpoEase.easeOut,
      onComplete: () => {
        this.reset();

        TweenMax.to(this.scale, duration, {
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
      TweenMax.to(this.terrainGroup, Settings.moveAnimationDuration, {
        x: this.terrainGroup.x - Settings.cubeSize,
      });
      TweenMax.to(this.enemyGroup, Settings.moveAnimationDuration, {
        x: this.terrainGroup.x - Settings.cubeSize,
      });

      TweenMax.to(this.hero.rotation, Settings.moveAnimationDuration, {
        z: this.hero.rotation.z - Math.PI / 2,
        onComplete: async () => {
          this.hero.canMove = true;
          const index = this.terrainGroup.subIndex || 0;
          const enemy = this.enemyGroup.objects[0];
          if (
            this.enemyGroup.objects.length > 0 &&
            enemy.x <= this.terrainGroup.objects[index].x
          ) {
            this.enemyGroup.remove(enemy);
          }

          this.terrainGroup.objects[index].position.x +=
            this.terrainGroup.children.length * Settings.cubeSize;
          this.terrainGroup.subIndex =
            (index + 1) % this.terrainGroup.objects.length;

          if (randomRange(0, 9) > 6) {
            await this.addEnemy();
          }
        },
      });
    }
  };

  collision = () => {
    const playerIndex = Math.floor((this.hero.x - this.enemyGroup.x) / 40);

    for (let enemy of this.enemyGroup.objects) {
      const index = Math.floor(enemy.x / 40);
      if (playerIndex === index) {
        if (enemy.collidable) {
          this.gameOver();
        }
        return;
      }
    }
  };

  addEnemy = async () => {
    const count = this.terrainGroup.objects.length;
    const enemy = await this.enemyGroup.add(new Cuboid());
    enemy.speed = randomRange(3, 3.25);
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

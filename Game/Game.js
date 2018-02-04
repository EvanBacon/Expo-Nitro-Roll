import Settings from '../constants/Settings';
import { dispatch } from '@rematch/core';
import ExpoTHREE, { THREE } from 'expo-three';
import { Expo as ExpoEase, Linear, TweenLite, Quad } from 'gsap';

import AudioManager from '../Manager/AudioManager';
import GameObject from './engine/core/GameObject';
import Group from './engine/core/Group';
import Cuboid from './engine/entities/Cuboid';
import Lighting from './engine/entities/Lighting';
import Platform from './engine/entities/Platform';
import Stars from './engine/entities/Stars';
import randomRange from './engine/utils/randomRange';
import Obstacle from './engine/entities/Obstacle';
import Terrain from './engine/entities/Terrain';
import Level from './engine/entities/Level';

const height = Settings.cubeSize * Settings.cubesHigh;
const width = Settings.cubeSize * Settings.cubesWide;

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
    if (this.level) {
      this.remove(this.level);
      this.level = null;
    }
    this.level = await this.add(new Level());
    this.level.onCollide = () => this.gameOver();

    this.camera.position.x = width / Settings.cubeSize * Settings.cubeSize / 2;

    if (this.hero) {
      this.remove(this.hero);
    }
    this.hero = await this.add(new Cuboid());

    this.lastLevelPosition = 0;
    this.hero.onMove = value => {
      this.level.x = this.lastLevelPosition - value % Settings.cubeSize;
    };
    this.hero.onComplete = async () => {
      this.level.finishedMoving();
    };

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
      dispatch.score.increment();
      this.score += 1;
      this.level.score = this.score;
      this.lastLevelPosition = this.level.x;
      this.hero.rotating = true;
    }
  };

  update(delta, time) {
    super.update(delta, time);
    this.level.playerIndex = this.hero.index;
  }

  onResize = ({ width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}

export default Game;

import { dispatch } from '@rematch/core';
import ExpoTHREE, { THREE } from 'expo-three';
import { Expo as ExpoEase, Linear, TweenLite } from 'gsap';

import Settings from '../constants/Settings';
import AudioManager from '../Manager/AudioManager';
import GameObject from './engine/core/GameObject';
import Cuboid from './engine/entities/Cuboid';
import Level from './engine/entities/Level';
import Lighting from './engine/entities/Lighting';
import Stars from './engine/entities/Stars';
import randomRange from './engine/utils/randomRange';

class Game extends GameObject {
  gameEnded = true;

  constructor(width, height, renderer) {
    super();
    this.renderer = renderer;
    this._width = width;
    this._height = height;
  }

  createScene = () => {
    const scene = new THREE.Scene();
    // this.scene.background = color;
    scene.fog = new THREE.Fog(new THREE.Color(`hsl(20, 100%, 0%)`), 100, 950);
    scene.add(this);
    return scene;
  };

  createCamera = async (width, height) => {
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    const spaceWidth = (Settings.cubesWide - 2) * Settings.cubeSize * 0.5;

    camera.position.set(spaceWidth, 100, 400);
    camera.lookAt(new THREE.Vector3(spaceWidth + 20, 80, 0));
    return camera;
  };

  async reset() {
    super.reset();
    dispatch.game.menu();
    AudioManager.sharedInstance.playAsync('song', true, false);
    await this.loadGame();
  }

  async loadAsync() {
    this.scene = this.createScene();
    this.camera = await this.createCamera(this._width, this._height);
    await this.loadAnonymous();
    await this.reset();
    await super.loadAsync(this.scene);
  }

  loadAnonymous = async () => {
    const types = [new Lighting(this), new Stars(this)];
    const promises = types.map(type => this.add(type));
    return Promise.all(promises);
  };

  loadLevel = async () => {
    if (this.level) {
      this.remove(this.level);
      this.level = null;
    }
    this.level = await this.add(new Level());
    this.level.onCollide = () => this.gameOver();
  };

  loadHero = async () => {
    this.lastLevelPosition = 0;

    if (this.hero) {
      this.remove(this.hero);
    }
    this.hero = await this.add(new Cuboid());
    // this.hero.onMove = value =>
    //   (this.level.x = this.lastLevelPosition - value % Settings.cubeSize);
    this.hero.onComplete = async () => (this.level.index = this.index);
  };

  loadGame = async () => {
    await this.loadLevel();
    await this.loadHero();
  };

  onTouchesBegan = async ({ pageX: x, pageY: y }) => {
    if (this.gameEnded) {
      this.gameEnded = false;

      dispatch.score.reset();
      dispatch.game.play();
    } else if (Math.round(randomRange(0, 3)) === 0) {
      // this.takeScreenshot();
    }
    this.moveSquare();
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

    AudioManager.sharedInstance.pauseAsync('song');
    const name = 'bass_0' + Math.round(randomRange(0, 8));
    AudioManager.sharedInstance.playAsync(name);

    this.takeScreenshot();
    this.screenShotTaken = false;

    this.animateGameOver();
  };

  animateGameOver = () => {
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

  get index() {
    const index = Math.abs(Math.round(this.level.x)) / Settings.cubeSize;
    return index;
  }

  moveSquare = () => {
    if (!this.hero.rotating && !this.gameEnded) {
      this.scorePoint();
      this.hero.rotating = true;
      this.level.move();
    }
  };

  scorePoint = () => {
    AudioManager.sharedInstance.playAsync(
      'pop_0' + Math.round(randomRange(0, 1)),
    );
    dispatch.score.increment();
  };

  onResize = ({ width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}

export default Game;

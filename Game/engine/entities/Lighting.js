import { THREE } from 'expo-three';

import GameObject from '../core/GameObject';

class Lighting extends GameObject {
  // get ambient() {
  //   return new THREE.AmbientLight(0xffffff);
  // }

  get shadow() {
    let light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(0, 350, 350);
    return light;
  }

  loadAsync = async scene => {
    // this.add(this.ambient);
    this.add(this.shadow);
    await super.loadAsync(scene);
  };
}

export default Lighting;

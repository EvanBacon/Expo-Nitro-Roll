import Colors from '../../constants/Colors';
import { THREE } from 'expo-three';
class Factory {
  materials = {};

  constructor() {
    Object.keys(Colors).map(key => {
      this.materials[key] = new THREE.MeshLambertMaterial({
        color: Colors[key],
      });
    });
  }
}

global.factory = Factory.shared = new Factory();

export default Factory;

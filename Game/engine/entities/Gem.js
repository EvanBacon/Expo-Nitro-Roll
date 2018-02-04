import ExpoTHREE, { THREE } from 'expo-three';

import GameObject from '../core/GameObject';
import Factory from '../Factory';
import Settings from '../../../constants/Settings';
import randomRange from '../utils/randomRange';

class Gem extends GameObject {
  loadAsync = async scene => {
    global.gemGeom = global.gemGeom || this.gemGeometry;
    this._mat = Factory.shared.materials.green; //.clone();
    const mesh = new THREE.Mesh(global.gemGeom, this._mat);
    ExpoTHREE.utils.scaleLongestSideToSize(mesh, 30);
    this.add(mesh);

    await super.loadAsync(scene);
  };
  get gemGeometry() {
    const geometry = new THREE.CylinderGeometry(0.6, 1, 0.3, 6, 1);
    geometry.vertices[geometry.vertices.length - 1].y = -1;
    geometry.verticesNeedUpdate = true;

    return geometry;
  }
}

export default Gem;

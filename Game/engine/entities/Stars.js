import GameObject from '../core/GameObject';
import flatMaterial from '../utils/flatMaterial';
import randomRange from '../utils/randomRange';

class Stars extends GameObject {
  particles = [];
  loadAsync = async scene => {
    const particles = new THREE.Group();
    this.add(particles);
    const geometry = new THREE.TetrahedronGeometry(3, 0);
    const geometryBall = new THREE.SphereBufferGeometry(5, 7, 7);

    const color = 0xff0000;
    const material = flatMaterial({ color });

    for (let i = 0; i < 500; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
      );
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      mesh.rotation.set(
        randomRange(0, Math.PI),
        randomRange(0, Math.PI),
        randomRange(0, Math.PI),
      );
      particles.add(mesh);
      this.particles.push(mesh);
    }

    this.y = 150;
    this.z = -600 * 1.1;

    await super.loadAsync(scene);
  };

  update = (delta, time) => {
    super.update(delta, time);
    this.rotation.z -= 0.01 * delta;
    this.rotation.x -= 0.05 * delta;
  };
}

export default Stars;

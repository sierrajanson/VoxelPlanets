export default class Stars {
    constructor (THREE, numStars=100000, distanceStars=20000, starColor=0x8886688) {
        this.starsGeometry = new THREE.BufferGeometry();
        this.starsMaterial = new THREE.PointsMaterial({color: starColor});
        this.starVertices = [];
        for (let i = 0; i < numStars; i++) {
          const x = THREE.MathUtils.randFloatSpread(distanceStars);
          const y = THREE.MathUtils.randFloatSpread(distanceStars);
          const z = THREE.MathUtils.randFloatSpread(distanceStars);
          this.starVertices.push(x, y, z);
        }
        this.starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.starVertices, 3));
        this.stars = new THREE.Points(this.starsGeometry, this.starsMaterial);
    }
    spawn(scene) {
        scene.add(this.stars);
    }
}

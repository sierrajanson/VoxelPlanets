export default class Ship {
  constructor(THREE, body, x, y, z) {
    this.body = body;
    this.body.position.x = x;
    this.body.position.y = y;
    this.body.position.z = z;

    this.rollVelocity = 0;
    this.pitchVelocity = 0;

    this.rollAcceleration = 0.005;
    this.rollSpeed = 0;
    this.maxRollSpeed = 0.045;
    this.rollDeceleration = 0.001;

    this.yawAcceleration = 0.005;
    this.yawSpeed = 0;
    this.maxYawSpeed = 0.045;
    this.yawDeceleration = 0.001;

    this.offset = new THREE.Vector3(0, 0, -15); 

    this.flySpeed = 5;
    this.warpSpeed = 15;
  }

  update(THREE, camera, keys) {
    let direction = new THREE.Vector3();
    const xaxis = new THREE.Vector3(1, 0, 0).normalize(); 
    const yaxis = new THREE.Vector3(0, 1, 0).normalize(); 
    const zaxis = new THREE.Vector3(0, 0, 1).normalize(); 

    this.body.getWorldDirection(direction);
    if (keys.Space) {
      this.body.position.add(direction.multiplyScalar(this.warpSpeed))
    } else {
      this.body.position.add(direction.multiplyScalar(this.flySpeed))
    }
    const idealPosition = this.offset.clone().applyQuaternion(this.body.quaternion).add(this.body.position);
    camera.position.lerp(idealPosition, 0.3);
    const xwingUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.body.quaternion);
    camera.up.copy(xwingUp);
    camera.lookAt(this.body.position);
    if (keys.KeyW) {
        this.yawSpeed += this.yawAcceleration;
        if (this.yawSpeed > this.maxYawSpeed) {
            this.yawSpeed = this.maxYawSpeed;
        }
    } else if (this.yawSpeed > 0) {
        this.yawSpeed -= this.yawDeceleration;
        if (this.yawSpeed < 0) {
            this.yawSpeed = 0;
        }
    }
    if (keys.KeyS){ 
        this.yawSpeed -= this.yawAcceleration;
        if (this.yawSpeed < -this.maxYawSpeed) {
            this.yawSpeed = -this.maxYawSpeed;
        }
    } else if (this.yawSpeed < 0) {
        this.yawSpeed += this.yawDeceleration;
        if (this.yawSpeed > 0) {
            this.yawSpeed = 0;
        }
    }
    this.body.rotateOnAxis(xaxis, this.yawSpeed);

    if (keys.KeyD) {
        this.rollSpeed += this.rollAcceleration;
        if (this.rollSpeed > this.maxRollSpeed) {
            this.rollSpeed = this.maxRollSpeed;
        }
    } else if (this.rollSpeed > 0) {
        this.rollSpeed -= this.rollDeceleration;
        if (this.rollSpeed < 0) {
            this.rollSpeed = 0;
        }
    }
    if (keys.KeyA){ 
        this.rollSpeed -= this.rollAcceleration;
        if (this.rollSpeed < -this.maxRollSpeed) {
            this.rollSpeed = -this.maxRollSpeed;
        }
    } else if (this.rollSpeed < 0) {
        this.rollSpeed += this.rollDeceleration;
        if (this.rollSpeed > 0) {
            this.rollSpeed = 0;
        }
    }
    this.body.rotateOnAxis(zaxis, this.rollSpeed);

    // if (keys.KeyH) {
    //   const geometry = new THREE.BoxGeometry( 50, 50, 50 );
    //   const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    //   const cube = new THREE.Mesh( geometry, material );
    //   cube.position.set(direction.multiplyScalar(5))
    //   scene.add( cube );
    // }
  }
}

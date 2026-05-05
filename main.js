import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

const simplex = new SimplexNoise();

// need a scene, camaera, and render... render the scene with camera
const scene = new THREE.Scene();
// FOV, aspect ratio,near, near far
const camera = new THREE.PerspectiveCamera(105, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight ); // set size at which to render app
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, 0);
controls.update();

const loader = new GLTFLoader();
controls.screenSpacePanning = true; 

camera.position.z = 5; // so we set the camera position back a bit
// let mixer;

// // LOAD IN X-WING
// loader.load("x-wing-animated.glb", function ( gltf ) {
//   scene.add( gltf.scene );
//     mixer = new THREE.AnimationMixer(gltf.scene);
//     if (gltf.animations.length > 0) {
//         const action = mixer.clipAction(gltf.animations[0]);
//         action.play();
//     }
// }, undefined, function ( error ) {
//   console.error( error )
// } );

// // LIGHTING
const light2 = new THREE.AmbientLight( 0xFFFFFF  ); // soft white light
scene.add( light2 );
const color = 0xFFFFFF; // White light
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 0, 2);
light.target.position.set(0, 0, 1); // Pointing towards a target
scene.add(light);
scene.add(light.target); // Need to add the target as well

const cellSize = 20;
// const cell = new Uint8Array(cellSize * cellSize * cellSize);

// for (let y = 0; y < cellSize; ++y) {
//   for (let z = 0; z < cellSize; ++z) {
//     for (let x = 0; x < cellSize; ++x) {
//       const height = (Math.sin(x / cellSize * Math.PI * 4) + Math.sin(z / cellSize * Math.PI * 6)) * 20 + cellSize / 2;
//       if (height > y && height < y + 1) {
//         const offset = y * cellSize * cellSize +
//                        z * cellSize +
//                        x;
//         cell[offset] = 1;
//       }
//     }
//   }
// }
// console.log(cell)


const geometry = new THREE.BoxGeometry(1, 1, 1);
const water = new THREE.MeshPhongMaterial({color: 'blue', transparent:true, opacity:0.7});
 const grass = new THREE.MeshPhongMaterial({color: 'green'})
// have one angle for pitch, one for yaw...then how to turn that into 3d coordinates
const r = 20
const voxels = [];
for (let x = -r; x < r; x++) {
  for (let y = -r; y < r; y++) {
    for (let z = -r; z < r; z++) {
      const d = Math.sqrt(x**2+y**2+z**2)
      let mat;
      if (Math.abs(d-r) <=1 && simplex.noise3d(x/r, y/r, z/r) < 0.5) {
        mat = water;
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.position.set(x,y,z)
        scene.add(mesh);
      }
      else if (Math.abs(d-r) <= 1) {
        mat = grass;
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.position.set(x,y,z)
        scene.add(mesh);
      }
    }
  }
}

// const mesh = new THREE.InstancedMesh(geometry, material, voxels.length)
// const holder = new THREE.Object3D();

// for (let i = 0; i < voxels.length; i++) {
//   const {x,y,z} = voxels[i];
//   holder.position.set(x,y,z)
//   holder.updateMatrix()
//   mesh.setMatrixAt(i, holder.matrix)
// }
// scene.add(mesh)

function render() {
  renderer.render( scene, camera );
}

render();
// controls.enableDamping = true;
controls.addEventListener('change', render);
window.addEventListener('resize', render);

// function animate( time ) { // actually renders the scene
    // if (mixer) {
    //     mixer.update(-time/200000);
    // }
// }
// renderer.setAnimationLoop( animate );

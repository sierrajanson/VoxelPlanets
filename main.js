import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import Planet from '/Planet.js'
const simplex = new SimplexNoise();

// need a scene, camaera, and render... render the scene with camera
const scene = new THREE.Scene();
// FOV, aspect ratio,near, near far
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight ); // set size at which to render app
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, -25);
controls.update();

const loader = new GLTFLoader();
controls.screenSpacePanning = true; 

camera.position.z = -5; // so we set the camera position back a bit
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

for (let i = 0; i < 100; i++) {
  const radius = Math.random()*20+2
  const baseColor = Math.random()*360
  const range = 500;
  const ox = Math.random()*range-range/2
  const oy = Math.random()*range-range/2
  const oz = Math.random()*range-range/2
  
  const p = new Planet(
    {ox,oy,oz}, 
    radius, 
    `hsl(${baseColor + Math.random()*40 - 40}, 100%, 50%)`,
    `hsl(${baseColor}, 100%, 50%)`, 
)

  // makePlanet(Math.random()*20+2, `hsl(${baseColor}, 100%, 50%)`, `hsl(${baseColor + Math.random()*40 - 40}, 100%, 50%)`, `hsl(${baseColor}, 80%, 70%)`)

  p.buildPlanet(scene);
  // p.buildRings(scene)
}
function render() {
  renderer.render( scene, camera );
}

render();
// controls.enableDamping = true;
controls.addEventListener('change', render);
window.addEventListener('resize', render);

// generate moons
// generate rings
// generate clouds
// generate different types of ground
// suns + planets
// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// // import Ship from './Ship.js';
// // import Stars from './Stars.js';
// import Planet from './Planet.js';

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);// FOV, aspect ratio,near, near far
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild( renderer.domElement );

// // const stars = new Stars(THREE)
// // stars.spawn(scene);

// const planet = new Planet({x:0,y:0,z:0}, 5, 'green', 'blue')
// planet.buildPlanet(scene);
// // let mixer;
// // let xwing;
// // const GLTFloader = new GLTFLoader();
// // GLTFloader.load("x-wing-animated.glb", function ( gltf ) {
// //   xwing = new Ship(THREE, gltf.scene, 0, -7, 60);
// //   scene.add(xwing.body);
// //   mixer = new THREE.AnimationMixer(gltf.scene);
// //   if (gltf.animations.length > 0) {
// //     const action = mixer.clipAction(gltf.animations[0]);
// //     action.play();
// //   }
// // }, undefined, function ( error ) {console.error( error )} );
// // const atmosgeo = new THREE.SphereGeometry(r+3);
// // const atmosmat = new THREE.MeshStandardMaterial({ color: 0x0096FF, transparent: true, opacity:0.2, emissive: 0x0096FF});


// function render () {renderer.render( scene, camera )}
// // window.addEventListener('resize', render);

// // const keys = {
// //   KeyW: false,
// //   KeyA: false,
// //   KeyS: false,
// //   KeyD: false,
// //   KeyH: false,
// //   Space: false
// // };

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.target.set(0, 0, 0);
// controls.update();
// controls.screenSpacePanning = true; 
// controls.addEventListener('change', render);
// render();

// // window.addEventListener('keydown', (e) => keys[e.code] = true);
// // window.addEventListener('keyup', (e) => keys[e.code] = false);

// // function animate( time ) { // actually renders the scene
  
// //   // camera.getWorldDirection(direction); 
// //   // camera.position.add(direction); 
// //   // console.log(camera.position)

// //   if (xwing) {
// //     // xwing.update(THREE, camera, keys);
// //     render()
// //   }
// // }
// // renderer.setAnimationLoop( animate );



import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import Planet from '/Planet.js'

import Stars from './Stars.js';
import Ship from './Ship.js'

const simplex = new SimplexNoise();

// need a scene, camaera, and render... render the scene with camera
const scene = new THREE.Scene();
// FOV, aspect ratio,near, near far
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000 );
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
let xwing;

// LOAD IN X-WING
loader.load("x-wing-animated.glb", function ( gltf ) {
  xwing = new Ship(THREE, gltf.scene, 0, -7, 60);
  console.log(xwing)
  scene.add(xwing.body);    
  // mixer = new THREE.AnimationMixer(gltf.scene);
    // if (gltf.animations.length > 0) {
    //     const action = mixer.clipAction(gltf.animations[0]);
    //     action.play();
    // }
}, undefined, function ( error ) {
  console.error( error )
} );
const stars = new Stars(THREE)
stars.spawn(scene);

// spawn planets
for (let i = 0; i < 100; i++) {
  const radius = Math.random()*20+2
  const range = 500;
  const ox = Math.random()*range-range/2
  const oy = Math.random()*range-range/2
  const oz = Math.random()*range-range/2
  const baseColor = Math.random()*360
  // const palette = [0, 120, 280]
  // const baseColor = palette[Math.floor(Math.random() * palette.length)]
  // const hue = (baseColor + (Math.random() - 0.5) * 40 + 360) % 360

  const p = new Planet(
    {ox,oy,oz}, 
    radius, 
    `hsl(${baseColor}, 100%,  ${Math.random()*25+15}%)`,
    `hsl(${(baseColor+Math.random()*40+20)%360}, 100%, ${Math.random()*25+15}%)`, 
  )

  function halfCondition(x) {
    return x < 0
  }
  function randomCondition(x) {
    return Math.random() < 0.5
  }

  if (Math.random() < 0.2) { // half & half with rings
    p.buildGasPlanet(scene, halfCondition);
    p.buildRings(scene)
  } else if (Math.random() < 0.01) { // random color planet
    p.buildGasPlanet(scene, randomCondition)
  } else {
    p.buildPlanet(scene)
  }
  // moon logic
  if (Math.random() <0.05) {
    // make moon placement & # more random
    const moonpoffset=radius+3
    const p = new Planet(
      {ox:ox+moonpoffset,oy:oy+moonpoffset,oz:oz+moonpoffset}, 
      radius/10, `hsl(${(baseColor+Math.random()*40+20)%360}, 100%, ${Math.random()*25+5}%)`,`hsl(${(baseColor+Math.random()*40+20)%360}, 100%, ${Math.random()*25+5}%)`
    )
    p.buildPlanet(scene)
  }
}
function render() {
  renderer.render( scene, camera );
}

// controls.enableDamping = true;
controls.addEventListener('change', render);
window.addEventListener('resize', render);

// generate clouds
// add gravity
// add black holes
// add cute slow music
// generate different types of ground
// suns + planets

const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  KeyH: false,
  Space: false
};

window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);
const planetlighting = new THREE.AmbientLight( 0xFFFFFF,5); // soft white light
scene.add( planetlighting );

function animate( time ) { // actually renders the scene
  
  // camera.getWorldDirection(direction); 
  // camera.position.add(direction); 
  // console.log(camera.position)

  if (xwing) {
    xwing.update(THREE, camera, keys);
    render()
  }
}
renderer.setAnimationLoop( animate );


import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

const simplex = new SimplexNoise();

// todo list --> vary noise level
// generate moons
// generate rings
// stars in background
// rotation of planets

// need a scene, camaera, and render... render the scene with camera
const scene = new THREE.Scene();
// FOV, aspect ratio,near, near far
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight ); // set size at which to render app
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, 0);
controls.update();

const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({color: 0x8886688});
const starVertices = [];
for (let i = 0; i < 10000; i++) {
  const x = THREE.MathUtils.randFloatSpread(2000);
  const y = THREE.MathUtils.randFloatSpread(2000);
  const z = THREE.MathUtils.randFloatSpread(2000);
  starVertices.push(x, y, z);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

controls.screenSpacePanning = true; 
camera.position.z = 5; // so we set the camera position back a bit
// let mixer;

// const GLTFloader = new GLTFLoader();
// // LOAD IN X-WING
// GLTFloader.load("x-wing-animated.glb", function ( gltf ) {
//   scene.add( gltf.scene );
//     mixer = new THREE.AnimationMixer(gltf.scene);
//     if (gltf.animations.length > 0) {
//         const action = mixer.clipAction(gltf.animations[0]);
//         action.play();
//     }
// }, undefined, function ( error ) {
//   console.error( error )
// } );


function makePlanetAtmosphere (origin, planetRadius, atmosphereColor) {

  const atmosmat = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(atmosphereColor) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        float intensity = 1.5 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );
        float alpha = pow(intensity, 2.0); 
        
        gl_FragColor = vec4(glowColor, alpha);
      }
    `,
    transparent: true
  });
  
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(planetRadius+2.5), atmosmat);
  const {x,y,z} = origin
  atmosphere.position.set(x,y,z)
  scene.add(atmosphere);
}
// const atmosgeo = new THREE.SphereGeometry(r+3);
// const atmosmat = new THREE.MeshStandardMaterial({ color: 0x0096FF, transparent: true, opacity:0.2, emissive: 0x0096FF});
let waterMesh;
function makePlanetBody(origin, radius, waterColor, grassColor, seed) {
  /**
   * need to pass in origin point
   * grass color
   * water color
   * planet radius
   * water amount
   */
  const r = radius;
  let {x,y,z}= origin;
  const ox = x;
  const oy = y;
  const oz = z;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const water = new THREE.MeshPhongMaterial({color: waterColor, opacity:0.8});
  const grass = new THREE.MeshPhongMaterial({color: grassColor})

  const waterVoxels = [];
  const grassVoxels = [];

  for (let x = -r; x < r; x++) {
    for (let y = -r; y < r; y++) {
      for (let z = -r; z < r; z++) {
        const d = Math.sqrt(x**2+y**2+z**2)
        let mat;
        if (Math.abs(d-r) <=1 && simplex.noise3d(x/r + seed, y/r, z/r) < 0.4) {
          waterVoxels.push({x:x+ox,y:y+oy,z:z+oz})
        }
        else if (Math.abs(d-r) <= 1) {
          grassVoxels.push({x:x+ox,y:y+oy,z:z+oz})
        }
      }
    }
  }
  waterMesh = new THREE.InstancedMesh(geometry, water, waterVoxels.length)
  const grassMesh = new THREE.InstancedMesh(geometry, grass, grassVoxels.length)

  const waterHolder = new THREE.Object3D();
  const grassHolder = new THREE.Object3D();

  for (let i = 0; i < waterVoxels.length; i++) {
    const {x,y,z} = waterVoxels[i];
    waterHolder.position.set(x,y,z)
    waterHolder.updateMatrix()
    waterMesh.setMatrixAt(i, waterHolder.matrix)
  }
  scene.add(waterMesh)

  for (let i = 0; i < grassVoxels.length; i++) {
    const {x,y,z} = grassVoxels[i];
    grassHolder.position.set(x,y,z)
    grassHolder.updateMatrix()
    grassMesh.setMatrixAt(i, grassHolder.matrix)
  }
  scene.add(grassMesh)
}

const radius = 20

function randomColorSampler(colorList) {
  const [red,green,blue] = colorList
  const max = Math.max(red, green, blue) // map 0 -> max to 0 to 255
  const multiplier = 255/max;
  p = Math.random() * 0.8 + 0.2;
  return `rgb(${red*p* multiplier}, ${green*p* multiplier}, ${blue*p* multiplier})`
}

function makePlanet(radius, grassColor, waterColor,atmosColor) {
  const range = 300
  const origin = {x:Math.random()*range-range/2,y:Math.random()*range-range/2,z:Math.random()*range-range/2}
  if (Math.random() > 0.3) makePlanetAtmosphere(origin,radius+1+Math.random()*3, atmosColor)
  makePlanetBody(origin, radius, grassColor, waterColor,Math.random()*5000)
}

for (let i = 0; i < 40; i++) {
  const baseColor = Math.random()*360
  makePlanet(Math.random()*20+2, `hsl(${baseColor}, 100%, 50%)`, `hsl(${baseColor + Math.random()*40 - 40}, 100%, 50%)`, `hsl(${baseColor}, 80%, 70%)`)
}
// const origin2 = {x:40,y:40,z:-30}
// makePlanetAtmosphere(origin2, radius/2+1, 0x8F0000)
// makePlanetBody(origin2, radius/2, 'red', 'purple',8008)

// const origin3 = {x:-30,y:-20,z:-60}
// makePlanetAtmosphere(origin3, radius/2+1, 0xFFAA06)
// makePlanetBody(origin3, radius/2, 'yellow', 'green',6969)

// const origin4 = {x:-30,y:-20,z:-20}
// makePlanetAtmosphere(origin4, radius/2+1, 0xFFAA06)
// makePlanetBody(origin4, radius/2, '#EE22EE', '#FF00FF')


const planetlighting = new THREE.AmbientLight( 0xFFFFFF,5); // soft white light
scene.add( planetlighting );


// const loader = new THREE.TextureLoader();
// const texture = loader.load(
// 'spacebackground.jpg',
// () => {
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   texture.colorSpace = THREE.SRGBColorSpace;
//   scene.background = texture;
// });

function render() {
  renderer.render( scene, camera );
}

render();
// controls.enableDamping = true;
controls.addEventListener('change', render);
window.addEventListener('resize', render);

function animate( time ) { // actually renders the scene

}
renderer.setAnimationLoop( animate );

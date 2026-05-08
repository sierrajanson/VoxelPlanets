import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import Ship from './Ship.js';

const simplex = new SimplexNoise();

// generate moons
// generate rings
// stars in background
// rotation of planets

// need a scene, camaera, and render... render the scene with camera
const scene = new THREE.Scene();
// FOV, aspect ratio,near, near far
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight ); // set size at which to render app
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, 5);
controls.update();

const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({color: 0x8886688});
const starVertices = [];
for (let i = 0; i < 100000; i++) {
  const x = THREE.MathUtils.randFloatSpread(20000);
  const y = THREE.MathUtils.randFloatSpread(20000);
  const z = THREE.MathUtils.randFloatSpread(20000);
  starVertices.push(x, y, z);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

controls.screenSpacePanning = true; 
camera.position.z = 5; // so we set the camera position back a bit
// let mixer;

let xwing;

const GLTFloader = new GLTFLoader();
// // LOAD IN X-WING
GLTFloader.load("x-wing-animated.glb", function ( gltf ) {
  xwing = new Ship(THREE, gltf.scene, 0, -7, 60);
  scene.add(xwing.body);
  console.log(xwing);
//     mixer = new THREE.AnimationMixer(gltf.scene);
    // if (gltf.animations.length > 0) {
    //     const action = mixer.clipAction(gltf.animations[0]);
    //     action.play();
    // }
}, undefined, function ( error ) {
  console.error( error )
} );

const SCALE = 18;

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
function makePlanetBody(origin, radius, waterColor, grassColor, seed=Math.random()*5000, waterPercentage=Math.random()) {
  /**
   * need to pass in origin point
   * grass color
   * water color
   * planet radius
   * water amount
   */
  let r = radius;
  let {x,y,z}= origin;
  const ox = x;
  const oy = y;
  const oz = z;
  const blockSize = 1;
  const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
  const water = new THREE.MeshPhongMaterial({color: waterColor, opacity:0.8});
  const grass = new THREE.MeshPhongMaterial({color: grassColor})

  const waterVoxels = [];
  const grassVoxels = [];

  for (let x = -r; x < r; x+=blockSize) {
    for (let y = -r; y < r; y+=blockSize) {
      for (let z = -r; z < r; z+=blockSize) {
        const d = Math.sqrt(x**2+y**2+z**2)
        let mat;
        if (Math.abs(d-r) <=1 && simplex.noise3d(x/r + seed, y/r, z/r) < waterPercentage) {
          waterVoxels.push({x:x+ox,y:y+oy,z:z+oz})
        }
        else if (Math.abs(d-r) <= 1) {
          grassVoxels.push({x:x+ox,y:y+oy,z:z+oz})
        }
      }
    }
  }
// let geometry2 = new THREE.BoxGeometry(1, 1, 1);
//   r = r + 10
//   for (let x = -r; x < r; x++) {
//     for (let y = -r; y < r; y++) {
//       for (let z = -r; z < r; z++) {
//         const d = Math.sqrt(x**2+y**2+z**2)
//         if (Math.abs(d-r) <=2 && z >= r-5) {
//           const mesh = new THREE.Mesh(geometry2,grass);
//           mesh.position.set(x,y,z)
//           // mesh.position.set(x+ox-r,y+oy-r,z+oz-r)
//           scene.add(mesh);
//         }
//       }
//     }
//   }
  waterMesh = new THREE.InstancedMesh(geometry, water, waterVoxels.length)
  const grassMesh = new THREE.InstancedMesh(geometry, grass, grassVoxels.length)

  const waterHolder = new THREE.Object3D();
  const grassHolder = new THREE.Object3D();

  for (let i = 0; i < waterVoxels.length; i++) {
    const {x,y,z} = waterVoxels[i];
    waterHolder.position.set(x,y,z)
    waterHolder.updateMatrix()
    waterMesh.scale.set(SCALE,SCALE,SCALE)
    waterMesh.setMatrixAt(i, waterHolder.matrix)
  }
  scene.add(waterMesh)

  for (let i = 0; i < grassVoxels.length; i++) {
    const {x,y,z} = grassVoxels[i];
    grassHolder.position.set(x,y,z)
    grassHolder.updateMatrix()
    grassMesh.scale.set(SCALE,SCALE,SCALE)
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
  const range = 500
  const origin = {x:Math.random()*range-range/2,y:Math.random()*range-range/2,z:Math.random()*range-range/2}
  // if (Math.random() > 0.3) makePlanetAtmosphere(origin,radius+1+Math.random()*3, atmosColor)
  makePlanetBody(origin, radius, grassColor, waterColor)
}

for (let i = 0; i < 100; i++) {
  const baseColor = Math.random()*360
  makePlanet(Math.random()*20+2, `hsl(${baseColor}, 100%, 50%)`, `hsl(${baseColor + Math.random()*40 - 40}, 100%, 50%)`, `hsl(${baseColor}, 80%, 70%)`)
}

const planetlighting = new THREE.AmbientLight( 0xFFFFFF,5); // soft white light
scene.add( planetlighting );

function render() {
  renderer.render( scene, camera );
}

render();
// controls.enableDamping = true;
controls.addEventListener('change', render);
window.addEventListener('resize', render);

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



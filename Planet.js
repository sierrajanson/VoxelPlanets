import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import * as THREE from 'three';

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

const simplex = new SimplexNoise();

export default class Planet {
    constructor(origin, radius, grassColor, waterColor) {
        this.radius = radius
        this.origin = origin

        this.seed = Math.random()*5000
        this.waterPercentage = Math.random()*0.8 + 0.2
        // this.atmosColor = atmosColor
        this.blockSize = 1;
        this.geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        this.water = new THREE.MeshPhongMaterial({color: waterColor, opacity:0.8});
        this.grass = new THREE.MeshPhongMaterial({color: grassColor})
        this.planetlighting = new THREE.AmbientLight( 0xFFFFFF,3); // soft white light

        this.ringDistance = Math.floor(Math.random()*3 + 2)
        this.ringThickness = this.ringDistance + Math.floor(Math.random()*10 + 2)
        this.ringScaler = Math.random() + 1
    }
    buildPlanet(scene){
        let r = this.radius;
        let {ox,oy,oz}= this.origin;

        const waterVoxels = [];
        const grassVoxels = [];

        for (let x = -r; x < r; x+=this.blockSize) {
            for (let y = -r; y < r; y+=this.blockSize) {
                for (let z = -r; z < r; z+=this.blockSize) {
                    const d = Math.sqrt(x**2+y**2+z**2)
                    if (Math.abs(d-r) <=1 && simplex.noise3d(x/r + this.seed, y/r, z/r) < this.waterPercentage) {
                        waterVoxels.push({x:x+ox,y:y+oy,z:z+oz})
                    }
                    else if (Math.abs(d-r) <= 1) {
                        grassVoxels.push({x:x+ox,y:y+oy,z:z+oz})
                    }
                }
            }
        }

        const waterMesh = new THREE.InstancedMesh(this.geometry, this.water, waterVoxels.length)
        const grassMesh = new THREE.InstancedMesh(this.geometry, this.grass, grassVoxels.length)

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
    buildRings(scene) {
        const innerR = this.radius + this.ringDistance
        const outerR = this.radius + this.ringThickness
        const ovalScale = this.ringScaler
        const ringVoxels = [];
        let {ox,oy,oz}= this.origin;

        for (let y = -outerR * ovalScale; y < outerR * ovalScale; y += this.blockSize) {
            for (let z = -outerR * ovalScale; z < outerR * ovalScale; z += this.blockSize) {
                const d = Math.sqrt(
                    y ** 2 +
                    (z / ovalScale) ** 2
                )

                if (d >= innerR && d <= outerR) {
                    ringVoxels.push({
                        x: -1 + ox,
                        y: y + oy,
                        z: z + oz
                    })
                    ringVoxels.push({
                        x: 1 + ox,
                        y: y + oy,
                        z: z + oz
                    })
                }
            }
        }
        const ringMesh = new THREE.InstancedMesh(this.geometry, this.grass, ringVoxels.length)
        const ringHolder = new THREE.Object3D();

        for (let i = 0; i < ringVoxels.length; i++) {
            const {x,y,z} = ringVoxels[i];
            ringHolder.position.set(x,y,z)
            ringHolder.updateMatrix()
            ringMesh.scale.set(SCALE,SCALE,SCALE)
            ringMesh.setMatrixAt(i, ringHolder.matrix)
        }
        scene.add(ringMesh)

    }
    randomColorSampler(colorList) {
        const [red,green,blue] = colorList
        const max = Math.max(red, green, blue) // map 0 -> max to 0 to 255
        const multiplier = 255/max;
        p = Math.random() * 0.8 + 0.2;
        return `rgb(${red*p* multiplier}, ${green*p* multiplier}, ${blue*p* multiplier})`
    }
    
}

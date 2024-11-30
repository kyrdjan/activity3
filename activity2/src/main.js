import * as THREE from 'https://esm.sh/three';
import { OrbitControls } from 'https://esm.sh/three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js';
import { MeshStandardMaterial } from 'three';

// Canvas and Scene Setup
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(10, 10, -10);
scene.add(camera);

scene.background = new THREE.Color(0xcccccc)


// Textures
const textureLoader = new THREE.TextureLoader();
const snow = textureLoader.load('https://res.cloudinary.com/dcr0ilwho/image/upload/v1732936875/snowfloor_vngglk.jpg');

// Particle Geometry and Material
const particlesGeometry = new THREE.BufferGeometry();
const count = 200000; // Number of particles
const positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i += 3) {
  let x = (Math.random() - 0.50) * 100;  // X position
  let y = (Math.random() - 0.50) * 100;  // Y position
  let z = (Math.random() - 0.50) * 100;  // Z position

  // Only display if Y is positive (above the center)
  if (y > 0) {
    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = z;
  }
}

particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.1,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  opacity: 0.8,
});

// Create Particles
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Resize Event
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(5, 5, 5);

// Models
let model = null;

const gltfLoader1 = new GLTFLoader();
gltfLoader1.load('asset/abandoned_house_gltf/scene.gltf', (gltfScene) => {
  scene.add(gltfScene.scene);
});

const gltfLoader2 = new GLTFLoader();
gltfLoader2.load('asset/spacesuit/scene.gltf', (gltfScene) => {
  model = gltfScene.scene;
  
  // Adjust the position (x, y, z)
  model.position.set(5.4, -0.1, 1.7); // Position the model at the origin or any other location

  // Adjust the scale (x, y, z)
  model.scale.set(0.0014, 0.0014, 0.0014); // Scale the model

  // Adjust the rotation (x, y, z) in radians
  model.rotation.set(0, 0, 0); // Rotate the model

  // Add the model to the scene
  scene.add(model);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Listen for mouse movements
window.addEventListener('pointermove', (event) => {
  // Normalize mouse position to -1 to 1 for both axes
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster with the camera and mouse position
  raycaster.ray.origin.copy(camera.position); // Ray starts from the camera
  raycaster.ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(raycaster.ray.origin).normalize();

  // Perform raycasting
  if (model) {
    const intersects = raycaster.intersectObject(model, true); // 'true' checks descendants of the model

    if (intersects.length > 0) {
      // If intersection detected, scale up the model
      model.scale.set(0.0017, 0.0017, 0.0017);
    } else {
      // If no intersection, reset scale
      model.scale.set(0.0014, 0.0014, 0.0014);
    }
  }
});


// Objects
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ map: snow })
);

ground.rotation.x = Math.PI / -2;
ground.position.y = -0.1;
scene.add(ground);

/*
FOGS
*/
// Fog (Atmospheric)
const fog = new THREE.FogExp2(0xcccccc, 0.05);  // Light gray fog with density 0.02
scene.fog = fog;


// Ground Fog (Create a fog plane)
const groundFogGeometry = new THREE.PlaneGeometry(100, 100);
const groundFogMaterial = new THREE.MeshBasicMaterial({
  color: 0xcccccc,  // Light gray
  opacity: 0.6,     // Semi-transparent
  transparent: true,
  side: THREE.DoubleSide,
});
const groundFog = new THREE.Mesh(groundFogGeometry, groundFogMaterial);
groundFog.rotation.x = Math.PI / -2;  // Align with the ground
groundFog.position.y = 0.2;        // Just above the ground
scene.add(groundFog);



// Load the smoke texture
const smokeTexture = textureLoader.load('https://path_to_smoke_texture.png', () => {
  // Once the texture is loaded, we can set its settings
  smokeTexture.wrapS = THREE.RepeatWrapping;
  smokeTexture.wrapT = THREE.RepeatWrapping;
  smokeTexture.magFilter = THREE.LinearFilter;
  smokeTexture.minFilter = THREE.LinearFilter;
});

// Create fog geometry and material with the smoke texture
const groundFogMaterialWithTexture = new THREE.MeshBasicMaterial({
  map: smokeTexture,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide,
  depthWrite: false, // Prevent depth write to allow transparency
});

const groundFogWithTexture = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundFogMaterialWithTexture);
groundFogWithTexture.rotation.x = Math.PI / -2; // Align with the ground
groundFogWithTexture.position.y = -0.05; // Just above the ground
scene.add(groundFogWithTexture);

/* 
Animation
*/
const clock = new THREE.Clock();

// Animation Loop
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  const maxDistance = 5; // Define the distance from the origin after which particles will be hidden

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Update positions
    particlesGeometry.attributes.position.array[i3 + 1] += 0.005 * Math.sin(elapsedTime + i); // Y direction
    particlesGeometry.attributes.position.array[i3] += 0.005 * Math.cos(elapsedTime + i); // X direction

    // Calculate distance from the origin (0, 0, 0)
    const distance = Math.sqrt(
      Math.pow(particlesGeometry.attributes.position.array[i3], 2) + // X position
      Math.pow(particlesGeometry.attributes.position.array[i3 + 1], 2)  // Y position
    );

    // If the distance exceeds the threshold, hide the particle
    if (distance < maxDistance) {
      particlesGeometry.attributes.position.array[i3] = 1000; // Move out of view
      particlesGeometry.attributes.position.array[i3 + 1] = 1000; // Move out of view
    }
  }

  particlesGeometry.attributes.position.needsUpdate = true;


  // Animate the texture offset to create movement
  if (smokeTexture) {
    // Update texture offsets for animation effect
    smokeTexture.offset.x = Math.sin(elapsedTime * 0.05) * 0.1;
    smokeTexture.offset.y = Math.cos(elapsedTime * 0.05) * 0.1;
  }


  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

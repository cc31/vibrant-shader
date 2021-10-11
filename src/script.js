import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";
import { TorusGeometry } from "three";

let camera, scene, renderer;
let gui;

// shader tutorial from https://www.youtube.com/watch?v=eiHBOOyXesw

// Vertex Shader
const _VS = `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
// Fragment Shader
const _FS = `
varying vec2 vUv;
varying vec3 vNormal;
void main(){
  float diff = dot(vec3(1.),vNormal);
  gl_FragColor = vec4(vUv, 0.0, 1.0);
  gl_FragColor = vec4(vNormal, 1.0);
  gl_FragColor = vec4(abs(sin(diff*4.)));
}
`;

// Loading
const gltfLoader = new GLTFLoader();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
scene = new THREE.Scene();

// Objects

// Materials
const material = new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader: _VS,
  fragmentShader: _FS,
});
material.color = new THREE.Color(0xff0000);
// Mesh
gltfLoader.load("model/scene.gltf", (gltf) => {
  // console.log(gltf);
  gltf.scene.scale.set(10.0, 10.0, 10.0);
  scene.add(gltf.scene);
  gltf.scene.traverse((o) => {
    if (o.isMesh) {
      o.geometry.center();
      o.material = material;
    }
  });
});

// Lights
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.25,
  20
);
camera.position.set(2.5, 1.5, 3.0);
scene.add(camera);

/**
 * GUI - Debug
 */
// gui = new dat.GUI();
// const folderTorus = gui.addFolder("Torus");
// folderTorus.add(torus.position, "y", 0, 20, 0.1).name("y");
// folderTorus.open();

/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
// controls.addEventListener("change", render); // use if there is no animation loop
controls.minDistance = 2;
controls.maxDistance = 10;
controls.target.set(0, 0.5, -0.2);
controls.update();

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const time = performance.now() * 0.001;

  // Update objects

  // Update Orbital Controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

<script setup lang="ts">
import type { IThreeContext } from '~/types/three';
import * as THREE from 'three';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Встроенные шейдеры для светлячков
const firefliesVertexShader = `
uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
attribute float atrScale;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(uTime + modelPosition.x * 100.0) * atrScale * 0.2;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  gl_PointSize = uSize * atrScale * uPixelRatio;
  gl_PointSize *= (1.0 / -viewPosition.z);
}
`;

const firefliesFragmentShader = `
void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = 0.05 / distanceToCenter - 0.1;

  gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
}
`;

// Объекты для хранения состояния
const debugObject = { clearColor: '#050A30' };
let gui: dat.GUI | null = null;
let mixer: THREE.AnimationMixer | null = null;
let mixer2: THREE.AnimationMixer | null = null;
let fox: THREE.Object3D | null = null;
let fox2: THREE.Object3D | null = null;
let fireflies: THREE.Points | null = null;
let firefliesMaterial: THREE.ShaderMaterial | null = null;

// Инициализация сцены
const initScene = (scene: THREE.Scene) => {
  // Освещение
  const ambientLight = new THREE.AmbientLight(0xfff8e1, 2.0);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffd700, 2.5);
  directionalLight.position.set(30, 15, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048);
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.normalBias = -0.000000001;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  directionalLight.shadow.camera.updateProjectionMatrix();
  scene.add(directionalLight);

  const fillLight = new THREE.HemisphereLight(0x87ceeb, 0x228b22, 1.0);
  scene.add(fillLight);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('draco/');
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load('/models/island/island.glb', (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (
          child.name !== 'Water' &&
          !child.name.includes('hollywood') &&
          !child.name.includes('heart') &&
          !child.name.includes('div')
        ) {
          child.castShadow = true;
          child.receiveShadow = true;
        } else {
          child.castShadow = false;
          child.receiveShadow = false;
        }

        if (child.name === 'Landscape' || child.name === 'Street') {
          child.castShadow = false;
        }

        if (child.name.includes('tree')) {
          child.receiveShadow = false;
          child.castShadow = true;
          child.material.color.set(0xC6E2FF);
        }

        if (child.name === 'Landscape') {
          child.material.color.set(0x6b74d9);
          child.castShadow = false;
        }
        if (child.name === 'Street') {
          child.material.color.set(0x425682);
          child.castShadow = false;
          child.receiveShadow = true;
        }

        if (child.geometry) {
          child.geometry.attributes.position.usage = THREE.StaticDrawUsage;
        }
      }
    });
    scene.add(model);
  });

  gltfLoader.load('models/island/Fox.gltf', (gltf) => {
    fox = gltf.scene;
    fox.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        if (child.geometry) {
          child.geometry.attributes.position.usage = THREE.StaticDrawUsage;
        }
      }
    });
    fox.scale.set(0.005, 0.005, 0.005);
    scene.add(fox);

    mixer = new THREE.AnimationMixer(fox);
    const action = mixer.clipAction(gltf.animations[1]);
    action.play();
  });

  gltfLoader.load('models/island/Fox.gltf', (gltf) => {
    fox2 = gltf.scene;
    fox2.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        if (child.geometry) {
          child.geometry.attributes.position.usage = THREE.StaticDrawUsage;
        }
      }
    });
    fox2.scale.set(0.005, 0.005, 0.005);
    scene.add(fox2);

    mixer2 = new THREE.AnimationMixer(fox2);
    const action = mixer2.clipAction(gltf.animations[2]);
    action.play();
  });

  const firefliesCount = 500;
  const firefliesGeometry = new THREE.BufferGeometry();
  const positionArray = new Float32Array(firefliesCount * 3);
  const scaleArray = new Float32Array(firefliesCount);

  for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 50;
    positionArray[i * 3 + 1] = Math.random() * 10;
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 50;
    scaleArray[i] = Math.random();
  }

  firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
  firefliesGeometry.setAttribute('atrScale', new THREE.BufferAttribute(scaleArray, 1));

  firefliesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSize: { value: 200 },
      uTime: { value: 0 },
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
  scene.add(fireflies);
};

const threeContainerRef = ref();

const handleSceneReady = ({ scene, renderer, controls }: IThreeContext) => {
  initScene(scene);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(debugObject.clearColor);

  controls.minPolarAngle = Math.PI / 2.5;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 19;
  controls.maxDistance = 30;

  gui = new dat.GUI({ width: 400 });
  gui.add(firefliesMaterial!.uniforms.uSize, 'value').min(0).max(200).step(1).name('firefliesSize');
  gui.addColor(debugObject, 'clearColor').onChange(() => {
    renderer.setClearColor(debugObject.clearColor);
  });

  let previousTime = 0;
  let totalRotation = 0;
  let previousRotation = 0;
  let bufferRotation = 0;

  if (threeContainerRef.value) {
    threeContainerRef.value.onTick((elapsedTime: number) => {
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      if (firefliesMaterial) {
        firefliesMaterial.uniforms.uTime.value = elapsedTime;
      }

      if (fox) {
        fox.position.x = Math.cos(elapsedTime * 0.1) * 12;
        fox.position.z = Math.sin(elapsedTime * 0.1) * 12;
        const nextX = Math.cos((elapsedTime + 0.01) * 0.1) * 12;
        const nextZ = Math.sin((elapsedTime + 0.01) * 0.1) * 12;
        const dx = nextX - fox.position.x;
        const dz = nextZ - fox.position.z;
        const theta = Math.atan2(dz, dx);
        fox.rotation.y = -theta + 1.5;
      }

      if (fox2 && controls) {
        const radius = 0.95 * 12;
        const azimuthalAngle = controls.getAzimuthalAngle();
        let deltaAngle = azimuthalAngle - previousRotation;

        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        else if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

        totalRotation += deltaAngle;
        previousRotation = azimuthalAngle;

        fox2.position.x = Math.cos(totalRotation + Math.PI / 0.665) * radius;
        fox2.position.z = -Math.sin(totalRotation + Math.PI / 0.665) * radius;

        const nextX = Math.cos(azimuthalAngle + 0.01) * radius;
        const nextZ = -Math.sin(azimuthalAngle + 0.01) * radius;
        const dx = nextX - fox2.position.x;
        const dz = nextZ - fox2.position.z;
        const theta = Math.atan2(dz, dx);

        fox2.rotation.y = bufferRotation < totalRotation ? -theta + 0.8 : -theta - 2.3;
        bufferRotation = totalRotation;

        if (mixer2) mixer2.timeScale = Math.abs(deltaAngle) * 100;
      }

      if (mixer) mixer.update(deltaTime);
      if (mixer2) mixer2.update(deltaTime);
    });
  }
};

onUnmounted(() => {
  if (gui) gui.destroy();
  if (fireflies) {
    fireflies.geometry.dispose();
    if (fireflies.material instanceof THREE.Material) fireflies.material.dispose();
  }
  if (fox) scene.value?.remove(fox);
  if (fox2) scene.value?.remove(fox2);
});

const scene = ref<THREE.Scene | null>(null);
</script>

<template>
  <ThreeContainer
    ref="threeContainerRef"
    :camera-position="[0.3, 0.7, 3]"
    :fov="45"
    :far="100"
    custom-animation
    @scene-ready="handleSceneReady"
  />
</template>

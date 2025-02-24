<script setup lang="ts">
import type { IThreeContext } from '~/types/three';
import * as dat from 'lil-gui';
import * as THREE from 'three';

const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 5,
  spin: 0.7,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
};

let geometry: THREE.BufferGeometry | null = null;
let material: THREE.PointsMaterial | null = null;
let points: THREE.Points | null = null;
let gui: dat.GUI | null = null;

const generateGalaxy = (scene: THREE.Scene) => {
  if (points !== null) {
    geometry?.dispose();
    material?.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
};

const handleSceneReady = ({ scene, renderer }: IThreeContext) => {
  scene.background = new THREE.Color('#0a0a1a');

  generateGalaxy(scene);

  gui = new dat.GUI({ width: 360 });
  gui.add(parameters, 'count').min(100).max(500000).step(100).onFinishChange(() => generateGalaxy(scene));
  gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(() => generateGalaxy(scene));
  gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(() => generateGalaxy(scene));
  gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(() => generateGalaxy(scene));
  gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(() => generateGalaxy(scene));
  gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(() => generateGalaxy(scene));
  gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(() => generateGalaxy(scene));
  gui.addColor(parameters, 'insideColor').onFinishChange(() => generateGalaxy(scene));
  gui.addColor(parameters, 'outsideColor').onFinishChange(() => generateGalaxy(scene));
};

onUnmounted(() => {
  if (gui) {
    gui.destroy();
  }
  if (points) {
    geometry?.dispose();
    material?.dispose();
  }
});
</script>

<template>
  <ThreeContainer
    ref="threeContainer"
    :camera-position="[-10, 5, 10]"
    custom-animation
    @scene-ready="handleSceneReady"
  />
</template>

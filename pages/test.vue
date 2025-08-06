<script setup lang="ts">
import { BufferGeometry, SphereGeometry, PointsMaterial, Points, Vector3, Color, BufferAttribute } from 'three';
import GUI from 'lil-gui';
import type { IThreeContext } from '~/types/three';

const threeContainer = ref();
let points: Points | null = null;
let geometry: SphereGeometry | null = null;
let material: PointsMaterial | null = null;
let redPoints: Points | null = null;
let redGeometry: BufferGeometry | null = null;
let redMaterial: PointsMaterial | null = null;
let originalPositions: Vector3[] = [];
let redOriginalPositions: Vector3[] = [];
let gui: GUI | null = null;
const sphereRadius = 5;
const selectedPoint = ref<number | null>(null);

const redPointPositions = ref([
  new Vector3(sphereRadius, 0, 0), // Right (Point 1)
  new Vector3(-sphereRadius, 0, 0), // Left (Point 2)
  new Vector3(0, sphereRadius, 0), // Top (Point 3)
  new Vector3(0, -sphereRadius, 0), // Bottom (Point 4)
  new Vector3(0, 0, sphereRadius), // Front (Point 5)
  new Vector3(0, 0, -sphereRadius), // Back (Point 6)
]);

const handleSceneReady = ({ scene, camera, renderer }: IThreeContext) => {
  scene.background = new Color('#0a0a1a');

  // Main sphere with white points
  geometry = new SphereGeometry(sphereRadius, 32, 32);
  material = new PointsMaterial({ color: 0xffffff, size: 0.2, sizeAttenuation: true });
  points = new Points(geometry, material);
  scene.add(points);

  const positions = geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < positions.length; i += 3) {
    originalPositions.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
  }

  // Store original red point positions
  redPointPositions.value.forEach(pos => redOriginalPositions.push(pos.clone()));

  // Add red points on six sides
  redGeometry = new BufferGeometry();
  const redPositions = new Float32Array(redPointPositions.value.flatMap(pos => [pos.x, pos.y, pos.z]));
  redGeometry.setAttribute('position', new BufferAttribute(redPositions, 3));
  redMaterial = new PointsMaterial({ color: 0xff0000, size: 0.3, sizeAttenuation: true });
  redPoints = new Points(redGeometry, redMaterial);
  scene.add(redPoints);

  // Setup GUI
  gui = new GUI();
  const guiState = reactive({
    selectedPoint: selectedPoint.value !== null ? `Point ${selectedPoint.value + 1}` : 'None',
    x: 0,
    y: 0,
    z: 0,
  });

  // GUI select dropdown for points
  const pointOptions = {
    None: 'None',
    'Point 1': 0,
    'Point 2': 1,
    'Point 3': 2,
    'Point 4': 3,
    'Point 5': 4,
    'Point 6': 5,
  };
  gui.add(guiState, 'selectedPoint', Object.keys(pointOptions)).name('Selected Point').onChange((value: string) => {
    selectedPoint.value = pointOptions[value as keyof typeof pointOptions] === 'None' ? null : pointOptions[value as keyof typeof pointOptions] as number;
    if (selectedPoint.value !== null) {
      guiState.x = redPointPositions.value[selectedPoint.value].x;
      guiState.y = redPointPositions.value[selectedPoint.value].y;
      guiState.z = redPointPositions.value[selectedPoint.value].z;
    } else {
      guiState.x = 0;
      guiState.y = 0;
      guiState.z = 0;
    }
  });

  const xController = gui.add(guiState, 'x', -10, 10, 0.1).name('X').listen();
  const yController = gui.add(guiState, 'y', -10, 10, 0.1).name('Y').listen();
  const zController = gui.add(guiState, 'z', -10, 10, 0.1).name('Z').listen();

  // Update red point and nearby white points when GUI controls change
  const updateRedPointPosition = () => {
    if (selectedPoint.value === null || !redGeometry || !geometry) return;
    const index = selectedPoint.value;

    // Update selected red point
    redPointPositions.value[index].set(guiState.x, guiState.y, guiState.z);
    const redPositions = redGeometry.attributes.position.array as Float32Array;
    redPositions[index * 3] = guiState.x;
    redPositions[index * 3 + 1] = guiState.y;
    redPositions[index * 3 + 2] = guiState.z;
    redGeometry.attributes.position.needsUpdate = true;

    // Update nearby white points for rubbery effect
    const whitePositions = geometry.attributes.position.array as Float32Array;
    const targetPoint = redPointPositions.value[index];
    const originalRedPoint = redOriginalPositions[index];
    for (let i = 0; i < whitePositions.length / 3; i++) {
      const pos = new Vector3(whitePositions[i * 3], whitePositions[i * 3 + 1], whitePositions[i * 3 + 2]);
      const original = originalPositions[i];
      const distance = original.distanceTo(originalRedPoint); // Distance from original white to original red point
      const influenceRadius = 2.0;
      const influence = Math.max(0, 1 - distance / influenceRadius);

      if (influence > 0) {
        const displacement = targetPoint.clone().sub(originalRedPoint); // Displacement of red point from its original position
        const offset = displacement.multiplyScalar(influence);
        pos.copy(original).add(offset); // Apply offset to original position
        whitePositions[i * 3] = pos.x;
        whitePositions[i * 3 + 1] = pos.y;
        whitePositions[i * 3 + 2] = pos.z;
      }
    }
    geometry.attributes.position.needsUpdate = true;
  };

  xController.onChange(updateRedPointPosition);
  yController.onChange(updateRedPointPosition);
  zController.onChange(updateRedPointPosition);

  // Animation loop to return white points to original positions
  threeContainer.value.onTick(() => {
    if (!geometry || !points || selectedPoint.value !== null) return;

    const whitePositions = geometry.attributes.position.array as Float32Array;
    let moving = false;

    for (let i = 0; i < whitePositions.length / 3; i++) {
      const pos = new Vector3(whitePositions[i * 3], whitePositions[i * 3 + 1], whitePositions[i * 3 + 2]);
      const original = originalPositions[i];
      const distance = pos.distanceTo(original);

      if (distance > 0.01) {
        moving = true;
        const direction = original.sub(pos).normalize();
        pos.add(direction.multiplyScalar(0.05));
        pos.normalize().multiplyScalar(sphereRadius); // Constrain to sphere surface
        whitePositions[i * 3] = pos.x;
        whitePositions[i * 3 + 1] = pos.y;
        whitePositions[i * 3 + 2] = pos.z;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    if (!moving) threeContainer.value.onTick(() => {});
  });

  onUnmounted(() => {
    geometry?.dispose();
    material?.dispose();
    redGeometry?.dispose();
    redMaterial?.dispose();
    gui?.destroy();
  });
};
</script>

<template>
  <nuxt-link class="go-back" to="/">⭠ на главную</nuxt-link>
  <ThreeContainer
    class="sphere-points"
    ref="threeContainer"
    :camera-position="[0, 0, 18]"
    custom-animation
    @scene-ready="handleSceneReady"
  />
</template>

<style lang="less" scoped>
.sphere-points {
  cursor: pointer;
}
</style>

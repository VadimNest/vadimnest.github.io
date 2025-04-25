<script setup lang="ts">
import { Color, Points, ShaderMaterial, BufferGeometry, Float32BufferAttribute } from 'three';
import type { IThreeContext } from '~/types/three';
import pointVertex from '/public/textures/lines/pointVertex.glsl?raw';
import pointFragment from '/public/textures/lines/pointFragment.glsl?raw';

const threeContainerRef = ref();

const createPoints = (): Points<BufferGeometry, ShaderMaterial> => {
  const numPoints = 200;

  const vertices = [];
  const initialPositions = [];
  const noiseOffsets = [];
  const jerkTimes = [];
  const jerkDirections = [];

  for (let i = 0; i < numPoints; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;

    vertices.push(x, y, z);
    initialPositions.push(x, y, z);
    noiseOffsets.push(Math.random() * 100, Math.random() * 100, Math.random() * 100);
    jerkTimes.push(-1.0);

    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const dx = Math.sin(phi) * Math.cos(theta);
    const dy = Math.sin(phi) * Math.sin(theta);
    const dz = Math.cos(phi);
    jerkDirections.push(dx, dy, dz);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('initialPositions', new Float32BufferAttribute(initialPositions, 3));
  geometry.setAttribute('noiseOffsets', new Float32BufferAttribute(noiseOffsets, 3));
  geometry.setAttribute('jerkTime', new Float32BufferAttribute(jerkTimes, 1));
  geometry.setAttribute('jerkDirection', new Float32BufferAttribute(jerkDirections, 3));

  const material = new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms: {
      uTime: { value: 0 },
      uPulseTime: { value: -1.0 },
    }
  });

  const points = new Points(geometry, material);
  return points;
};

const handleSceneReady = ({ scene, camera, renderer, controls }: IThreeContext) => {
  let points: Points<BufferGeometry, ShaderMaterial> | null = null;

  const init = async () => {
    try {
      scene.background = new Color(0x0a0a2a);

      points = createPoints();
      scene.add(points);
    } catch (error) {
      console.error('Scene initialization failed:', error);
    }
  };

  init();

  if (threeContainerRef.value && threeContainerRef.value.onTick) {
    threeContainerRef.value.onTick((elapsedTime: number) => {
      if (points && points.material.uniforms) {
        points.material.uniforms.uTime.value = elapsedTime;

        if (Math.floor(elapsedTime) % 4 === 0 && elapsedTime - Math.floor(elapsedTime) < 0.1) {
          points.material.uniforms.uPulseTime.value = elapsedTime;
        }

        const pulseTime = points.material.uniforms.uPulseTime.value;
        if (pulseTime >= 0) {
          const jerkTimeAttr = points.geometry.attributes.jerkTime;
          const positions = points.geometry.attributes.initialPositions.array;
          const pulseSpeed = 10.0; // Импульс проходит 10 единиц в секунду.
          const pulseDelay = 0.1; // добавляет задержку в 0,1 секунды для более плавности
          const jerkDuration = 0.5;

          for (let i = 0; i < jerkTimeAttr.count; i++) {
            // Reset jerkTime if jerk is complete
            if (jerkTimeAttr.array[i] >= 0 && elapsedTime > jerkTimeAttr.array[i] + jerkDuration) {
              jerkTimeAttr.array[i] = -1.0;
            }

            // Trigger new jerk if pulse reaches point
            if (jerkTimeAttr.array[i] < 0) {
            const x = positions[i * 3];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];
            const distance = Math.sqrt(x * x + y * y + z * z);
            const triggerTime = pulseTime + distance / pulseSpeed + pulseDelay;

            if (elapsedTime >= triggerTime) {
              jerkTimeAttr.array[i] = elapsedTime;
            }
          }
          }
          jerkTimeAttr.needsUpdate = true;
        }
      }
    });
  }

  onBeforeUnmount(() => {
    if (points) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points);
      points = null;
    }
  });
};
</script>

<template>
  <nuxt-link class="go-back" to="/">⭠ на главную</nuxt-link>
  <ThreeContainer
    ref="threeContainerRef"
    :camera-position="[0, 0, 40]"
    :far="150"
    custom-animation
    @scene-ready="handleSceneReady"
  />
</template>

<style lang="less"></style>

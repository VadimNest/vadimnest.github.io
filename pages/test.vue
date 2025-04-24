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

  for (let i = 0; i < numPoints; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;

    vertices.push(x, y, z);
    initialPositions.push(x, y, z);
    noiseOffsets.push(Math.random() * 100, Math.random() * 100, Math.random() * 100);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('initialPositions', new Float32BufferAttribute(initialPositions, 3));
  geometry.setAttribute('noiseOffsets', new Float32BufferAttribute(noiseOffsets, 3));

  const material = new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms: {
      uTime: { value: 0 },
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
        points.position.y = Math.sin(elapsedTime) * 2;
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

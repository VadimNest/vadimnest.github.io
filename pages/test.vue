<script setup lang="ts">
import { Color, Points, PointsMaterial, BufferGeometry, Float32BufferAttribute, ShaderMaterial } from 'three';
import type { IThreeContext } from '~/types/three';

const threeContainerRef = ref();

const createPoints = (): Points<BufferGeometry, PointsMaterial> => {
  const numPoints = 200;

  const vertices = [];

  for (let i = 0; i < numPoints; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;

    vertices.push(x, y, z);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  const material = new PointsMaterial({ color: 0xffffff });
  const points = new Points(geometry, material);

  return points;
};

const handleSceneReady = ({ scene, camera, renderer, controls }: IThreeContext) => {
  let points: Points<BufferGeometry, PointsMaterial> | null = null;

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

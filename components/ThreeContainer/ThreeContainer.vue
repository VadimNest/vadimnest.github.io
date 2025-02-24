<script setup lang="ts">
import {
  SRGBColorSpace,
  PerspectiveCamera,
  Scene,
  WebGLRenderer, Clock,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useElementBounding } from '@vueuse/core';
import type { IThreeContext } from '~/types/three';

type TTickCallback = (elapsedTime: number) => void;

const {
  clearColor = '#242424',
  fov = 35,
  near = 0.1,
  far = 100,
  cameraPosition = [3, 3, 3],
  enableDamping = true,
  customAnimation = false,
  alpha = false,
} = defineProps<{
  clearColor?: string | number,
  fov?: number,
  near?: number,
  far?: number,
  cameraPosition?: [number, number, number],
  enableDamping?: boolean,
  customAnimation?: boolean,
  alpha?: boolean,
}>();
const threeContainer = ref<HTMLDivElement>();
const threeCanvas = ref<HTMLCanvasElement>();

const { width, height } = useElementBounding(threeContainer);
const aspect = computed(() => width.value / height.value);
let threeCtx: IThreeContext | null = null;

const emit = defineEmits<{
  'scene-ready': [context: IThreeContext]
}>();

const handleResize = () => {
  if (!threeCtx || !threeCanvas.value || !threeContainer.value) return;

  const { camera, renderer } = threeCtx;
  camera.aspect = aspect.value;
  camera.updateProjectionMatrix();
  renderer.setSize(width.value, height.value);
  renderer.setPixelRatio(2);
};

const tickCallback = ref<TTickCallback | null>(null);
const clock = new Clock();

const onTick = (callback: TTickCallback) => {
  tickCallback.value = callback;
};

const animate = () => {
  if (!threeCtx) return;

  const { scene, camera, renderer, controls } = threeCtx;

  if (customAnimation && tickCallback.value) {
    const elapsedTime = clock.getElapsedTime();
    tickCallback.value(elapsedTime);
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

const initThree = () => {
  if (!import.meta.client || !threeContainer.value || !threeCanvas.value) return;

  const scene = new Scene();

  const camera = new PerspectiveCamera(
    fov,
    aspect.value,
    near,
    far,
  );
  camera.position.set(...cameraPosition);

  const renderer = new WebGLRenderer({
    canvas: threeCanvas.value,
    antialias: true,
    alpha,
  });
  renderer.setSize(width.value, height.value);
  renderer.setClearColor(clearColor);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(2);

  const controls = new OrbitControls(camera, threeCanvas.value);
  controls.enableDamping = enableDamping;

  threeCtx = { scene, camera, renderer, controls };

  emit('scene-ready', threeCtx);
  animate();
};

onMounted(() => {
  initThree();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (!threeCtx) return;
  window.removeEventListener('resize', handleResize);

  const { renderer, controls } = threeCtx;
  renderer.dispose();
  controls.dispose();
  threeCtx = null;
});

defineExpose({ threeContainer, onTick, width: width.value, height: height.value });
</script>

<template>
  <div ref="threeContainer" class="three-container">
    <canvas ref="threeCanvas" />
  </div>
</template>

<style lang="less" src="./ThreeContainer.less" />

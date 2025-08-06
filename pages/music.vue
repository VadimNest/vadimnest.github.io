<script setup lang="ts">
import * as THREE from 'three';
import GUI from 'lil-gui';
import { Color } from 'three';
import type { IThreeContext } from '~/types/three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import vertexShader from '/public/textures/music/vertex.glsl?raw';
import fragmentShader from '/public/textures/music/fragment.glsl?raw';

const threeContainerRef = ref();
let listener: THREE.AudioListener;
let sound: THREE.Audio;
const audioElementRef = ref<HTMLAudioElement | null>(null);

const setupScene = (scene: THREE.Scene, renderer: THREE.WebGLRenderer) => {
  scene.background = new Color(0x0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
};

const setupBloom = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  params: { threshold: number; strength: number; radius: number },
) => {
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.strength,
    params.radius,
    params.threshold,
  );
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);
  bloomComposer.addPass(new OutputPass());
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  return { bloomComposer, bloomPass };
};

const setupGUI = (
  params: {
    red: number;
    green: number;
    blue: number;
    threshold: number;
    strength: number;
    radius: number;
    radiusMultiplier: number;
    strengthMultiplier: number;
  },
  uniforms: any,
  bloomPass: UnrealBloomPass,
) => {
  const gui = new GUI();
  const colorsFolder = gui.addFolder('Colors');
  colorsFolder.add(params, 'red', 0, 1).onChange((value: number) => {
    uniforms.u_red.value = Number(value);
  });
  colorsFolder.add(params, 'green', 0, 1).onChange((value: number) => {
    uniforms.u_green.value = Number(value);
  });
  colorsFolder.add(params, 'blue', 0, 1).onChange((value: number) => {
    uniforms.u_blue.value = Number(value);
  });

  const bloomFolder = gui.addFolder('Bloom');
  bloomFolder.add(params, 'threshold', 0, 1).onChange((value: number) => {
    bloomPass.threshold = Number(value);
  });
  bloomFolder.add(params, 'radiusMultiplier', 0, 2).onChange((value: number) => {
    params.radiusMultiplier = Number(value);
  });
  bloomFolder.add(params, 'strengthMultiplier', 0, 3).onChange((value: number) => {
    params.strengthMultiplier = Number(value);
  });

  return gui;
};

const setupMesh = (scene: THREE.Scene, uniforms: any) => {
  const geo = new THREE.IcosahedronGeometry(4, 30);
  // const geo = new THREE.PlaneGeometry(20, 20, 100, 100);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.material.wireframe = true;
  scene.add(mesh);
};

const setupAudio = (camera: THREE.PerspectiveCamera, audioElement: HTMLAudioElement) => {
  listener = new THREE.AudioListener();
  camera.add(listener);

  sound = new THREE.Audio(listener);
  sound.setMediaElementSource(audioElement);

  const analyser = new THREE.AudioAnalyser(sound, 32);
  return analyser;
};

const resumeAudio = async () => {
  if (!listener || !sound) return;
  if (listener.context.state === 'suspended') {
    await listener.context.resume();
  }
  if (!sound.isPlaying) {
    sound.play();
  }
};

const handleSceneReady = ({ scene, camera, renderer }: IThreeContext) => {
  const init = async () => {
    try {
      const audioElement = audioElementRef.value;
      if (!audioElement) return;

      const params = {
        red: 0.226,
        green: 0.484,
        blue: 1.0,
        threshold: 0.336,
        strength: 0.714,
        radius: 1.0,
        radiusMultiplier: 1.0,
        strengthMultiplier: 1.5,
      };

      const uniforms = {
        u_time: { type: 'f', value: 0.0 },
        u_frequency: { type: 'f', value: 0.0 },
        // pink 1.0 0.5 1
        // blue 0.226 0.484 1
        u_red: { type: 'f', value: 0.226 },
        u_green: { type: 'f', value: 0.484 },
        u_blue: { type: 'f', value: 1.0 },
      };

      setupScene(scene, renderer);
      const { bloomComposer, bloomPass } = setupBloom(scene, camera, renderer, params);
      const gui = setupGUI(params, uniforms, bloomPass);
      setupMesh(scene, uniforms);
      const analyser = setupAudio(camera, audioElement);

      if (threeContainerRef.value) {
        threeContainerRef.value.onTick((elapsedTime: number) => {
          uniforms.u_time.value = elapsedTime;
          uniforms.u_frequency.value = analyser.getAverageFrequency();
          bloomPass.radius = (analyser.getAverageFrequency() / 255.0) * params.radiusMultiplier;
          bloomPass.strength = (analyser.getAverageFrequency() / 255.0) * params.strengthMultiplier;
          bloomComposer.render();
        });
      }

      onBeforeUnmount(() => {
        gui.destroy();
        analyser.analyser.disconnect();
      });
    } catch (error) {
      console.error('Scene initialization failed:', error);
    }
  };

  init();
};
</script>

<template>
  <nuxt-link class="go-back" to="/">⭠ на главную</nuxt-link>
  <!--
    tequila
    only-time
    moscow-never-sleeps
    kipelov
  -->
  <audio
    class="music__control"
    ref="audioElementRef"
    controls
    src="./media/tequila.mp3"
    @play="resumeAudio"
    @click="resumeAudio"
  />
  <ThreeContainer
    ref="threeContainerRef"
    :camera-position="[0, 0, 20]"
    :far="150"
    custom-animation
    disable-default-render
    @scene-ready="handleSceneReady"
  />
</template>

<style lang="less">
.music {
  &__control {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>

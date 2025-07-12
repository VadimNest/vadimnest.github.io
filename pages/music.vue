<script setup lang="ts">
import * as THREE from 'three';
import GUI from 'lil-gui';
import { Color } from 'three';
import type { IThreeContext } from '~/types/three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const threeContainerRef = ref();

const getVertexShader = () => `
  uniform float u_time;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

  float pnoise(vec3 P, vec3 rep) {
    vec3 Pi0 = mod(floor(P), rep);
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));

    float n000 = norm0.x * dot(g000, Pf0);
    float n010 = norm0.y * dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n100 = norm0.z * dot(g100, vec3(Pf1.x, Pf0.yz));
    float n110 = norm0.w * dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = norm1.x * dot(g001, vec3(Pf0.xy, Pf1.z));
    float n011 = norm1.y * dot(g011, vec3(Pf0.x, Pf1.yz));
    float n101 = norm1.z * dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n111 = norm1.w * dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }

  uniform float u_frequency;

  void main() {
    float noise = 1.5 * pnoise(position + u_time, vec3(10.0));
    float displacement = (u_frequency / 30.0) * (noise / 8.0);
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const getFragmentShader = () => `
  uniform float u_red;
  uniform float u_green;
  uniform float u_blue;

  void main() {
    gl_FragColor = vec4(vec3(u_red, u_green, u_blue), 1.0);
  }
`;

const setupScene = (scene: THREE.Scene, renderer: THREE.WebGLRenderer) => {
  scene.background = new Color(0x0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
};

const setupBloom = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  params: { threshold: number; strength: number; radius: number }
) => {
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.strength,
    params.radius,
    params.threshold
  );
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);
  bloomComposer.addPass(new OutputPass());
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  return { bloomComposer, bloomPass };
};

const setupGUI = (
  params: { red: number; green: number; blue: number; threshold: number; strength: number; radius: number; radiusMultiplier: number; strengthMultiplier: number },
  uniforms: any,
  bloomPass: UnrealBloomPass
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
    vertexShader: getVertexShader(),
    fragmentShader: getFragmentShader(),
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.material.wireframe = true;
  scene.add(mesh);
};

const setupAudio = (camera: THREE.PerspectiveCamera) => {
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('./media/only-time.mp3', (buffer) => {
    sound.setBuffer(buffer);
    window.addEventListener('click', () => sound.play());
  });
  return new THREE.AudioAnalyser(sound, 32);
};

const handleSceneReady = ({ scene, camera, renderer }: IThreeContext) => {
  const init = async () => {
    try {
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
      const analyser = setupAudio(camera);

      if (threeContainerRef.value && threeContainerRef.value.onTick) {
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
        analyser.getFrequencyData().forEach(() => analyser.getAnalyser().disconnect());
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
  <ThreeContainer
    ref="threeContainerRef"
    :camera-position="[0, 0, 20]"
    :far="150"
    custom-animation
    disable-default-render
    @scene-ready="handleSceneReady"
  />
</template>

<style lang="less"></style>

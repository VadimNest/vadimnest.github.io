<script setup lang="ts">
import {
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial,
  AdditiveBlending,
  AxesHelper,
  Clock,
  Color,
  SphereGeometry,
  Vector4,
  Mesh,
  DoubleSide,
  BackSide,
  WebGLCubeRenderTarget,
  LinearMipmapLinearFilter,
  CubeCamera,
  RGBAFormat,
  Scene,
} from 'three';
import type { IThreeContext } from '~/types/three';
import firefliesVertexShader from '/public/textures/sun/stars/firefliesVertexShader.glsl?raw';
import firefliesFragmentShader from '/public/textures/sun/stars/firefliesFragmentShader.glsl?raw';
import sunVertexShader from '/public/textures/sun/sun/sunVertexShader.glsl?raw';
import sunFragmentShader from '/public/textures/sun/sun/sunFragmentShader.glsl?raw';
import vertexSun from '/public/textures/sun/shaderSun/vertex.glsl?raw';
import fragmentSun from '/public/textures/sun/shaderSun/fragment.glsl?raw';
import vertexSunAround from '/public/textures/sun/sunAround/vertex.glsl?raw';
import fragmentSunAround from '/public/textures/sun/sunAround/fragment.glsl?raw';

const createFireflies = (): Points => {
  const firefliesCount = 50;
  const firefliesGeometry = new BufferGeometry();
  const positionArray = new Float32Array(firefliesCount * 3);
  const scaleArray = new Float32Array(firefliesCount);

  for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positionArray[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positionArray[i * 3 + 2] = Math.random() * 3 + 5;
    scaleArray[i] = Math.random();
  }

  firefliesGeometry.setAttribute('position', new BufferAttribute(positionArray, 3));
  firefliesGeometry.setAttribute('atrScale', new BufferAttribute(scaleArray, 1));

  const firefliesMaterial = new ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSize: { value: 200 },
      uTime: { value: 0 },
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });

  return new Points(firefliesGeometry, firefliesMaterial);
};

const createSun = (): Mesh => {
  const geometry = new SphereGeometry(1, 30, 30);
  const materialSun = new ShaderMaterial({
    extensions: {
      derivatives: true,
    },
    side: DoubleSide,
    uniforms: {
      time: { value: 0 },
      uPerlin: { value: null },
      resolution: { value: new Vector4() },
    },
    vertexShader: vertexSun,
    fragmentShader: fragmentSun,
  });

  const sun = new Mesh(geometry, materialSun);
  sun.position.z = 5;
  return sun;
};

const addTexture = (): {
  cubeCamera: CubeCamera;
  cubeRenderTarget: WebGLCubeRenderTarget;
  perlin: Mesh;
  materialPerlin: ShaderMaterial;
} => {
  const cubeRenderTarget = new WebGLCubeRenderTarget(256, {
    format: RGBAFormat,
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
  });
  const cubeCamera = new CubeCamera(0.1, 100, cubeRenderTarget);

  const materialPerlin = new ShaderMaterial({
    extensions: {
      derivatives: true,
    },
    side: DoubleSide,
    uniforms: {
      time: { value: 0 },
      resolution: { value: new Vector4() },
    },
    vertexShader: sunVertexShader,
    fragmentShader: sunFragmentShader,
  });

  const geometry = new SphereGeometry(0.99, 30, 30);
  const perlin = new Mesh(geometry, materialPerlin);

  return { cubeCamera, cubeRenderTarget, perlin, materialPerlin };
};

const addSunAround = () => {
  const geometry = new SphereGeometry(1.2, 30, 30);
  const material = new ShaderMaterial({
    side: BackSide,
    transparent: true,
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: vertexSunAround,
    fragmentShader: fragmentSunAround,
  });

  const sunAround = new Mesh(geometry, material);
  sunAround.position.z = 5;
  return sunAround;
};

const handleSceneReady = ({ scene, camera, renderer }: IThreeContext) => {
  const noiseScene = new Scene();
  let animationFrameId: number;
  let fireflies: Points | null = null;
  let sun: Mesh | null = null;
  let sunAround: Mesh | null = null;
  let cubeCamera: CubeCamera | null = null;
  let cubeRenderTarget: WebGLCubeRenderTarget | null = null;
  let perlin: Mesh | null = null;
  let materialPerlin: ShaderMaterial | null = null;

  const init = async () => {
    try {
      scene.background = new Color('#0A0A0A');

      fireflies = createFireflies();
      scene.add(fireflies);

      sunAround = addSunAround();
      scene.add(sunAround);

      ({ cubeCamera, cubeRenderTarget, perlin, materialPerlin } = addTexture());
      noiseScene.add(perlin);

      sun = createSun();
      scene.add(sun);

      const clock = new Clock();
      const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        if (fireflies) {
          (fireflies.material as ShaderMaterial).uniforms.uTime.value = elapsedTime;
        }

        if (cubeCamera) {
          cubeCamera.update(renderer, noiseScene);
        }

        if (sun && sun.material instanceof ShaderMaterial && materialPerlin) {
          sun.material.uniforms.uPerlin.value = cubeRenderTarget?.texture;
          sun.material.uniforms.time.value = elapsedTime;
          materialPerlin.uniforms.time.value = elapsedTime;
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    } catch (error) {
      console.error('Scene initialization failed:', error);
    }
  };

  init();

  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    if (fireflies) {
      fireflies.geometry.dispose();
      (fireflies.material as ShaderMaterial).dispose();
      scene.remove(fireflies);
    }

    if (sun) {
      sun.geometry.dispose();
      (sun.material as ShaderMaterial).dispose();
      scene.remove(sun);
    }

    if (perlin) {
      perlin.geometry.dispose();
      (perlin.material as ShaderMaterial).dispose();
      noiseScene.remove(perlin);
    }

    if (cubeRenderTarget) {
      cubeRenderTarget.dispose();
    }

    scene.clear();
    noiseScene.clear();
    renderer.dispose();
  };
};
</script>

<template>
  <nuxt-link class="go-back" to="/">⭠ на главную</nuxt-link>

  <ThreeContainer :camera-position="[0, 0, -1]" custom-animation @scene-ready="handleSceneReady" />
</template>

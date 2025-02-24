<script setup lang="ts">
import {
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  DirectionalLight,
  AmbientLight,
  Group,
  TextureLoader,
  type Material,
  type BufferGeometry,
  type Texture,
  PCFSoftShadowMap,
  EquirectangularReflectionMapping,
  DoubleSide,
} from 'three';
import type { IThreeContext } from '~/types/three';
import GUI from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

const resources = {
  geometries: new Set<BufferGeometry>(),
  materials: new Set<Material>(),
  textures: new Set<Texture>(),
  gui: null as GUI | null,
};

const objectsState = reactive({
  cube: {
    rotationSpeed: 0.5,
    color: '#00ff00',
    scale: 1,
    height: 2,
    position: { x: -2, y: 1, z: -1 },
  },
  sphere: {
    rotationSpeed: 0.3,
    color: '#ff0000',
    scale: 1,
    height: 2,
    position: { x: 0, y: 1, z: 2 },
  },
  door: {
    width: 1,
    height: 2,
    position: { x: 3, y: 1, z: 1 },
  },
});

const threeContainer = ref();

const createMesh = (geometry: BufferGeometry, color: string, receiveShadow = false, castShadow = false) => {
  const material = new MeshStandardMaterial({
    color,
    metalness: 0.45,
    roughness: 0.65,
  });

  resources.geometries.add(geometry);
  resources.materials.add(material);

  const mesh = new Mesh(geometry, material);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;

  return mesh;
};

const setupLights = (scene: Scene) => {
  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 2);
  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 20;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;

  const ambientLight = new AmbientLight(0xffffff, 0.5);

  scene.add(directionalLight, ambientLight);
};

const setupGUI = (cube: Mesh, sphere: Mesh, door: Mesh) => {
  const gui = new GUI();
  resources.gui = gui;

  const cubeFolder = gui.addFolder('Куб');
  cubeFolder.add(objectsState.cube, 'rotationSpeed', 0, 5, 0.1).name('Скорость вращения');
  cubeFolder.addColor(objectsState.cube, 'color').onChange((value: string) => {
    (cube.material as MeshStandardMaterial).color.set(value);
  });
  cubeFolder
    .add(objectsState.cube, 'scale', 0.1, 3, 0.1)
    .name('Размер')
    .onChange((value: number) => {
      cube.scale.set(value, value, value);
    });
  cubeFolder
    .add(objectsState.cube, 'height', 0, 5, 0.1)
    .name('Высота')
    .onChange((value: number) => {
      cube.position.y = value;
    });

  const sphereFolder = gui.addFolder('Сфера');
  sphereFolder.add(objectsState.sphere, 'rotationSpeed', 0, 5, 0.1).name('Скорость вращения');
  sphereFolder.addColor(objectsState.sphere, 'color').onChange((value: string) => {
    (sphere.material as MeshStandardMaterial).color.set(value);
  });
  sphereFolder
    .add(objectsState.sphere, 'scale', 0.1, 3, 0.1)
    .name('Размер')
    .onChange((value: number) => {
      sphere.scale.set(value, value, value);
    });
  sphereFolder
    .add(objectsState.sphere, 'height', 0, 5, 0.1)
    .name('Высота')
    .onChange((value: number) => {
      sphere.position.y = value;
    });

  const doorFolder = gui.addFolder('Дверь');
  doorFolder
    .add(objectsState.door, 'width', 0.5, 2, 0.1)
    .name('Ширина')
    .onChange((value: number) => {
      door.scale.x = value;
    });
  doorFolder
    .add(objectsState.door, 'height', 1, 3, 0.1)
    .name('Высота')
    .onChange((value: number) => {
      const originalHeight = 2;
      door.scale.y = value;
      door.position.y = (value * originalHeight) / 2;
    });
};

const createDoor = () => {
  const textureLoader = new TextureLoader();
  const doorTexture = textureLoader.load('textures/figures/color.jpg');
  resources.textures.add(doorTexture);

  const doorGeometry = new PlaneGeometry(2, 2, 100, 100);
  const doorMaterial = new MeshStandardMaterial({
    map: doorTexture,
    aoMap: textureLoader.load('./textures/figures/ambientOcclusion.jpg'),
    displacementMap: textureLoader.load('./textures/figures/height.jpg'),
    normalMap: textureLoader.load('./textures/figures/normal.jpg'),
    alphaMap: textureLoader.load('./textures/figures/alpha.jpg'),
    metalnessMap: textureLoader.load('./textures/figures/metalness.jpg'),
    roughnessMap: textureLoader.load('./textures/figures/roughness.jpg'),
    displacementScale: 0.1,
    aoMapIntensity: 1,
    transparent: true,
    side: DoubleSide,
  });
  doorMaterial.normalScale.set(2.5, 2.5)

  resources.geometries.add(doorGeometry);
  resources.materials.add(doorMaterial);

  const door = new Mesh(doorGeometry, doorMaterial);
  door.castShadow = true;
  door.position.set(objectsState.door.position.x, objectsState.door.position.y, objectsState.door.position.z);

  return door;
};

const handleSceneReady = ({ scene, renderer }: IThreeContext) => {
  const rgbeLoader = new RGBELoader()
  rgbeLoader.load('textures/figures/background-2.hdr', (environmentMap) =>
  {
    environmentMap.mapping = EquirectangularReflectionMapping;

    scene.background = environmentMap;
    scene.environment = environmentMap;
  })

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const objectsGroup = new Group();

  const plane = createMesh(
    new PlaneGeometry(10, 10),
    '#fff',
    true,
    false,
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;

  const cube = createMesh(
    new BoxGeometry(1, 1, 1),
    objectsState.cube.color,
    false,
    true,
  );
  cube.position.set(objectsState.cube.position.x, objectsState.cube.position.y, objectsState.cube.position.z);

  const sphere = createMesh(
    new SphereGeometry(0.6, 32, 32),
    objectsState.sphere.color,
    false,
    true,
  );
  sphere.position.set(objectsState.sphere.position.x, objectsState.sphere.position.y, objectsState.sphere.position.z);

  objectsGroup.add(cube, sphere);

  setupLights(scene);

  const door = createDoor();

  scene.add(plane, objectsGroup, door);

  setupGUI(cube, sphere, door);

  if (threeContainer.value) {
    threeContainer.value.onTick((elapsedTime: number) => {
      cube.rotation.x = elapsedTime * objectsState.cube.rotationSpeed;
      cube.rotation.y = elapsedTime * (objectsState.cube.rotationSpeed * 0.4);
    });
  }

  onUnmounted(() => {
    resources.geometries.forEach((geometry) => geometry.dispose());
    resources.materials.forEach((material) => material.dispose());
    resources.gui?.destroy();
    resources.textures.forEach((texture) => texture.dispose());
  });
};
</script>

<template>
  <ThreeContainer
    ref="threeContainer"
    :camera-position="[-10, 5, 10]"
    custom-animation
    @scene-ready="handleSceneReady"
  />
</template>

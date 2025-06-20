<script setup lang="ts">
import { Color, Points, ShaderMaterial, BufferGeometry, Float32BufferAttribute, LineSegments } from 'three';
import type { IThreeContext } from '~/types/three';
import pointVertex from '/public/textures/lines/pointVertex.glsl?raw';
import pointFragment from '/public/textures/lines/pointFragment.glsl?raw';
import lineVertex from '/public/textures/lines/lineVertex.glsl?raw';
import lineFragment from '/public/textures/lines/lineFragment.glsl?raw';

const threeContainerRef = ref();

const createPoints = (): {
  points: Points<BufferGeometry, ShaderMaterial>;
  initialPositions: number[];
  animatedPositions: Float32Array;
} => {
  const numPoints = 200;

  const vertices = [];
  const initialPositions = [];
  const noiseOffsets = [];
  const jerkDirections = [];
  const jerkTimes = new Array(numPoints).fill(-1.0);
  const cycleIds = new Array(numPoints).fill(-1);
  const animatedPositions = new Float32Array(numPoints * 3);

  for (let i = 0; i < numPoints; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;

    vertices.push(x, y, z);
    initialPositions.push(x, y, z);
    animatedPositions[i * 3] = x;
    animatedPositions[i * 3 + 1] = y;
    animatedPositions[i * 3 + 2] = z;
    noiseOffsets.push(Math.random() * 100, Math.random() * 100, Math.random() * 100);

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
  geometry.setAttribute('cycleId', new Float32BufferAttribute(cycleIds, 1));

  const material = new ShaderMaterial({
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    uniforms: {
      uTime: { value: 0 },
      uPulseTime: { value: -1.0 },
      uPulseOrigin: { value: [0, 0, 0] },
    },
    transparent: true,
  });

  const points = new Points(geometry, material);
  return { points, initialPositions, animatedPositions };
};

const createLines = (
  points: Points<BufferGeometry, ShaderMaterial>,
  initialPositions: number[],
  animatedPositions: Float32Array,
): { lines: LineSegments; adjacencyList: number[][]; edgeMap: { i: number; j: number }[] } => {
  const numPoints = 200;

  // Compute adjacency list (5 nearest neighbors)
  const adjacencyList: number[][] = Array(numPoints)
    .fill(0)
    .map(() => []);
  const positions = initialPositions;

  for (let i = 0; i < numPoints; i++) {
    const distances: { index: number; dist: number }[] = [];
    for (let j = 0; j < numPoints; j++) {
      if (i !== j) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        distances.push({ index: j, dist });
      }
    }
    distances.sort((a, b) => a.dist - b.dist);
    adjacencyList[i] = distances.slice(0, 5).map((d) => d.index);
  }

  // Create LineSegments geometry
  const lineVertices: number[] = [];
  const lineIndices: number[] = [];
  const jerkTimes1: number[] = [];
  const jerkTimes2: number[] = [];
  const seenEdges = new Set<string>();
  const edgeMap: { i: number; j: number }[] = [];
  let vertexIndex = 0;

  for (let i = 0; i < numPoints; i++) {
    for (const j of adjacencyList[i]) {
      const edgeKey = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seenEdges.has(edgeKey)) {
        seenEdges.add(edgeKey);
        // Use animatedPositions for initial vertices
        lineVertices.push(animatedPositions[i * 3], animatedPositions[i * 3 + 1], animatedPositions[i * 3 + 2]);
        lineVertices.push(animatedPositions[j * 3], animatedPositions[j * 3 + 1], animatedPositions[j * 3 + 2]);
        lineIndices.push(vertexIndex, vertexIndex + 1);
        jerkTimes1.push(points.geometry.attributes.jerkTime.array[i]);
        jerkTimes1.push(points.geometry.attributes.jerkTime.array[i]);
        jerkTimes2.push(points.geometry.attributes.jerkTime.array[j]);
        jerkTimes2.push(points.geometry.attributes.jerkTime.array[j]);
        edgeMap.push({ i, j });
        vertexIndex += 2;
      }
    }
  }

  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute('position', new Float32BufferAttribute(lineVertices, 3));
  lineGeometry.setIndex(lineIndices);
  lineGeometry.setAttribute('jerkTime1', new Float32BufferAttribute(jerkTimes1, 1));
  lineGeometry.setAttribute('jerkTime2', new Float32BufferAttribute(jerkTimes2, 1));

  const lineMaterial = new ShaderMaterial({
    vertexShader: lineVertex,
    fragmentShader: lineFragment,
    uniforms: {
      uTime: { value: 0 },
    },
    transparent: true,
  });

  const lines = new LineSegments(lineGeometry, lineMaterial);
  return { lines, adjacencyList, edgeMap };
};

const handleSceneReady = ({ scene, camera, renderer, controls }: IThreeContext) => {
  let points: Points<BufferGeometry, ShaderMaterial> | null = null;
  let lines: LineSegments | null = null;
  let currentCycleId = 0;
  let adjacencyList: number[][] = [];
  let edgeMap: { i: number; j: number }[] = [];
  let animatedPositions: Float32Array | null = null;

  const init = async () => {
    try {
      scene.background = new Color(0x0a0a2a);

      const pointsResult = createPoints();
      points = pointsResult.points;
      animatedPositions = pointsResult.animatedPositions;
      scene.add(points);

      const linesResult = createLines(points, pointsResult.initialPositions, animatedPositions);
      lines = linesResult.lines;
      adjacencyList = linesResult.adjacencyList;
      edgeMap = linesResult.edgeMap;
      scene.add(lines);
    } catch (error) {
      console.error('Scene initialization failed:', error);
    }
  };

  init();

  if (threeContainerRef.value && threeContainerRef.value.onTick) {
    threeContainerRef.value.onTick((elapsedTime: number) => {
      if (points && points.material.uniforms && lines && animatedPositions) {
        points.material.uniforms.uTime.value = elapsedTime;
        lines.material.uniforms.uTime.value = elapsedTime;
        const cycleIdAttr = points.geometry.attributes.cycleId;
        const jerkTimeAttr = points.geometry.attributes.jerkTime;
        const initialPositions = points.geometry.attributes.initialPositions.array;
        const noiseOffsets = points.geometry.attributes.noiseOffsets.array;
        const jerkDirections = points.geometry.attributes.jerkDirection.array;

        // Update animatedPositions (mimic pointVertex.glsl)
        for (let i = 0; i < 200; i++) {
          let posX = initialPositions[i * 3];
          let posY = initialPositions[i * 3 + 1];
          let posZ = initialPositions[i * 3 + 2];
          posX += Math.sin(elapsedTime + noiseOffsets[i * 3]) * 0.5;
          posY += Math.sin(elapsedTime + noiseOffsets[i * 3 + 1]) * 0.5;
          posZ += Math.sin(elapsedTime + noiseOffsets[i * 3 + 2]) * 0.5;

          const jerkDuration = 0.5;
          const timeSinceJerk = elapsedTime - jerkTimeAttr.array[i];
          let jerkFactor = Math.max(0.0, 1.0 - timeSinceJerk / jerkDuration);
          jerkFactor = Math.pow(jerkFactor, 3.0);
          jerkFactor *= timeSinceJerk >= 0.0 ? Math.min(timeSinceJerk, 0.1) / 0.1 : 0.0; // smoothstep equivalent

          posX += jerkDirections[i * 3] * jerkFactor * 1.0;
          posY += jerkDirections[i * 3 + 1] * jerkFactor * 1.0;
          posZ += jerkDirections[i * 3 + 2] * jerkFactor * 1.0;

          animatedPositions[i * 3] = posX;
          animatedPositions[i * 3 + 1] = posY;
          animatedPositions[i * 3 + 2] = posZ;
        }

        // Update line vertices
        const linePositionAttr = lines.geometry.attributes.position;
        for (let k = 0; k < edgeMap.length; k++) {
          const { i, j } = edgeMap[k];
          linePositionAttr.array[k * 6] = animatedPositions[i * 3];
          linePositionAttr.array[k * 6 + 1] = animatedPositions[i * 3 + 1];
          linePositionAttr.array[k * 6 + 2] = animatedPositions[i * 3 + 2];
          linePositionAttr.array[k * 6 + 3] = animatedPositions[j * 3];
          linePositionAttr.array[k * 6 + 4] = animatedPositions[j * 3 + 1];
          linePositionAttr.array[k * 6 + 5] = animatedPositions[j * 3 + 2];
        }
        linePositionAttr.needsUpdate = true;

        // Existing pulse logic
        if (Math.floor(elapsedTime) % 4 === 0 && elapsedTime - Math.floor(elapsedTime) < 0.1) {
          points.material.uniforms.uPulseTime.value = elapsedTime;
          points.material.uniforms.uPulseOrigin.value = [
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
          ];

          currentCycleId++;

          for (let i = 0; i < cycleIdAttr.count; i++) {
            cycleIdAttr.array[i] = -1;
          }
          cycleIdAttr.needsUpdate = true;
        }

        const pulseTime = points.material.uniforms.uPulseTime.value;
        const pulseOrigin = points.material.uniforms.uPulseOrigin.value;

        if (pulseTime >= 0) {
          const positions = points.geometry.attributes.initialPositions.array;
          const pulseSpeed = 20.0; // Импульс проходит 10 единиц в секунду.
          const pulseDelay = 0.1; // добавляет задержку в 0,1 секунды для более плавности
          const jerkDuration = 0.5;

          let cycleIdUpdated = false;
          for (let i = 0; i < jerkTimeAttr.count; i++) {
            // Reset jerkTime if jerk is complete
            if (jerkTimeAttr.array[i] >= 0 && elapsedTime > jerkTimeAttr.array[i] + jerkDuration) {
              jerkTimeAttr.array[i] = -1.0;
            }

            // Trigger new jerk if pulse reaches point
            if (jerkTimeAttr.array[i] < 0 && cycleIdAttr.array[i] !== currentCycleId) {
              const x = positions[i * 3];
              const y = positions[i * 3 + 1];
              const z = positions[i * 3 + 2];

              const dx = x - pulseOrigin[0];
              const dy = y - pulseOrigin[1];
              const dz = z - pulseOrigin[2];

              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              const triggerTime = pulseTime + distance / pulseSpeed + pulseDelay;

              if (elapsedTime >= triggerTime) {
                jerkTimeAttr.array[i] = elapsedTime;
                cycleIdAttr.array[i] = currentCycleId;
                cycleIdUpdated = true;
              }
            }
          }
          if (cycleIdUpdated) {
            cycleIdAttr.needsUpdate = true;
          }
          jerkTimeAttr.needsUpdate = true;

          // Update line jerk times
          const lineJerkTimes1 = lines.geometry.attributes.jerkTime1.array;
          const lineJerkTimes2 = lines.geometry.attributes.jerkTime2.array;
          for (let k = 0; k < edgeMap.length; k++) {
            const { i, j } = edgeMap[k];
            lineJerkTimes1[k * 2] = jerkTimeAttr.array[i];
            lineJerkTimes1[k * 2 + 1] = jerkTimeAttr.array[i];
            lineJerkTimes2[k * 2] = jerkTimeAttr.array[j];
            lineJerkTimes2[k * 2 + 1] = jerkTimeAttr.array[j];
          }
          lines.geometry.attributes.jerkTime1.needsUpdate = true;
          lines.geometry.attributes.jerkTime2.needsUpdate = true;
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
    if (lines) {
      lines.geometry.dispose();
      lines.material.dispose();
      scene.remove(lines);
      lines = null;
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

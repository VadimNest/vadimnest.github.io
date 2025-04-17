<script setup lang="ts">
import * as THREE from 'three';
import type { IThreeContext } from '~/types/three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { onBeforeUnmount, ref } from 'vue';

const threeContainerRef = ref();

const handleSceneReady = ({ scene, camera, renderer, controls }: IThreeContext) => {
  const init = async () => {
    try {
      scene.background = new THREE.Color(0x0a0a2a);

      const numPoints = 100;
      const positions: number[] = [];
      const initialPositions: number[] = [];
      const noiseOffsets: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i < numPoints; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        positions.push(x, y, z);
        initialPositions.push(x, y, z);
        noiseOffsets.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 100,
        });
      }

      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      const linesGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];
      const lineStartDistances: number[] = [];
      const lineEndDistances: number[] = [];
      const lineTValues: number[] = [];
      const linePulseFlags: number[] = [];
      const lineIndices: number[] = [];

      const pointArray: { x: number; y: number; z: number; index: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        pointArray.push({
          x: positions[i * 3],
          y: positions[i * 3 + 1],
          z: positions[i * 3 + 2],
          index: i,
        });
      }

      const edges: { i: number; j: number; distance: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        for (let j = i + 1; j < numPoints; j++) {
          const dx = pointArray[i].x - pointArray[j].x;
          const dy = pointArray[i].y - pointArray[j].y;
          const dz = pointArray[i].z - pointArray[j].z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          edges.push({ i, j, distance });
        }
      }
      edges.sort((a, b) => a.distance - b.distance);

      const parent = Array(numPoints).fill(-1);
      const find = (x: number): number => (parent[x] === -1 ? x : (parent[x] = find(parent[x])));
      const union = (x: number, y: number) => {
        const rootX = find(x);
        const rootY = find(y);
        if (rootX !== rootY) parent[rootX] = rootY;
      };

      const mstEdges: { i: number; j: number; distance: number }[] = [];
      const connectedPairs = new Set<string>();
      for (const edge of edges) {
        if (find(edge.i) !== find(edge.j)) {
          union(edge.i, edge.j);
          mstEdges.push(edge);
          const idx1 = edge.i;
          const idx2 = edge.j;
          const pairKey = idx1 < idx2 ? `${idx1}-${idx2}` : `${idx2}-${idx1}`;
          connectedPairs.add(pairKey);
        }
      }

      const maxNeighbors = 5;
      const adjacencyList: number[][] = Array(numPoints)
        .fill(null)
        .map(() => []);
      for (const edge of mstEdges) {
        const idx1 = edge.i;
        const idx2 = edge.j;
        linePositions.push(positions[idx1 * 3], positions[idx1 * 3 + 1], positions[idx1 * 3 + 2]);
        linePositions.push(positions[idx2 * 3], positions[idx2 * 3 + 1], positions[idx2 * 3 + 2]);
        lineTValues.push(0.0, 1.0);
        linePulseFlags.push(0.0, 0.0);
        lineIndices.push(idx1, idx2);
        adjacencyList[idx1].push(idx2);
        adjacencyList[idx2].push(idx1);
      }

      for (let i = 0; i < numPoints; i++) {
        const currentPoint = pointArray[i];
        const distances = pointArray.map((otherPoint, idx) => {
          if (i === idx) return { distance: Infinity, idx };
          const dx = currentPoint.x - otherPoint.x;
          const dy = currentPoint.y - otherPoint.y;
          const dz = currentPoint.z - otherPoint.z;
          return { distance: Math.sqrt(dx * dx + dy * dy + dz * dz), idx };
        });

        distances.sort((a, b) => a.distance - b.distance);
        const nearest = distances.slice(0, maxNeighbors);

        for (const neighbor of nearest) {
          const idx1 = i;
          const idx2 = neighbor.idx;
          const pairKey = idx1 < idx2 ? `${idx1}-${idx2}` : `${idx2}-${idx1}`;
          if (!connectedPairs.has(pairKey)) {
            connectedPairs.add(pairKey);
            linePositions.push(positions[idx1 * 3], positions[idx1 * 3 + 1], positions[idx1 * 3 + 2]);
            linePositions.push(positions[idx2 * 3], positions[idx2 * 3 + 1], positions[idx2 * 3 + 2]);
            lineTValues.push(0.0, 1.0);
            linePulseFlags.push(0.0, 0.0);
            lineIndices.push(idx1, idx2);
            adjacencyList[idx1].push(idx2);
            adjacencyList[idx2].push(idx1);
          }
        }
      }

      console.log('Total number of lines:', lineIndices.length / 2);

      // Function to compute distances and update line attributes
      const updateDistancesAndAttributes = (sourceIndex: number) => {
        const distances: number[] = Array(numPoints).fill(Infinity);
        distances[sourceIndex] = 0;
        const queue: number[] = [sourceIndex];
        const visited: boolean[] = Array(numPoints).fill(false);
        visited[sourceIndex] = true;

        while (queue.length > 0) {
          const current = queue.shift()!;
          const currentDistance = distances[current];
          for (const neighbor of adjacencyList[current]) {
            if (!visited[neighbor]) {
              visited[neighbor] = true;
              distances[neighbor] = currentDistance + 1;
              queue.push(neighbor);
            }
          }
        }

        console.log('Distances from source:', distances);
        console.log('Number of unreachable points:', distances.filter((d) => d === Infinity).length);

        lineStartDistances.length = 0;
        lineEndDistances.length = 0;
        lineTValues.length = 0;

        for (let i = 0; i < lineIndices.length; i += 2) {
          const idx1 = lineIndices[i];
          const idx2 = lineIndices[i + 1];
          const startDistance = distances[idx1];
          const endDistance = distances[idx2];
          if (startDistance <= endDistance) {
            lineStartDistances.push(startDistance, startDistance);
            lineEndDistances.push(endDistance, endDistance);
            lineTValues.push(0.0, 1.0);
          } else {
            lineStartDistances.push(endDistance, endDistance);
            lineEndDistances.push(startDistance, startDistance);
            lineTValues.push(1.0, 0.0);
          }
        }

        console.log('Sample startDistances:', lineStartDistances.slice(0, 10));
        console.log('Sample endDistances:', lineEndDistances.slice(0, 10));

        linesGeometry.setAttribute('startDistance', new THREE.Float32BufferAttribute(lineStartDistances, 1));
        linesGeometry.setAttribute('endDistance', new THREE.Float32BufferAttribute(lineEndDistances, 1));
        linesGeometry.setAttribute('lineT', new THREE.Float32BufferAttribute(lineTValues, 1));

        return { distances, maxDistance: Math.max(...distances.filter((d) => d !== Infinity)) };
      };

      // Initial distance computation
      let { distances, maxDistance } = updateDistancesAndAttributes(0);

      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      linesGeometry.setAttribute('pulseFlag', new THREE.Float32BufferAttribute(linePulseFlags, 1));

      const vertexShader = `
        varying vec3 vPosition;
        varying float vLineT;
        varying float vStartDistance;
        varying float vEndDistance;
        varying float vPulseFlag;
        attribute float lineT;
        attribute float startDistance;
        attribute float endDistance;
        attribute float pulseFlag;
        void main() {
          vPosition = position;
          vLineT = lineT;
          vStartDistance = startDistance;
          vEndDistance = endDistance;
          vPulseFlag = pulseFlag;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 8.0;
        }
      `;

      const pointsFragmentShader = `
        uniform vec3 color;
        uniform float opacity;
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          gl_FragColor = vec4(color, opacity);
        }
      `;

      const linesFragmentShader = `
        uniform vec3 color;
        uniform float opacity;
        uniform float pulseTime;
        varying vec3 vPosition;
        varying float vLineT;
        varying float vStartDistance;
        varying float vEndDistance;
        varying float vPulseFlag;
        void main() {
          if (vStartDistance > 10000.0 || vEndDistance > 10000.0) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            return;
          }
          vec3 baseColor = color;
          float baseOpacity = opacity;
          float highlight = 0.0;
          float effectiveEndDistance = max(vEndDistance, vStartDistance + 0.5);
          if (vPulseFlag < 0.5 && pulseTime >= vStartDistance && pulseTime <= effectiveEndDistance) {
            float t = (pulseTime - vStartDistance) / max(effectiveEndDistance - vStartDistance, 0.001);
            float dist = abs(vLineT - t);
            if (dist < 0.3) {
              highlight = 2.0 * exp(-pow(dist * 10.0, 2.0));
              highlight = min(highlight, 1.0);
            }
          }
          vec3 highlightColor = vec3(1.0, 1.0, 1.0);
          vec3 finalColor = mix(baseColor, highlightColor, highlight);
          float finalOpacity = mix(baseOpacity, 1.0, highlight);
          gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `;

      const pointsMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          opacity: { value: 1.0 },
        },
        vertexShader,
        fragmentShader: pointsFragmentShader,
        transparent: true,
      });

      const linesMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          opacity: { value: 0.3 },
          pulseTime: { value: 0.0 },
        },
        vertexShader,
        fragmentShader: linesFragmentShader,
        transparent: true,
      });

      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      const lines = new THREE.LineSegments(linesGeometry, linesMaterial);

      scene.add(points);
      scene.add(lines);

      const renderPass = new RenderPass(scene, camera);
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2.5, 0.4, 0.75);
      const composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);

      const onWindowResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        composer.setSize(width, height);
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', onWindowResize);

      let resetInterval = maxDistance + 5.0;
      let pulseTime = 0.0;
      let lastElapsedTime = 0.0;

      if (threeContainerRef.value && threeContainerRef.value.onTick) {
        threeContainerRef.value.onTick((elapsedTime: number, deltaTime?: number) => {
          let computedDeltaTime = deltaTime ?? elapsedTime - lastElapsedTime;
          lastElapsedTime = elapsedTime;
          if (isNaN(computedDeltaTime) || computedDeltaTime < 0) {
            computedDeltaTime = 0.016;
          }

          const positionsArray = pointsGeometry.attributes.position.array as Float32Array;
          for (let i = 0; i < numPoints; i++) {
            const idx = i * 3;
            const offset = noiseOffsets[i];
            const noiseX = Math.sin(elapsedTime * 0.2 + offset.x) * Math.cos(elapsedTime * 0.1 + offset.x * 0.5);
            const noiseY = Math.cos(elapsedTime * 0.2 + offset.y) * Math.sin(elapsedTime * 0.1 + offset.y * 0.5);
            const noiseZ = Math.sin(elapsedTime * 0.2 + offset.z) * Math.cos(elapsedTime * 0.1 + offset.z * 0.5);
            positionsArray[idx] = initialPositions[idx] + noiseX * 1.0;
            positionsArray[idx + 1] = initialPositions[idx + 1] + noiseY * 1.0;
            positionsArray[idx + 2] = initialPositions[idx + 2] + noiseZ * 1.0;
          }
          pointsGeometry.attributes.position.needsUpdate = true;

          const linePositionsArray = linesGeometry.attributes.position.array as Float32Array;
          const pulseFlagsArray = linesGeometry.attributes.pulseFlag.array as Float32Array;
          for (let i = 0; i < lineIndices.length / 2; i++) {
            const idx1 = lineIndices[i * 2] * 3;
            const idx2 = lineIndices[i * 2 + 1] * 3;
            const lineIdx = i * 6;
            linePositionsArray[lineIdx] = positionsArray[idx1];
            linePositionsArray[lineIdx + 1] = positionsArray[idx1 + 1];
            linePositionsArray[lineIdx + 2] = positionsArray[idx1 + 2];
            linePositionsArray[lineIdx + 3] = positionsArray[idx2];
            linePositionsArray[lineIdx + 4] = positionsArray[idx2 + 1];
            linePositionsArray[lineIdx + 5] = positionsArray[idx2 + 2];

            const startDistance = lineStartDistances[i * 2];
            const effectiveEndDistance = Math.max(lineEndDistances[i * 2], startDistance + 0.5);
            if (pulseTime > effectiveEndDistance && pulseFlagsArray[i * 2] < 0.5) {
              pulseFlagsArray[i * 2] = 1.0;
              pulseFlagsArray[i * 2 + 1] = 1.0;
              console.log(
                `Line ${i} pulsed: start=${startDistance}, end=${effectiveEndDistance}, pulseTime=${pulseTime}`,
              );
            }
          }
          linesGeometry.attributes.position.needsUpdate = true;
          linesGeometry.attributes.pulseFlag.needsUpdate = true;

          pulseTime += computedDeltaTime * 3.0;
          if (pulseTime > resetInterval) {
            pulseTime = 0.0;
            const newSourceIndex = Math.floor(Math.random() * numPoints);
            console.log('New Source Index:', newSourceIndex);
            const result = updateDistancesAndAttributes(newSourceIndex);
            distances = result.distances;
            maxDistance = result.maxDistance;
            resetInterval = maxDistance + 5.0;
            for (let i = 0; i < pulseFlagsArray.length; i++) {
              pulseFlagsArray[i] = 0.0;
            }
            linesGeometry.attributes.pulseFlag.needsUpdate = true;
            console.log('Pulse Reset, pulseTime:', pulseTime, 'resetInterval:', resetInterval);
          }
          linesMaterial.uniforms.pulseTime.value = pulseTime;

          composer.render();
        });
      }

      camera.position.set(0, 0, 40);
      controls.update();

      onBeforeUnmount(() => {
        window.removeEventListener('resize', onWindowResize);
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
    :camera-position="[0, 0, 40]"
    :far="150"
    custom-animation
    @scene-ready="handleSceneReady"
  />
</template>

<style lang="less">
.three-container {
  width: 100%;
  height: 100vh;
}
</style>

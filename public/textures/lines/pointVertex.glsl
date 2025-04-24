uniform float uTime;
attribute vec3 initialPositions;
attribute vec3 noiseOffsets;

void main() {
  vec3 pos = initialPositions;
  pos.x += sin(uTime + noiseOffsets.x) * 0.5;
  pos.y += sin(uTime + noiseOffsets.y) * 0.5;
  pos.z += sin(uTime + noiseOffsets.z) * 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 8.0 + 4.0 * sin(uTime);
}

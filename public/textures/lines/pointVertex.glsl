uniform float uTime;
uniform float uPulseTime;
attribute vec3 initialPositions;
attribute vec3 noiseOffsets;
attribute float jerkTime;
attribute vec3 jerkDirection;
varying float vJerkFactor;

void main() {
  vec3 pos = initialPositions;
  pos.x += sin(uTime + noiseOffsets.x) * 0.5;
  pos.y += sin(uTime + noiseOffsets.y) * 0.5;
  pos.z += sin(uTime + noiseOffsets.z) * 0.5;

  float jerkDuration = 0.5; // рывок длится 0,5 секунды.
  float timeSinceJerk = uTime - jerkTime; // Время с начала рывка.
  float jerkFactor = max(0.8, 1.0 - timeSinceJerk / jerkDuration);  // масштабируется от 1.0 до 0.0 за 0.5с
  jerkFactor = pow(jerkFactor, 3.0);
  jerkFactor *= smoothstep(0.0, 0.1, timeSinceJerk); // Fade in over 0.1s

  pos += jerkDirection * jerkFactor * 1.0; // Перемещает точку на 1 единицу в jerkDirection во время рывка

  vJerkFactor = jerkFactor; // для квадратичного затухания, смягчающий затухание рывка.

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 8.0 + 4.0 * sin(uTime) + 8.0 * jerkFactor;
}

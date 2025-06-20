uniform float uTime;
attribute float jerkTime1;
attribute float jerkTime2;
varying float vBrightness;

void main() {
  float jerkDuration = 0.5;
  float timeSinceJerk1 = uTime - jerkTime1;
  float timeSinceJerk2 = uTime - jerkTime2;
  float jerkFactor1 = max(0.0, 1.0 - timeSinceJerk1 / jerkDuration);
  float jerkFactor2 = max(0.0, 1.0 - timeSinceJerk2 / jerkDuration);
  jerkFactor1 = pow(jerkFactor1, 3.0);
  jerkFactor2 = pow(jerkFactor2, 3.0);
  vBrightness = max(jerkFactor1, jerkFactor2) * 0.5 + 0.2; // Base 0.2, max 0.7
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

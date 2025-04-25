uniform float uTime;
varying float vJerkFactor;

void main() {
  float brightness = 0.5 + 0.5 * sin(uTime);
  brightness += vJerkFactor * 0.5; // Brighten during jerk
  gl_FragColor = vec4(brightness, brightness, 1.0, 1.0);
}

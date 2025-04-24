uniform float uTime;

void main() {
  float brightness = 0.5 + 0.5 * sin(uTime);
  gl_FragColor = vec4(brightness, brightness, 1.0, 1.0);
}

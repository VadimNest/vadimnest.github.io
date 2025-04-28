uniform float uTime;
varying float vJerkFactor;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float brightness = 0.5 + 0.5 * sin(uTime);
  brightness += vJerkFactor * 0.5; // Brighten during jerk
  gl_FragColor = vec4(brightness, brightness, 1.0, 1.0);
}

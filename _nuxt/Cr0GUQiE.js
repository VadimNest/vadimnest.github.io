import{_}from"./0mVLCgav.js";import{_ as A,a5 as F,C as M,a3 as T,S as v,B as V,a as g,l as j,P as I,g as x,a6 as N,h as f,a7 as k,a8 as G,a9 as D,aa as B,ab as w,j as b}from"./DFetf91e.js";import{m as R,c as U,b as P,w as q,F as Y,o as Z,d as X}from"./DEE8E_cv.js";const E=`uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
attribute float atrScale;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(uTime + modelPosition.x * 100.0) * atrScale * 0.05;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  gl_PointSize = uSize * atrScale * uPixelRatio;
  gl_PointSize *= (1.0 / -viewPosition.z);
}
`,W=`uniform float uTime;
void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = 0.05 / distanceToCenter - 0.1;

  float flicker = sin(uTime * 2.0) * 0.3 + 0.7;
  gl_FragColor = vec4(1.0, 1.0, 1.0, strength * flicker);
}
`,K=`uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,O=`
uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.14159265358979323846;

// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
  }

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
  }

float fbm(vec4 p) {
  float sum = 0.0;
  float amp = 1.0;
  float scale = 1.0;

  for(int i=0; i<6; i++) {
    sum += snoise(p*scale)*amp;
    p.w += 100.0;
    amp *= 0.9;
    scale *= 2.0;
  }
  return sum;
}

void main() {
  vec4 p = vec4(vPosition*3.0, time*0.05);
  float noisy = fbm(p);
  gl_FragColor = vec4(noisy);

  vec4 p1 = vec4(vPosition*2.0, time*0.05);
  float spots = max(snoise(p1), 0.0);

  gl_FragColor = vec4(noisy);
  gl_FragColor *= mix(1.0, spots, 0.7);
}

`,$=`uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;

varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;
varying vec3 eyeVector;
varying vec3 vNormal;

mat2 rotate(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c,-s,s,c);
}

void main() {
  vNormal = normal;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  eyeVector = normalize(worldPosition.xyz - cameraPosition);


  float t = time * 0.005;
  mat2 rot = rotate(t);

  vec3 p0 = position;
  p0.yz = rot * p0.yz;
  vLayer0 = p0;

  mat2 rot1 = rotate(t*1.5 + 10.0);
  vec3 p1 = position;
  p1.xz = rot1 * p1.xz;
  vLayer1 = p1;

  mat2 rot2 = rotate(t*2.0 + 30.0);
  vec3 p2 = position;
  p2.xy = rot2 * p2.xy;
  vLayer2 = p2;

  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,H=`
uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
uniform samplerCube uPerlin;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;
varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;

float PI = 3.14159265358979323846;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
  return pow( 1.0 + dot(eyeVector, worldNormal), 3.0 );
}

vec3 brightnessToColor(float b) {
  b *= 0.25;

  return (vec3(b, b*b, b*b*b*b)/0.25) * 0.8;
}

float supersun() {
  float sum = 0.0;
  sum += textureCube(uPerlin, vLayer0).r;
  sum += textureCube(uPerlin, vLayer1).r;
  sum += textureCube(uPerlin, vLayer2).r;
  sum *= 0.33;
  return sum;
}

void main() {
  float brightness = supersun();
  brightness = brightness * 4.0 + 1.0;

  float fres = Fresnel(eyeVector, vNormal);
  brightness += fres;

  vec3 col = brightnessToColor(brightness);
  gl_FragColor = vec4(col, 1.0);
}
`,J=`uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;

varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;
varying vec3 eyeVector;
varying vec3 vNormal;

mat2 rotate(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c,-s,s,c);
}

void main() {
  vNormal = normal;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  eyeVector = normalize(worldPosition.xyz - cameraPosition);


  float t = time * 0.005;
  mat2 rot = rotate(t);

  vec3 p0 = position;
  p0.yz = rot * p0.yz;
  vLayer0 = p0;

  mat2 rot1 = rotate(t + 10.0);
  vec3 p1 = position;
  p1.xz = rot1 * p1.xz;
  vLayer1 = p1;

  mat2 rot2 = rotate(t + 30.0);
  vec3 p2 = position;
  p2.xy = rot2 * p2.xy;
  vLayer2 = p2;

  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Q=`
uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
uniform samplerCube uPerlin;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;
varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;

float PI = 3.14159265358979323846;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
  return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

vec3 brightnessToColor(float b) {
  b *= 0.25;

  return (vec3(b, b * b, b * b * b * b) / 0.25) * 0.8;
}

float supersun() {
  float sum = 0.0;
  sum += textureCube(uPerlin, vLayer0).r;
  sum += textureCube(uPerlin, vLayer1).r;
  sum += textureCube(uPerlin, vLayer2).r;
  sum *= 0.33;
  return sum;
}

void main() {
  float radial = 0.55 + vPosition.z;
  radial *= radial*radial;
  float brightness = 1.0 + radial * 0.83;
  gl_FragColor.rgb = brightnessToColor(brightness)*radial;
  gl_FragColor.a = radial;
}
`,an=R({__name:"sun",setup(nn){const h=()=>{const t=new V,n=new Float32Array(50*3),i=new Float32Array(50);for(let o=0;o<50;o++)n[o*3+0]=(Math.random()-.5)*10,n[o*3+1]=(Math.random()-.5)*4,n[o*3+2]=Math.random()*3+5,i[o]=Math.random();t.setAttribute("position",new g(n,3)),t.setAttribute("atrScale",new g(i,1));const a=new v({uniforms:{uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uSize:{value:200},uTime:{value:0}},vertexShader:E,fragmentShader:W,transparent:!0,blending:j,depthWrite:!1});return new I(t,a)},z=()=>{const e=new x(1,30,30),t=new v({extensions:{derivatives:!0},side:b,uniforms:{time:{value:0},uPerlin:{value:null},resolution:{value:new w}},vertexShader:$,fragmentShader:H}),n=new f(e,t);return n.position.z=5,n},C=()=>{const e=new k(256,{format:D,generateMipmaps:!0,minFilter:G}),t=new B(.1,100,e),n=new v({extensions:{derivatives:!0},side:b,uniforms:{time:{value:0},resolution:{value:new w}},vertexShader:K,fragmentShader:O}),i=new x(.99,30,30),a=new f(i,n);return{cubeCamera:t,cubeRenderTarget:e,perlin:a,materialPerlin:n}},S=()=>{const e=new x(1.2,30,30),t=new v({side:N,transparent:!0,uniforms:{time:{value:0}},vertexShader:J,fragmentShader:Q}),n=new f(e,t);return n.position.z=5,n},L=({scene:e,camera:t,renderer:n})=>{const i=new F;let a,o=null,r=null,d=null,c=null,s=null,l=null,m=null;return(async()=>{try{e.background=new M("#0A0A0A"),o=h(),e.add(o),d=S(),e.add(d),{cubeCamera:c,cubeRenderTarget:s,perlin:l,materialPerlin:m}=C(),i.add(l),r=z(),e.add(r);const u=new T,y=()=>{const p=u.getElapsedTime();o&&(o.material.uniforms.uTime.value=p),c&&c.update(n,i),r&&r.material instanceof v&&m&&(r.material.uniforms.uPerlin.value=s==null?void 0:s.texture,r.material.uniforms.time.value=p,m.uniforms.time.value=p),n.render(e,t),a=requestAnimationFrame(y)};y()}catch(u){console.error("Scene initialization failed:",u)}})(),()=>{a&&cancelAnimationFrame(a),o&&(o.geometry.dispose(),o.material.dispose(),e.remove(o)),r&&(r.geometry.dispose(),r.material.dispose(),e.remove(r)),l&&(l.geometry.dispose(),l.material.dispose(),i.remove(l)),s&&s.dispose(),e.clear(),i.clear(),n.dispose()}};return(e,t)=>{const n=_,i=A;return Z(),U(Y,null,[P(n,{class:"go-back",to:"/"},{default:q(()=>t[0]||(t[0]=[X("⭠ на главную")])),_:1}),P(i,{"camera-position":[0,0,-1],"custom-animation":"",onSceneReady:L})],64)}}});export{an as default};

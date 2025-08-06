import{_ as B}from"./0mVLCgav.js";import{_ as T,C as x,B as j,a as c,S as L,l as V,s as Z,t as E}from"./DFetf91e.js";import{E as O,R as G,U as N}from"./B8Flzvmy.js";import{m as U,r as W,c as H,b as S,w as $,F as q,o as D,d as I}from"./DEE8E_cv.js";const J=`
uniform float uTime;
attribute float atrSpeed;
attribute float atrLength;
attribute vec3 atrColor;

varying vec3 vColor;
varying float vZPosition;

void main() {
  vec3 transformed = position;

  transformed.z += uTime * atrSpeed;

  float zRange = 50.0;
  transformed.z = mod(transformed.z + zRange, zRange * 2.0) - zRange;

  if (position.z < 0.0) {
    transformed.z -= atrLength * 10.0;
  }

  vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
  vec4 projectionPosition = projectionMatrix * viewMatrix * modelPosition;

  gl_Position = projectionPosition;

  vColor = atrColor;
  vZPosition = transformed.z;
}
`,K=`
varying vec3 vColor;
varying float vZPosition;

void main() {
  float alpha = 1.0 - abs(vZPosition) / 50.0;

  if (alpha < 0.1) discard;

  gl_FragColor = vec4(vColor, alpha);
}
`,oe=U({__name:"space-fly",setup(Q){const v=W(),z=g=>{var y;const{scene:o,camera:l,renderer:d}=g;o.background=new x("#000000");const r=500,a=new j,e=new Float32Array(r*2*3),h=new Float32Array(r*2),w=new Float32Array(r*2),i=new Float32Array(r*2*3);for(let t=0;t<r;t++){const C=(Math.random()-.5)*20,b=(Math.random()-.5)*20,P=Math.random()*100-50,n=t*2*3;e[n+0]=C,e[n+1]=b,e[n+2]=P,e[n+3]=C,e[n+4]=b,e[n+5]=P-1;const F=5+Math.random()*10,k=1+Math.random()*2,s=new x;t%2===0?s.set(16777215):s.set(43775);for(let f=0;f<2;f++){const p=t*2+f;h[p]=F,w[p]=k;const u=p*3;i[u+0]=s.r,i[u+1]=s.g,i[u+2]=s.b}}a.setAttribute("position",new c(e,3)),a.setAttribute("atrSpeed",new c(h,1)),a.setAttribute("atrLength",new c(w,1)),a.setAttribute("atrColor",new c(i,3));const _=new L({uniforms:{uTime:{value:0}},vertexShader:J,fragmentShader:K,transparent:!0,blending:V,depthWrite:!1}),A=new Z(a,_);o.add(A);const m=new O(d),M=new G(o,l);m.addPass(M);const R=new N(new E(window.innerWidth,window.innerHeight),1.5,.4,.85);m.addPass(R),(y=v.value)==null||y.onTick(t=>{_.uniforms.uTime.value=t,m.render()})};return(g,o)=>{const l=B,d=T;return D(),H(q,null,[S(l,{class:"go-back",to:"/"},{default:$(()=>o[0]||(o[0]=[I("⭠ на главную")])),_:1}),S(d,{ref_key:"threeContainerRef",ref:v,"camera-position":[0,0,5],"custom-animation":"",onSceneReady:z},null,512)],64)}}});export{oe as default};

import{_ as y}from"./0mVLCgav.js";import{m as w,c as f,o as _,a as l,F as M,q as C,b as h,w as b,d as k,t as j,r as z}from"./DEE8E_cv.js";import{_ as A,C as R,h as T,m as B,M as F,B as L,a as g,S as G,l as N,P as V}from"./DFetf91e.js";import{G as E}from"./C449XiK3.js";const $={class:"projects"},q={class:"projects__container"},D=w({__name:"ProjectsList",setup(S){const a=[{name:"01 - Геометрические фигуры, дверь",component:"figures"},{name:"02 - Галактика",component:"galaxy"},{name:"03 - Океан",component:"ocean"},{name:"04 - Остров",component:"island"},{name:"05 - Взрыв частиц",component:"explosion-particles"},{name:"06 - Полет через космос",component:"space-fly"},{name:"07 - Модель дракона из частиц",component:"particles-model"},{name:"08 - Модель tesla",component:"tesla"},{name:"09 - Процедурно сгенерированное солнце",component:"sun"},{name:"10 - Нейронка",component:"lines"},{name:"11 - Yandex music эквалайзер",component:"music"}];return(v,n)=>{const t=y;return _(),f("div",$,[l("div",q,[n[0]||(n[0]=l("h2",{class:"projects__title"},"Projects:",-1)),l("ul",null,[(_(),f(M,null,C(a,o=>l("li",{key:o.name,class:"projects__link"},[h(t,{to:o.component},{default:b(()=>[k(j(o.name),1)]),_:2},1032,["to"])])),64))])])])}}}),H=`
uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
attribute float atrScale;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(uTime + modelPosition.x * 100.0) * atrScale * 0.2;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  gl_PointSize = uSize * atrScale * uPixelRatio;
  gl_PointSize *= (1.0 / -viewPosition.z);
}
`,I=`
void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = 0.05 / distanceToCenter - 0.1;

  gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
}
`,Q=w({__name:"index",setup(S){const a=z(),v=n=>{const{scene:t}=n;t.background=new R("#000000");let o,s,c;new E().load("/models/index/5.glb",m=>{var P;o=m.scene,t.add(o),o.position.set(-20,-10,-5),o.traverse(e=>{if(e instanceof T){const p=e.material;if(e.name==="Sphere010"){const r=new B({color:0,metalness:0,roughness:0});e.material=r,p.dispose()}else if(e.name.toLowerCase().includes("bezcircle010")){const r=new F({color:8388736,emissive:8388736,emissiveIntensity:50,metalness:0,roughness:1});e.material=r,p.dispose()}}});const d=5e3,u=new L,i=new Float32Array(d*3),x=new Float32Array(d);for(let e=0;e<d;e++)i[e*3+0]=(Math.random()-.5)*100,i[e*3+1]=(Math.random()-.5)*50,i[e*3+2]=(Math.random()-.5)*100,x[e]=Math.random();u.setAttribute("position",new g(i,3)),u.setAttribute("atrScale",new g(x,1)),c=new G({uniforms:{uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uSize:{value:300},uTime:{value:0}},vertexShader:H,fragmentShader:I,transparent:!0,blending:N,depthWrite:!1}),s=new V(u,c),t.add(s),(P=a.value)==null||P.onTick(e=>{o.position.x=-20+.5*Math.cos(e*.5),o.position.z=-5+.5*Math.sin(e*.5),c.uniforms.uTime.value=e})},void 0,m=>{console.error("Error loading black hole model:",m)})};return(n,t)=>{const o=D,s=A;return _(),f(M,null,[h(o,{class:"index__list"}),h(s,{class:"index__scene",ref_key:"threeContainerRef",ref:a,"camera-position":[2,.8,0],"custom-animation":"",onSceneReady:v},null,512)],64)}}});export{Q as default};

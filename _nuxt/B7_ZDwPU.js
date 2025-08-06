import{_ as k}from"./0mVLCgav.js";import{_ as G,d as T,A as j,i as O,n as U,h as _,o as y,p as b,B as V,a as z,S as N,l as W,P as X,q as Z}from"./DFetf91e.js";import{G as q}from"./DNkUmkFf.js";import{G as E}from"./C449XiK3.js";import{D as H}from"./7nYl09LV.js";import{m as $,r as L,p as J,c as K,b as R,w as Q,F as Y,o as ee,d as te}from"./DEE8E_cv.js";const ae=`
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
`,oe=`
void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = 0.05 / distanceToCenter - 0.1;

  gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
}
`,fe=$({__name:"island",setup(ne){const x={clearColor:"#050A30"};let g=null,v=null,u=null,o=null,n=null,p=null,S=null;const F=i=>{const r=new j(16775393,2);i.add(r);const t=new O(16766720,2.5);t.position.set(30,15,5),t.castShadow=!0,t.shadow.mapSize.set(2048,2048),t.shadow.camera.near=1,t.shadow.camera.far=50,t.shadow.normalBias=-1e-9,t.shadow.camera.left=-30,t.shadow.camera.right=30,t.shadow.camera.top=30,t.shadow.camera.bottom=-30,t.shadow.camera.updateProjectionMatrix(),i.add(t);const w=new U(8900331,2263842,1);i.add(w);const c=new H;c.setDecoderPath("draco/");const f=new E;f.setDRACOLoader(c),f.load("/models/island/island.glb",a=>{const s=a.scene;s.traverse(e=>{e instanceof _&&(e.name!=="Water"&&!e.name.includes("hollywood")&&!e.name.includes("heart")&&!e.name.includes("div")?(e.castShadow=!0,e.receiveShadow=!0):(e.castShadow=!1,e.receiveShadow=!1),(e.name==="Landscape"||e.name==="Street")&&(e.castShadow=!1),e.name.includes("tree")&&(e.receiveShadow=!1,e.castShadow=!0,e.material.color.set(13034239)),e.name==="Landscape"&&(e.material.color.set(7042265),e.castShadow=!1),e.name==="Street"&&(e.material.color.set(4347522),e.castShadow=!1,e.receiveShadow=!0),e.geometry&&(e.geometry.attributes.position.usage=y))}),i.add(s)}),f.load("models/island/Fox.gltf",a=>{o=a.scene,o.traverse(e=>{e instanceof _&&(e.castShadow=!0,e.geometry&&(e.geometry.attributes.position.usage=y))}),o.scale.set(.005,.005,.005),i.add(o),v=new b(o),v.clipAction(a.animations[1]).play()}),f.load("models/island/Fox.gltf",a=>{n=a.scene,n.traverse(e=>{e instanceof _&&(e.castShadow=!0,e.geometry&&(e.geometry.attributes.position.usage=y))}),n.scale.set(.005,.005,.005),i.add(n),u=new b(n),u.clipAction(a.animations[2]).play()});const h=500,l=new V,d=new Float32Array(h*3),m=new Float32Array(h);for(let a=0;a<h;a++)d[a*3+0]=(Math.random()-.5)*50,d[a*3+1]=Math.random()*10,d[a*3+2]=(Math.random()-.5)*50,m[a]=Math.random();l.setAttribute("position",new z(d,3)),l.setAttribute("atrScale",new z(m,1)),S=new N({uniforms:{uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uSize:{value:200},uTime:{value:0}},vertexShader:ae,fragmentShader:oe,transparent:!0,blending:W,depthWrite:!1}),p=new X(l,S),i.add(p)},M=L(),I=({scene:i,renderer:r,controls:t})=>{F(i),r.shadowMap.enabled=!0,r.shadowMap.type=T,r.setClearColor(x.clearColor),t.minPolarAngle=Math.PI/2.5,t.maxPolarAngle=Math.PI/2.2,t.minDistance=19,t.maxDistance=30,g=new q({width:400}),g.add(S.uniforms.uSize,"value").min(0).max(200).step(1).name("firefliesSize"),g.addColor(x,"clearColor").onChange(()=>{r.setClearColor(x.clearColor)});let w=0,c=0,f=0,h=0;M.value&&M.value.onTick(l=>{const d=l-w;if(w=l,S&&(S.uniforms.uTime.value=l),o){o.position.x=Math.cos(l*.1)*12,o.position.z=Math.sin(l*.1)*12;const m=Math.cos((l+.01)*.1)*12,a=Math.sin((l+.01)*.1)*12,s=m-o.position.x,e=a-o.position.z,P=Math.atan2(e,s);o.rotation.y=-P+1.5}if(n&&t){const m=11.399999999999999,a=t.getAzimuthalAngle();let s=a-f;s>Math.PI?s-=2*Math.PI:s<-Math.PI&&(s+=2*Math.PI),c+=s,f=a,n.position.x=Math.cos(c+Math.PI/.665)*m,n.position.z=-Math.sin(c+Math.PI/.665)*m;const e=Math.cos(a+.01)*m,P=-Math.sin(a+.01)*m,D=e-n.position.x,B=P-n.position.z,A=Math.atan2(B,D);n.rotation.y=h<c?-A+.8:-A-2.3,h=c,u&&(u.timeScale=Math.abs(s)*100)}v&&v.update(d),u&&u.update(d)})};J(()=>{var i,r;g&&g.destroy(),p&&(p.geometry.dispose(),p.material instanceof Z&&p.material.dispose()),o&&((i=C.value)==null||i.remove(o)),n&&((r=C.value)==null||r.remove(n))});const C=L(null);return(i,r)=>{const t=k,w=G;return ee(),K(Y,null,[R(t,{class:"go-back",to:"/"},{default:Q(()=>r[0]||(r[0]=[te("⭠ на главную")])),_:1}),R(w,{ref_key:"threeContainerRef",ref:M,"camera-position":[.3,.7,3],fov:45,far:100,"custom-animation":"",onSceneReady:I},null,512)],64)}}});export{fe as default};

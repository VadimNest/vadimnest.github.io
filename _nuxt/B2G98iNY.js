import{_ as Dt}from"./0mVLCgav.js";import{_ as Tt,C as H,B as rt,r as x,S as ct,P as jt,s as Pt,t as Ft}from"./DFetf91e.js";import{R as _t,U as zt,E as At}from"./B8Flzvmy.js";import{m as Lt,r as Ct,c as Et,b as lt,w as Ut,F as $t,o as It,d as Jt,g as Bt}from"./DEE8E_cv.js";const Yt=Lt({__name:"lines",setup(Rt){const $=Ct(),ut=({scene:j,camera:P,renderer:I,controls:N})=>{(async()=>{try{j.background=new H(657962);const f=200,a=[],J=[],K=[],Q=[],tt=[];for(let t=0;t<f;t++){const e=(Math.random()-.5)*40,s=(Math.random()-.5)*40,r=(Math.random()-.5)*40;a.push(e,s,r),J.push(e,s,r),K.push({x:Math.random()*100,y:Math.random()*100,z:Math.random()*100}),Q.push(-1);const o=Math.random()*2*Math.PI,n=Math.acos(2*Math.random()-1),i=Math.sin(n)*Math.cos(o),d=Math.sin(n)*Math.sin(o),h=Math.cos(n);tt.push(i,d,h)}const m=new rt;m.setAttribute("position",new x(a,3)),m.setAttribute("jerkTime",new x(Q,1)),m.setAttribute("jerkDirection",new x(tt,3));const p=new rt,F=[],S=[],_=[],B=[],w=[],O=[],M=[],g=[];for(let t=0;t<f;t++)g.push({x:a[t*3],y:a[t*3+1],z:a[t*3+2],index:t});const q=[];for(let t=0;t<f;t++)for(let e=t+1;e<f;e++){const s=g[t].x-g[e].x,r=g[t].y-g[e].y,o=g[t].z-g[e].z,n=Math.sqrt(s*s+r*r+o*o);q.push({i:t,j:e,distance:n})}q.sort((t,e)=>t.distance-e.distance);const R=Array(f).fill(-1),z=t=>R[t]===-1?t:R[t]=z(R[t]),dt=(t,e)=>{const s=z(t),r=z(e);s!==r&&(R[s]=r)},et=[],X=new Set;for(const t of q)if(z(t.i)!==z(t.j)){dt(t.i,t.j),et.push(t);const e=t.i,s=t.j,r=e<s?`${e}-${s}`:`${s}-${e}`;X.add(r)}const ht=5,A=Array(f).fill(null).map(()=>[]);for(const t of et){const e=t.i,s=t.j;F.push(a[e*3],a[e*3+1],a[e*3+2]),F.push(a[s*3],a[s*3+1],a[s*3+2]);const r=a[e*3]-a[s*3],o=a[e*3+1]-a[s*3+1],n=a[e*3+2]-a[s*3+2],i=Math.sqrt(r*r+o*o+n*n);S.push(i,i),w.push(0,1),O.push(0,0),M.push(e,s),A[e].push(s),A[s].push(e)}for(let t=0;t<f;t++){const e=g[t],s=g.map((o,n)=>{if(t===n)return{distance:1/0,idx:n};const i=e.x-o.x,d=e.y-o.y,h=e.z-o.z;return{distance:Math.sqrt(i*i+d*d+h*h),idx:n}});s.sort((o,n)=>o.distance-n.distance);const r=s.slice(0,ht);for(const o of r){const n=t,i=o.idx,d=n<i?`${n}-${i}`:`${i}-${n}`;if(!X.has(d)){X.add(d),F.push(a[n*3],a[n*3+1],a[n*3+2]),F.push(a[i*3],a[i*3+1],a[i*3+2]);const h=a[n*3]-a[i*3],L=a[n*3+1]-a[i*3+1],l=a[n*3+2]-a[i*3+2],c=Math.sqrt(h*h+L*L+l*l);S.push(c,c),w.push(0,1),O.push(0,0),M.push(n,i),A[n].push(i),A[i].push(n)}}}const nt=t=>{const e=Array(f).fill(1/0);e[t]=0;const s=[t],r=Array(f).fill(!1);for(r[t]=!0;s.length>0;){const o=s.shift(),n=e[o];for(const i of A[o])r[i]||(r[i]=!0,e[i]=n+1,s.push(i))}_.length=0,B.length=0,w.length=0;for(let o=0;o<M.length;o+=2){const n=M[o],i=M[o+1],d=e[n],h=e[i];d<=h?(_.push(d,d),B.push(h,h),w.push(0,1)):(_.push(h,h),B.push(d,d),w.push(1,0))}return p.setAttribute("startDistance",new x(_,1)),p.setAttribute("endDistance",new x(B,1)),p.setAttribute("lineT",new x(w,1)),{distances:e,maxDistance:Math.max(...e.filter(o=>o!==1/0))}};let{distances:ft,maxDistance:Y}=nt(0);p.setAttribute("position",new x(F,3)),p.setAttribute("lineLength",new x(S,1)),p.setAttribute("pulseFlag",new x(O,1));const pt=`
        varying vec3 vPosition;
        varying float vLineT;
        varying float vStartDistance;
        varying float vEndDistance;
        varying float vLineLength;
        varying float vPulseFlag;
        attribute float lineT;
        attribute float startDistance;
        attribute float endDistance;
        attribute float lineLength;
        attribute float pulseFlag;
        void main() {
          vPosition = position;
          vLineT = lineT;
          vStartDistance = startDistance;
          vEndDistance = endDistance;
          vLineLength = lineLength;
          vPulseFlag = pulseFlag;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,mt=`
        uniform float pulseTime;
        attribute float jerkTime;
        attribute vec3 jerkDirection;
        varying vec3 vPosition;
        varying float vJerkFactor;
        void main() {
          vPosition = position;
          float jerkDuration = 0.2;
          float timeSinceJerk = pulseTime - jerkTime;
          float jerkFactor = smoothstep(0.0, jerkDuration, timeSinceJerk) * smoothstep(jerkDuration, 0.0, timeSinceJerk);
          vJerkFactor = jerkFactor;
          vec3 displacedPosition = position + jerkDirection * jerkFactor * 1.5;
          float pointSize = 8.0 + 16.0 * jerkFactor;
          gl_PointSize = pointSize;
          vPosition = displacedPosition;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
      `,vt=`
        uniform vec3 color;
        uniform float opacity;
        varying vec3 vPosition;
        varying float vJerkFactor;
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          vec3 finalColor = mix(color, vec3(1.0, 1.0, 1.0), vJerkFactor);
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,gt=`
        uniform vec3 color;
        uniform float opacity;
        uniform float pulseTime;
        uniform float pulseSpeed;
        uniform float distanceScale;
        varying vec3 vPosition;
        varying float vLineT;
        varying float vStartDistance;
        varying float vEndDistance;
        varying float vLineLength;
        varying float vPulseFlag;
        void main() {
          if (vStartDistance > 10000.0 || vEndDistance > 10000.0) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            return;
          }
          vec3 baseColor = color;
          float baseOpacity = opacity;
          float highlight = 0.0;
          float pulseDuration = max(vLineLength / pulseSpeed, 0.01);
          float startTime = vStartDistance * distanceScale;
          float endTime = startTime + pulseDuration;
          if (vPulseFlag < 0.5 && pulseTime >= startTime && pulseTime <= endTime) {
            float t = (pulseTime - startTime) / pulseDuration;
            float dist = abs(vLineT - t);
            if (dist < 0.2) {
              highlight = 4.0 * exp(-pow(dist * 10.0, 2.0));
              highlight = min(highlight, 1.0);
            }
          }
          vec3 highlightColor = vec3(1.0, 1.0, 1.0);
          vec3 finalColor = mix(baseColor, highlightColor, highlight);
          float finalOpacity = baseOpacity + highlight * (1.0 - baseOpacity);
          gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `,it=new ct({uniforms:{color:{value:new H(16777215)},opacity:{value:1},pulseTime:{value:0}},vertexShader:mt,fragmentShader:vt,transparent:!0}),b=new ct({uniforms:{color:{value:new H(16777215)},opacity:{value:.2},pulseTime:{value:0},pulseSpeed:{value:20},distanceScale:{value:.3}},vertexShader:pt,fragmentShader:gt,transparent:!0}),yt=new jt(m,it),xt=new Pt(p,b);j.add(yt),j.add(xt);const Mt=new _t(j,P),bt=new zt(new Ft(window.innerWidth,window.innerHeight),3,.5,.7),V=new At(I);V.addPass(Mt),V.addPass(bt);const st=()=>{const t=window.innerWidth,e=window.innerHeight;V.setSize(t,e),I.setSize(t,e)};window.addEventListener("resize",st);let G=Math.max(...S)/b.uniforms.pulseSpeed.value,ot=Y*b.uniforms.distanceScale.value+G+2,y=0,at=0;$.value&&$.value.onTick&&$.value.onTick((t,e)=>{let s=e??t-at;at=t,(isNaN(s)||s<0)&&(s=.016);const r=m.attributes.position.array,o=m.attributes.jerkTime.array,n=m.attributes.jerkDirection.array,i=new Array(f*3).fill(0);for(let l=0;l<f;l++){const c=l*3,u=K[l],v=Math.sin(t*.2+u.x)*Math.cos(t*.1+u.x*.5),k=Math.cos(t*.2+u.y)*Math.sin(t*.1+u.y*.5),C=Math.sin(t*.2+u.z)*Math.cos(t*.1+u.z*.5),D=J[c]+v*1,E=J[c+1]+k*1,W=J[c+2]+C*1,U=y-o[l],Z=.2,T=Math.min(Math.max(U/Z*(1-U/Z),0),1),wt=n[c]*T*1.5,kt=n[c+1]*T*1.5,St=n[c+2]*T*1.5;i[c]=D+wt,i[c+1]=E+kt,i[c+2]=W+St,r[c]=D,r[c+1]=E,r[c+2]=W}m.attributes.position.needsUpdate=!0;const d=p.attributes.position.array,h=p.attributes.pulseFlag.array;let L=!1;for(let l=0;l<M.length/2;l++){const c=M[l*2],u=M[l*2+1],v=l*6;d[v]=i[c*3],d[v+1]=i[c*3+1],d[v+2]=i[c*3+2],d[v+3]=i[u*3],d[v+4]=i[u*3+1],d[v+5]=i[u*3+2];const k=_[l*2],C=S[l*2],D=Math.max(C/b.uniforms.pulseSpeed.value,.01),U=k*b.uniforms.distanceScale.value+D-y;if(U<=s&&U>=-s&&h[l*2]<.5){h[l*2]=1,h[l*2+1]=1;const T=w[l*2]===0?u:c;o[T]<y-.2&&(o[T]=y,L=!0)}}if(p.attributes.position.needsUpdate=!0,p.attributes.pulseFlag.needsUpdate=!0,L&&(m.attributes.jerkTime.needsUpdate=!0),y+=s,y>ot){y=0;const l=Math.floor(Math.random()*f),c=nt(l);ft=c.distances,Y=c.maxDistance,G=Math.max(...S)/b.uniforms.pulseSpeed.value,ot=Y*b.uniforms.distanceScale.value+G+2;for(let u=0;u<h.length;u++)h[u]=0;for(let u=0;u<f;u++){o[u]=-1;const v=Math.random()*2*Math.PI,k=Math.acos(2*Math.random()-1),C=Math.sin(k)*Math.cos(v),D=Math.sin(k)*Math.sin(v),E=Math.cos(k);n[u*3]=C,n[u*3+1]=D,n[u*3+2]=E}p.attributes.pulseFlag.needsUpdate=!0,m.attributes.jerkTime.needsUpdate=!0,m.attributes.jerkDirection.needsUpdate=!0}b.uniforms.pulseTime.value=y,it.uniforms.pulseTime.value=y,V.render()}),P.position.set(0,0,40),N.update(),Bt(()=>{window.removeEventListener("resize",st)})}catch(f){console.error("Scene initialization failed:",f)}})()};return(j,P)=>{const I=Dt,N=Tt;return It(),Et($t,null,[lt(I,{class:"go-back",to:"/"},{default:Ut(()=>P[0]||(P[0]=[Jt("⭠ на главную")])),_:1}),lt(N,{ref_key:"threeContainerRef",ref:$,"camera-position":[0,0,40],far:150,"custom-animation":"",onSceneReady:ut},null,512)],64)}}});export{Yt as default};

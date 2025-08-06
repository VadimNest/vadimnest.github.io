import{_ as T}from"./0mVLCgav.js";import{U as w,R as b,u as A,v as E,w as F,x as I,y as R,z as G,I as O,N as U,J as B,_ as q,C as k,K as D,t as L,O as V,S as Q,h as X,Q as H,W as j,X as W}from"./DFetf91e.js";import{G as J}from"./DNkUmkFf.js";import{P as K,F as $,R as Y,U as Z,E as ee}from"./B8Flzvmy.js";import{m as ne,r as m,c as oe,b as _,a as te,w as ie,F as ae,o as re,d as se,g as le}from"./DEE8E_cv.js";const c={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class ge extends K{constructor(){super(),this.uniforms=w.clone(c.uniforms),this.material=new b({name:c.name,uniforms:this.uniforms,vertexShader:c.vertexShader,fragmentShader:c.fragmentShader}),this._fsQuad=new $(this.material),this._outputColorSpace=null,this._toneMapping=null}render(o,l,g){this.uniforms.tDiffuse.value=g.texture,this.uniforms.toneMappingExposure.value=o.toneMappingExposure,(this._outputColorSpace!==o.outputColorSpace||this._toneMapping!==o.toneMapping)&&(this._outputColorSpace=o.outputColorSpace,this._toneMapping=o.toneMapping,this.material.defines={},A.getTransfer(this._outputColorSpace)===E&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===F?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===I?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===R?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===G?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===O?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===U?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===B&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(o.setRenderTarget(null),this._fsQuad.render(o)):(o.setRenderTarget(l),this.clear&&o.clear(o.autoClearColor,o.autoClearDepth,o.autoClearStencil),this._fsQuad.render(o))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const ue=`  uniform float u_time;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

  float pnoise(vec3 P, vec3 rep) {
    vec3 Pi0 = mod(floor(P), rep);
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));

    float n000 = norm0.x * dot(g000, Pf0);
    float n010 = norm0.y * dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n100 = norm0.z * dot(g100, vec3(Pf1.x, Pf0.yz));
    float n110 = norm0.w * dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = norm1.x * dot(g001, vec3(Pf0.xy, Pf1.z));
    float n011 = norm1.y * dot(g011, vec3(Pf0.x, Pf1.yz));
    float n101 = norm1.z * dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n111 = norm1.w * dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }

  uniform float u_frequency;

  void main() {
    float noise = 1.5 * pnoise(position + u_time, vec3(10.0));
    float displacement = (u_frequency / 30.0) * (noise / 8.0);
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`,ce=`  uniform float u_red;
  uniform float u_green;
  uniform float u_blue;

  void main() {
    gl_FragColor = vec4(vec3(u_red, u_green, u_blue), 1.0);
  }
`,ve=ne({__name:"music",setup(v){const o=m();let l,g;const f=m(null),x=(n,t)=>{n.background=new k(0),t.outputColorSpace=D},h=(n,t,r,a)=>{const i=new Y(n,t),s=new Z(new L(window.innerWidth,window.innerHeight),a.strength,a.radius,a.threshold),e=new ee(r);return e.addPass(i),e.addPass(s),e.addPass(new ge),e.setSize(window.innerWidth,window.innerHeight),{bloomComposer:e,bloomPass:s}},y=(n,t,r)=>{const a=new J,i=a.addFolder("Colors");i.add(n,"red",0,1).onChange(e=>{t.u_red.value=Number(e)}),i.add(n,"green",0,1).onChange(e=>{t.u_green.value=Number(e)}),i.add(n,"blue",0,1).onChange(e=>{t.u_blue.value=Number(e)});const s=a.addFolder("Bloom");return s.add(n,"threshold",0,1).onChange(e=>{r.threshold=Number(e)}),s.add(n,"radiusMultiplier",0,2).onChange(e=>{n.radiusMultiplier=Number(e)}),s.add(n,"strengthMultiplier",0,3).onChange(e=>{n.strengthMultiplier=Number(e)}),a},P=(n,t)=>{const r=new V(4,30),a=new Q({uniforms:t,vertexShader:ue,fragmentShader:ce}),i=new X(r,a);i.material.wireframe=!0,n.add(i)},M=(n,t)=>(l=new H,n.add(l),g=new j(l),g.setMediaElementSource(t),new W(g,32)),p=async()=>{!l||!g||(l.context.state==="suspended"&&await l.context.resume(),g.isPlaying||g.play())},C=({scene:n,camera:t,renderer:r})=>{(async()=>{try{const i=f.value;if(!i)return;const s={red:.226,green:.484,blue:1,threshold:.336,strength:.714,radius:1,radiusMultiplier:1,strengthMultiplier:1.5},e={u_time:{type:"f",value:0},u_frequency:{type:"f",value:0},u_red:{type:"f",value:.226},u_green:{type:"f",value:.484},u_blue:{type:"f",value:1}};x(n,r);const{bloomComposer:z,bloomPass:d}=h(n,t,r,s),N=y(s,e,d);P(n,e);const u=M(t,i);o.value&&o.value.onTick(S=>{e.u_time.value=S,e.u_frequency.value=u.getAverageFrequency(),d.radius=u.getAverageFrequency()/255*s.radiusMultiplier,d.strength=u.getAverageFrequency()/255*s.strengthMultiplier,z.render()}),le(()=>{N.destroy(),u.analyser.disconnect()})}catch(i){console.error("Scene initialization failed:",i)}})()};return(n,t)=>{const r=T,a=q;return re(),oe(ae,null,[_(r,{class:"go-back",to:"/"},{default:ie(()=>t[0]||(t[0]=[se("⭠ на главную")])),_:1}),te("audio",{class:"music__control",ref_key:"audioElementRef",ref:f,controls:"",src:"./media/tequila.mp3",onPlay:p,onClick:p},null,544),_(a,{ref_key:"threeContainerRef",ref:o,"camera-position":[0,0,20],far:150,"custom-animation":"","disable-default-render":"",onSceneReady:C},null,512)],64)}}});export{ve as default};

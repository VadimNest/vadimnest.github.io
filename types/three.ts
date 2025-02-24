import type { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { MapControls } from 'three/examples/jsm/controls/MapControls.js';

type IControls = OrbitControls | MapControls;

export interface IThreeContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: IControls;
}

export interface ICameraOptions {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: [number, number, number];
  enableDamping?: boolean;
}

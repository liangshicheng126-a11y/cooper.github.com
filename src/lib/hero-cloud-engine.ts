import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { HERO_CLOUD_TUNNEL_DEPTH, heroCloudCountForTier } from "@/lib/hero-clouds";
import type { MotionTier } from "@/hooks/useMotionTier";

export type HeroCloudEngineOptions = {
  container: HTMLElement;
  tier: MotionTier;
  mouseEnabled: boolean;
  onScrollOpacity?: (opacity: number) => void;
};

export type HeroCloudEngine = {
  dispose: () => void;
  setScrollOffset: (scrollY: number) => void;
  setHeroProgress: (progress: number) => void;
};

const FOG_COLOR = 0x6366f1;
const FOG_NEAR = -80;
const FOG_FAR = 2800;

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D map;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uMouseStrength;

varying vec2 vUv;

void main() {
  vec2 screenPos = gl_FragCoord.xy;
  float mouseDist = length(screenPos - uMouse);
  float push = smoothstep(uMouseRadius, uMouseRadius * 0.12, mouseDist);

  vec2 toFrag = screenPos - uMouse;
  vec2 uvPush = vec2(0.0);
  if (uMouseStrength > 0.0 && mouseDist > 0.001) {
    uvPush = normalize(toFrag) * (1.0 - push) * uMouseStrength * 0.12;
  }

  vec4 sampled = texture2D(map, vUv + uvPush);
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep(fogNear, fogFar, depth);

  gl_FragColor = sampled;
  gl_FragColor.a *= pow(gl_FragCoord.z, 18.0);
  gl_FragColor.a *= mix(0.08, 1.0, push);
  gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.a), fogFactor);
}
`;

function createCloudTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.92)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function buildCloudMesh(
  cloudCount: number,
  material: THREE.ShaderMaterial,
  depth: number
): THREE.Mesh {
  const group = new THREE.Group();

  for (let i = 0; i < cloudCount; i += 1) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64));
    plane.position.x = Math.random() * 1000 - 500;
    plane.position.y = -Math.random() * Math.random() * 200 - 30;
    plane.position.z = i * (depth / cloudCount);
    plane.rotation.z = Math.random() * Math.PI;
    const scale = Math.random() * Math.random() * 1.5 + 0.5;
    plane.scale.set(scale, scale, 1);
    plane.updateMatrix();
    group.add(plane);
  }

  const geometries: THREE.BufferGeometry[] = [];
  const meshes: THREE.Mesh[] = [];

  group.updateMatrixWorld(true);
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
      const geometry = child.geometry.index
        ? child.geometry.toNonIndexed()
        : child.geometry.clone();
      geometry.applyMatrix4(child.matrixWorld);
      geometries.push(geometry);
    }
  });

  const merged = mergeGeometries(geometries, false);
  if (!merged) throw new Error("Failed to merge cloud geometries");

  geometries.forEach((g) => g.dispose());
  merged.userData.materials = meshes.map((m) => m.material);

  return new THREE.Mesh(merged, material);
}

export function createHeroCloudEngine(options: HeroCloudEngineOptions): HeroCloudEngine {
  const { container, tier, mouseEnabled } = options;
  const cloudCount = heroCloudCountForTier(tier);
  if (cloudCount === 0) throw new Error("heroCloudCountForTier returned 0 for active tier");
  const depth = HERO_CLOUD_TUNNEL_DEPTH;

  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z = 6000;
  camera.position.y = 30;

  const scene = new THREE.Scene();
  const fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
  scene.fog = fog;

  const texture = createCloudTexture();

  const mouseStrength = mouseEnabled ? (tier === "full" ? 1 : 0.55) : 0;
  const mouseRadius = tier === "full" ? 220 : 160;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far },
      uMouse: { value: new THREE.Vector2(-9999, -9999) },
      uMouseRadius: { value: mouseRadius },
      uMouseStrength: { value: mouseStrength },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    depthWrite: false,
    depthTest: false,
    transparent: true,
  });

  const tunnel = buildCloudMesh(cloudCount, material, depth);
  scene.add(tunnel);

  const tunnelLoop = buildCloudMesh(cloudCount, material, depth);
  tunnelLoop.position.z = -depth;
  scene.add(tunnelLoop);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === "full" ? 2 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.className = "hero-cloud-canvas";
  container.appendChild(renderer.domElement);

  const clockStart = performance.now();
  let scrollY = 0;
  let heroProgress = 1;
  let targetMouse = new THREE.Vector2(-9999, -9999);
  let smoothMouse = new THREE.Vector2(-9999, -9999);
  let rafId = 0;
  let disposed = false;

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!mouseEnabled) return;
    targetMouse.set(event.clientX, window.innerHeight - event.clientY);
  };

  const onPointerLeave = () => {
    targetMouse.set(-9999, -9999);
  };

  const render = () => {
    if (disposed) return;
    rafId = requestAnimationFrame(render);

    const elapsed = (performance.now() - clockStart) * 0.03;
    const loop = elapsed % depth;
    camera.position.z = depth - loop;

    camera.position.y = 30 - scrollY * 0.018;

    const fadeIn = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(camera.position.y, 25, 15, 0, 1), 0, 1);
    const fadeOut = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(camera.position.y, 0, -30, 1, 0), 0, 1);
    const scrollOpacity = camera.position.y > 25 ? 0 : camera.position.y < 0 ? fadeOut : fadeIn;
    const opacity = scrollOpacity * heroProgress;

    container.style.opacity = String(opacity);
    options.onScrollOpacity?.(opacity);

    smoothMouse.lerp(targetMouse, mouseEnabled ? 0.12 : 1);
    material.uniforms.uMouse.value.copy(smoothMouse);

    renderer.render(scene, camera);
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave);

  render();

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);

      tunnel.geometry.dispose();
      tunnelLoop.geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
    setScrollOffset(y: number) {
      scrollY = y;
    },
    setHeroProgress(progress: number) {
      heroProgress = THREE.MathUtils.clamp(progress, 0, 1);
    },
  };
}

"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import {
  Clock,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

// Adapted from React Bits Floating Lines (TS + Tailwind variant).
// https://github.com/DavidHDev/react-bits
const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE = vec3(47.0, 75.0, 162.0) / 255.0;

mat2 rotate(float radians) {
  return mat2(cos(radians), sin(radians), -sin(radians), cos(radians));
}

vec3 backgroundColor(vec2 uv) {
  vec3 color = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float magnitude = uv.y - y;

  color += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(magnitude)));
  color += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(magnitude - 0.8)));
  return color * 0.5;
}

vec3 getLineColor(float position, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;

  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedPosition = clamp(position, 0.0, 0.9999);
    float scaled = clampedPosition * float(lineGradientCount - 1);
    int firstIndex = int(floor(scaled));
    float mixAmount = fract(scaled);
    int secondIndex = min(firstIndex + 1, lineGradientCount - 1);
    gradientColor = mix(lineGradient[firstIndex], lineGradient[secondIndex], mixAmount);
  }

  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float xMovement = time * 0.1;
  float amplitude = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + offset + xMovement) * amplitude;

  if (shouldBend) {
    vec2 delta = screenUv - mouseUv;
    float influence = exp(-dot(delta, delta) * bendRadius);
    y += (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
  }

  float magnitude = uv.y - y;
  return 0.0175 / max(abs(magnitude) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragmentColor, in vec2 fragmentCoordinate) {
  vec2 baseUv = (2.0 * fragmentCoordinate - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 color = vec3(0.0);
  vec3 baseColor = lineGradientCount > 0 ? vec3(0.0) : backgroundColor(baseUv);
  vec2 mouseUv = vec2(0.0);

  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int index = 0; index < bottomLineCount; ++index) {
      float lineIndex = float(index);
      float position = lineIndex / max(float(bottomLineCount - 1), 1.0);
      vec3 lineColor = getLineColor(position, baseColor);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 rotatedUv = baseUv * rotate(angle);

      color += lineColor * wave(
        rotatedUv + vec2(bottomLineDistance * lineIndex + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * lineIndex,
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int index = 0; index < middleLineCount; ++index) {
      float lineIndex = float(index);
      float position = lineIndex / max(float(middleLineCount - 1), 1.0);
      vec3 lineColor = getLineColor(position, baseColor);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 rotatedUv = baseUv * rotate(angle);

      color += lineColor * wave(
        rotatedUv + vec2(middleLineDistance * lineIndex + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * lineIndex,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  if (enableTop) {
    for (int index = 0; index < topLineCount; ++index) {
      float lineIndex = float(index);
      float position = lineIndex / max(float(topLineCount - 1), 1.0);
      vec3 lineColor = getLineColor(position, baseColor);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 rotatedUv = baseUv * rotate(angle);
      rotatedUv.x *= -1.0;

      color += lineColor * wave(
        rotatedUv + vec2(topLineDistance * lineIndex + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * lineIndex,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;
    }
  }

  fragmentColor = vec4(color, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;
const DEFAULT_WAVES: WaveType[] = ["top", "middle", "bottom"];
const DEFAULT_LINE_COUNT = [6];
const DEFAULT_LINE_DISTANCE = [5];

type WaveType = "top" | "middle" | "bottom";

type WavePosition = {
  x: number;
  y: number;
  rotate: number;
};

type FloatingLinesProps = {
  linesGradient?: string[];
  enabledWaves?: WaveType[];
  lineCount?: number | number[];
  lineDistance?: number | number[];
  topWavePosition?: WavePosition;
  middleWavePosition?: WavePosition;
  bottomWavePosition?: WavePosition;
  animationSpeed?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  mixBlendMode?: CSSProperties["mixBlendMode"];
};

function hexToVector(hex: string): Vector3 {
  const value = hex.trim().replace(/^#/, "");
  const normalized = value.length === 3
    ? value.split("").map((character) => character + character).join("")
    : value;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return new Vector3(1, 1, 1);
  }

  return new Vector3(
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255,
  );
}

export default function FloatingLines({
  linesGradient,
  enabledWaves = DEFAULT_WAVES,
  lineCount = DEFAULT_LINE_COUNT,
  lineDistance = DEFAULT_LINE_DISTANCE,
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = { x: 2, y: -0.7, rotate: -1 },
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = "screen",
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetMouseRef = useRef(new Vector2(-1000, -1000));
  const currentMouseRef = useRef(new Vector2(-1000, -1000));
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef(new Vector2(0, 0));
  const currentParallaxRef = useRef(new Vector2(0, 0));
  const reducedMotion = usePrefersReducedMotion();

  const countFor = (waveType: WaveType) => {
    if (typeof lineCount === "number") return lineCount;
    const index = enabledWaves.indexOf(waveType);
    return index === -1 ? 0 : (lineCount[index] ?? 6);
  };

  const distanceFor = (waveType: WaveType) => {
    if (typeof lineDistance === "number") return lineDistance;
    const index = enabledWaves.indexOf(waveType);
    return index === -1 ? 0.1 : (lineDistance[index] ?? 0.1);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = true;
    let renderer: WebGLRenderer;

    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      container.dataset.webglFallback = "true";
      return;
    }

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const pixelRatioLimit = window.innerWidth <= 640 ? 1.25 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioLimit));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const topLineCount = enabledWaves.includes("top") ? countFor("top") : 0;
    const middleLineCount = enabledWaves.includes("middle") ? countFor("middle") : 0;
    const bottomLineCount = enabledWaves.includes("bottom") ? countFor("bottom") : 0;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: animationSpeed },
      enableTop: { value: enabledWaves.includes("top") },
      enableMiddle: { value: enabledWaves.includes("middle") },
      enableBottom: { value: enabledWaves.includes("bottom") },
      topLineCount: { value: topLineCount },
      middleLineCount: { value: middleLineCount },
      bottomLineCount: { value: bottomLineCount },
      topLineDistance: { value: distanceFor("top") * 0.01 },
      middleLineDistance: { value: distanceFor("middle") * 0.01 },
      bottomLineDistance: { value: distanceFor("bottom") * 0.01 },
      topWavePosition: {
        value: new Vector3(
          topWavePosition?.x ?? 10,
          topWavePosition?.y ?? 0.5,
          topWavePosition?.rotate ?? -0.4,
        ),
      },
      middleWavePosition: {
        value: new Vector3(
          middleWavePosition?.x ?? 5,
          middleWavePosition?.y ?? 0,
          middleWavePosition?.rotate ?? 0.2,
        ),
      },
      bottomWavePosition: {
        value: new Vector3(
          bottomWavePosition.x,
          bottomWavePosition.y,
          bottomWavePosition.rotate,
        ),
      },
      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: interactive },
      bendRadius: { value: bendRadius },
      bendStrength: { value: bendStrength },
      bendInfluence: { value: 0 },
      parallax: { value: parallax && !reducedMotion },
      parallaxOffset: { value: new Vector2(0, 0) },
      lineGradient: {
        value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1)),
      },
      lineGradientCount: { value: 0 },
    };

    if (linesGradient?.length) {
      const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
      uniforms.lineGradientCount.value = stops.length;
      stops.forEach((hex, index) => {
        uniforms.lineGradient.value[index].copy(hexToVector(hex));
      });
    }

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const geometry = new PlaneGeometry(2, 2);
    scene.add(new Mesh(geometry, material));

    const setSize = () => {
      if (!active) return;
      renderer.setSize(container.clientWidth || 1, container.clientHeight || 1, false);
      uniforms.iResolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
        1,
      );
    };

    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (interactive) {
        const devicePixelRatio = renderer.getPixelRatio();
        targetMouseRef.current.set(x * devicePixelRatio, (rect.height - y) * devicePixelRatio);
        targetInfluenceRef.current = 1;
      }

      if (parallax && !reducedMotion) {
        targetParallaxRef.current.set(
          ((x - rect.width / 2) / rect.width) * parallaxStrength,
          (-(y - rect.height / 2) / rect.height) * parallaxStrength,
        );
      }
    };

    const handlePointerLeave = () => {
      targetInfluenceRef.current = 0;
      targetParallaxRef.current.set(0, 0);
    };

    if ((interactive || parallax) && !reducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("blur", handlePointerLeave);
    }

    const clock = new Clock();
    let animationFrame = 0;
    const render = () => {
      if (!active) return;

      uniforms.iTime.value = reducedMotion ? 0 : clock.getElapsedTime();

      if (interactive) {
        currentMouseRef.current.lerp(targetMouseRef.current, mouseDamping);
        uniforms.iMouse.value.copy(currentMouseRef.current);
        currentInfluenceRef.current +=
          (targetInfluenceRef.current - currentInfluenceRef.current) * mouseDamping;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }

      if (parallax && !reducedMotion) {
        currentParallaxRef.current.lerp(targetParallaxRef.current, mouseDamping);
        uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      }

      if (!document.hidden || reducedMotion) {
        renderer.render(scene, camera);
      }

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [
    animationSpeed,
    bendRadius,
    bendStrength,
    bottomWavePosition,
    enabledWaves,
    interactive,
    lineCount,
    lineDistance,
    linesGradient,
    middleWavePosition,
    mouseDamping,
    parallax,
    parallaxStrength,
    reducedMotion,
    topWavePosition,
  ]);

  return (
    <div
      ref={containerRef}
      className="floating-lines-container relative h-full w-full overflow-hidden"
      style={{ mixBlendMode }}
    />
  );
}

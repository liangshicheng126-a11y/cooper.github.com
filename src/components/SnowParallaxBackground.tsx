"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function MountainRange({ targetYaw, depthOffset }: { targetYaw: number; depthOffset: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const mountainData = useMemo(
    () => [
      { x: -8, z: -14, h: 7, r: 2.9, color: "#667184" },
      { x: -3, z: -11, h: 8.5, r: 3.2, color: "#6f7d93" },
      { x: 2, z: -13, h: 9.2, r: 3.5, color: "#70839a" },
      { x: 7, z: -15, h: 7.2, r: 2.8, color: "#627186" },
      { x: -11, z: -20, h: 9, r: 3.6, color: "#5a687c" },
      { x: -1, z: -22, h: 10.2, r: 4.1, color: "#63748a" },
      { x: 10, z: -20, h: 8.6, r: 3.4, color: "#5a697f" },
    ],
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetX = 0.06 + depthOffset;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetYaw, 2.2, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetX, 2.2, delta);
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, depthOffset * 8, 2.2, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, -0.4 + depthOffset * 1.6, 2.2, delta);
    const t = state.clock.elapsedTime;
    groupRef.current.position.x = Math.sin(t * 0.08) * 0.18;
  });

  return (
    <group ref={groupRef}>
      {mountainData.map((m, i) => (
        <group key={`${m.x}-${m.z}-${i}`} position={[m.x, m.h * 0.5 - 2.8, m.z]}>
          <mesh castShadow receiveShadow>
            <coneGeometry args={[m.r, m.h, 10]} />
            <meshStandardMaterial color={m.color} roughness={0.95} metalness={0.03} />
          </mesh>
          <mesh position={[0, m.h * 0.24, 0]}>
            <coneGeometry args={[m.r * 0.42, m.h * 0.45, 10]} />
            <meshStandardMaterial color="#f5f8ff" roughness={0.6} metalness={0.02} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.85, -16]} receiveShadow>
        <planeGeometry args={[60, 60, 1, 1]} />
        <meshStandardMaterial color="#edf2fb" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

export default function SnowParallaxBackground() {
  const pathname = usePathname();
  const [targetYaw, setTargetYaw] = useState(-0.08);
  const [depthOffset, setDepthOffset] = useState(0);

  useEffect(() => {
    const routeBaseYaw =
      pathname === "/about" ? 0.26 : pathname === "/portfolio" ? -0.22 : pathname.startsWith("/portfolio/") ? -0.15 : -0.08;

    const syncFromScroll = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = window.scrollY / maxScroll;

      let anchoredYaw = routeBaseYaw + (progress - 0.5) * 0.12;
      let anchoredDepth = (progress - 0.5) * 0.08;

      if (pathname === "/") {
        const services = document.getElementById("services-block");
        const featured = document.getElementById("featured-block");

        if (services) {
          const r = services.getBoundingClientRect();
          const center = r.top + r.height * 0.5;
          const vp = window.innerHeight * 0.5;
          const influence = 1 - Math.min(1, Math.abs(center - vp) / (window.innerHeight * 0.65));
          anchoredYaw += influence * 0.12;
          anchoredDepth -= influence * 0.03;
        }

        if (featured) {
          const r = featured.getBoundingClientRect();
          const center = r.top + r.height * 0.5;
          const vp = window.innerHeight * 0.5;
          const influence = 1 - Math.min(1, Math.abs(center - vp) / (window.innerHeight * 0.7));
          anchoredYaw -= influence * 0.18;
          anchoredDepth += influence * 0.06;
        }
      }

      setTargetYaw(anchoredYaw);
      setDepthOffset(anchoredDepth);
    };

    syncFromScroll();
    window.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll);
    return () => {
      window.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
    };
  }, [pathname]);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 2.2, 7], fov: 46 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#f4f7fd"]} />
        <fog attach="fog" args={["#e9eef8", 9, 34]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 9, 5]} intensity={1.15} />
        <directionalLight position={[-7, 5, -8]} intensity={0.35} />
        <MountainRange targetYaw={targetYaw} depthOffset={depthOffset} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-white/35" />
    </div>
  );
}


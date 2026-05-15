'use client';

import { useRef, useMemo, RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, MeshReflectorMaterial, Stars, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, N8AO, ChromaticAberration, HueSaturation, BrightnessContrast } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import ProceduralWheel from './ProceduralWheel';

interface ExperienceProps {
  scrollRef: RefObject<{ progress: number; velocity: number }>;
}

/* ─── Camera Rig — scroll-driven flythrough ─── */
function CameraRig({ scrollRef }: { scrollRef: RefObject<{ progress: number; velocity: number }> }) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0.8, 20));
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

  const positionCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.8, 20),
    new THREE.Vector3(0, 0.5, 14),
    new THREE.Vector3(0, 0.2, 8),
    new THREE.Vector3(0, 0, 4),
    new THREE.Vector3(0, 0, 1.5),
    new THREE.Vector3(0, 0, 0.3),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -0.3),
    new THREE.Vector3(0, 0, -2),
    new THREE.Vector3(0, 0.5, -6),
    new THREE.Vector3(0, 1.5, -12),
    new THREE.Vector3(0, 2, -18),
    new THREE.Vector3(2, 3, -22),
    new THREE.Vector3(0, 5, -20),
    new THREE.Vector3(0, 8, -16),
    new THREE.Vector3(0, 12, -12),
  ], false, 'catmullrom', 0.3), []);

  const targetCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -0.5),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 0, -2),
    new THREE.Vector3(0, 0, -4),
    new THREE.Vector3(0, 0, -8),
    new THREE.Vector3(0, 0, -14),
    new THREE.Vector3(0, 0, -20),
    new THREE.Vector3(0, 0, -24),
    new THREE.Vector3(0, 0, -26),
    new THREE.Vector3(0, 0, -24),
    new THREE.Vector3(0, 0, -22),
    new THREE.Vector3(0, 0, -20),
  ], false, 'catmullrom', 0.3), []);

  useFrame(() => {
    if (!scrollRef.current) return;
    const p = Math.max(0, Math.min(1, scrollRef.current.progress));
    currentPos.current.lerp(positionCurve.getPoint(p), 0.05);
    currentTarget.current.lerp(targetCurve.getPoint(p), 0.05);
    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}

/* ─── Bearing Glow ─── */
function BearingGlow({ scrollRef }: { scrollRef: RefObject<{ progress: number; velocity: number }> }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current || !scrollRef.current) return;
    const af = Math.max(0, 1 - Math.abs(scrollRef.current.progress - 0.32) / 0.15);
    (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + af * 1.5;
    if (glowRef.current) (glowRef.current.material as THREE.MeshBasicMaterial).opacity = af * 0.12;
    if (lightRef.current) lightRef.current.intensity = af * 2.5;
    if (outerRef.current) {
      (outerRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + af * 0.6;
      outerRef.current.rotation.z += 0.003;
    }
    const pulse = Math.sin(clock.elapsedTime * 2.5) * 0.04 + 1;
    ringRef.current.scale.set(pulse, pulse, 1);
  });

  return (
    <group>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.35, 0.015, 16, 96]} />
        <meshStandardMaterial color="#00C2FF" emissive="#00C2FF" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
      <mesh ref={outerRef}>
        <torusGeometry args={[0.52, 0.006, 8, 96]} />
        <meshStandardMaterial color="#00C2FF" emissive="#00C2FF" emissiveIntensity={0.15} transparent opacity={0.4} />
      </mesh>
      <mesh ref={glowRef}>
        <ringGeometry args={[0.05, 0.7, 96]} />
        <meshBasicMaterial color="#00C2FF" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight ref={lightRef} color="#00C2FF" intensity={0} distance={8} decay={2} />
    </group>
  );
}

/* ─── Flash when passing through bearing ─── */
function BearingFlash({ scrollRef }: { scrollRef: RefObject<{ progress: number; velocity: number }> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current || !scrollRef.current) return;
    const i = Math.max(0, 1 - Math.abs(scrollRef.current.progress - 0.35) / 0.02);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = i * 0.35;
    ref.current.visible = i > 0.01;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial color="#00C2FF" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

const STREAK_COUNT = 1000;
const [STREAK_POSITIONS, STREAK_VELOCITIES] = (() => {
  const p = new Float32Array(STREAK_COUNT * 2 * 3);
  const v = new Float32Array(STREAK_COUNT);
  for (let i = 0; i < STREAK_COUNT; i++) {
    // Distribute streaks in a wide cylinder around the center so they don't block the wheel
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 40 + 8; // Keep away from center
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = (Math.random() - 0.5) * 200 - 50;
    const length = Math.random() * 12 + 4; // Long streaks
    
    p[i * 6] = x;
    p[i * 6 + 1] = y;
    p[i * 6 + 2] = z;
    
    p[i * 6 + 3] = x;
    p[i * 6 + 4] = y;
    p[i * 6 + 5] = z - length;
    
    v[i] = Math.random() * 100 + 50; // Fast varying speeds
  }
  return [p, v];
})();

/* ─── Dynamic Speed Streaks ─── */
function SpeedStreaks() {
  const ref = useRef<THREE.LineSegments>(null);



  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < STREAK_COUNT; i++) {
      let z1 = pos.array[i * 6 + 2] as number;
      let z2 = pos.array[i * 6 + 5] as number;
      
      const speed = STREAK_VELOCITIES[i] * delta;
      z1 += speed;
      z2 += speed;
      
      if (z2 > 40) { // Wrap around when past camera
        const length = z1 - z2;
        z2 = -150;
        z1 = z2 + length;
      }
      
      pos.array[i * 6 + 2] = z1;
      pos.array[i * 6 + 5] = z2;
    }
    pos.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute 
        attach="attributes-position" 
        args={[STREAK_POSITIONS, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#00ff88" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

/* ─── Rink Environment ─── */
function RinkEnvironment() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state, delta) => {
    if (gridRef.current) {
      // Move grid continuously towards camera to simulate speed
      // 100 size / 100 divisions = 1 unit per cell. Modulo 1 keeps it seamless.
      gridRef.current.position.z = (state.clock.elapsedTime * 20) % 1;
    }
  });

  return (
    <group position={[0, 0, -20]}>
      {/* Subdued digital grid */}
      <gridHelper ref={gridRef} args={[100, 100, '#005588', '#021118']} position={[0, 0.01, 0]} />
      {[-18, 18].map(x => (
        <mesh key={x} position={[x, 3, 0]}>
          <boxGeometry args={[0.2, 6, 40]} />
          <meshStandardMaterial color="#0e0e18" roughness={0.85} metalness={0.15} />
        </mesh>
      ))}
      {[-18, 18].map(x => (
        <mesh key={`n-${x}`} position={[x, 0.3, 0]}>
          <boxGeometry args={[0.05, 0.05, 40]} />
          <meshBasicMaterial color="#00C2FF" />
        </mesh>
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={i} position={[0, 5.5, -12 + i * 8]}>
          <mesh>
            <boxGeometry args={[12, 0.1, 0.3]} />
            <meshBasicMaterial color="#F0F4FF" />
          </mesh>
          <pointLight position={[0, -0.5, 0]} color="#F0F4FF" intensity={8} distance={15} decay={2} />
        </group>
      ))}
      <pointLight position={[-16, 1, -16]} color="#00C2FF" intensity={5} distance={20} />
      <pointLight position={[16, 1, -16]} color="#00C2FF" intensity={5} distance={20} />
    </group>
  );
}

/* ─── Shadow Floor ─── */
function ShadowFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#040408" roughness={0.95} metalness={0.05} transparent opacity={0.5} />
      </mesh>
      {/* Contact shadows for soft ground shadows */}
      <ContactShadows
        position={[0, -5.9, 0]}
        opacity={0.4}
        scale={20}
        blur={2.5}
        far={8}
        color="#000008"
      />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Main Experience
   ═══════════════════════════════════════════════ */
export default function Experience({ scrollRef }: ExperienceProps) {
  return (
    <>
      <CameraRig scrollRef={scrollRef} />

      {/* ── Environment Map — clean studio reflections ── */}
      <Environment preset="studio" background={false} />

      {/* ── Cinematic Lighting Rig — cool tones ── */}
      <hemisphereLight args={['#1a2e50', '#001510', 0.55]} />

      {/* Key light — cool white from upper-right */}
      <directionalLight
        position={[6, 10, 8]}
        intensity={3.2}
        color="#e8f0ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Fill light — icy cyan from left */}
      <directionalLight position={[-8, -2, 3]} intensity={0.6} color="#1855cc" />

      {/* Rim light — neon green accent from below-back */}
      <directionalLight position={[0, -10, -6]} intensity={0.5} color="#00ff66" />

      {/* Top-back — cool blue edge from behind */}
      <directionalLight position={[3, 5, -8]} intensity={0.35} color="#4488ff" />

      {/* Low accent — subtle cyan floor bounce */}
      <directionalLight position={[0, -8, 4]} intensity={0.15} color="#00ccff" />

      {/* ── Procedural Wheel ── */}
      <ProceduralWheel scrollRef={scrollRef} />

      {/* ── Bearing effects ── */}
      <BearingGlow scrollRef={scrollRef} />
      <BearingFlash scrollRef={scrollRef} />

      {/* ── Scene depth & speed ── */}
      <ShadowFloor />
      <SpeedStreaks />
      <Stars radius={60} depth={100} count={2000} factor={4} saturation={0} fade speed={2} />
      <RinkEnvironment />

      {/* ── Atmospheric fog — slightly blue-tinted ── */}
      <fogExp2 attach="fog" args={['#040812', 0.032]} />

      {/* ── Cinematic Post-Processing Chain ── */}
      <EffectComposer multisampling={8}>
        {/* Bloom — punchy glow on specular highlights, green edges, bearing chrome */}
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={0.3}
          intensity={0.8}
          mipmapBlur
          radius={0.7}
        />
        {/* Ambient occlusion — deep shadows in crevices and hub holes */}
        <N8AO
          aoRadius={0.9}
          intensity={3.0}
          distanceFalloff={0.5}
        />
        {/* Chromatic aberration — cinematic lens distortion */}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006)}
        />
        {/* Color grading — cool, saturated, high contrast */}
        <HueSaturation
          blendFunction={BlendFunction.NORMAL}
          saturation={0.2}
          hue={-0.02}
        />
        <BrightnessContrast
          brightness={0.0}
          contrast={0.18}
        />
        {/* Vignette — dramatic darkened edges */}
        <Vignette eskil={false} offset={0.15} darkness={0.65} />
      </EffectComposer>
    </>
  );
}

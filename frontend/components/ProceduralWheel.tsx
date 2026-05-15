'use client';

import { useRef, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   PHOTOREALISTIC PROCEDURAL INLINE SKATE WHEEL
   Cinematic-grade materials with subsurface
   scattering, iridescence, and clearcoat.
   ═══════════════════════════════════════════════ */

/* ── Urethane Tyre ── */
function UrethaneTyre() {
  const tyreRef = useRef<THREE.Mesh>(null);

  // Animate a subtle inner glow pulse on the tyre
  useFrame(({ clock }) => {
    if (!tyreRef.current) return;
    const mat = tyreRef.current.material as THREE.MeshPhysicalMaterial;
    const t = clock.elapsedTime;
    // Breathing emissive glow — gives the urethane a living, premium feel
    mat.emissiveIntensity = 0.06 + Math.sin(t * 1.2) * 0.03;
  });

  return (
    <group>
      {/* Main tyre body — premium translucent urethane */}
      <mesh ref={tyreRef} castShadow receiveShadow>
        <torusGeometry args={[1.50, 0.42, 96, 256]} />
        <meshPhysicalMaterial
          color="#081e22"
          roughness={0.10}
          metalness={0.0}
          transparent
          opacity={0.88}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          envMapIntensity={2.2}
          side={THREE.DoubleSide}
          transmission={0.18}
          thickness={2.2}
          ior={1.45}
          emissive="#041113"
          emissiveIntensity={0.06}
          sheen={0.35}
          sheenRoughness={0.35}
          sheenColor="#0a2e33"
          attenuationColor="#020a0b"
          attenuationDistance={2.5}
        />
      </mesh>

      {/* Inner tyre lip ring — darker edge for depth */}
      <mesh castShadow>
        <torusGeometry args={[1.10, 0.04, 32, 128]} />
        <meshPhysicalMaterial
          color="#030e10"
          roughness={0.2}
          metalness={0.0}
          transparent
          opacity={0.7}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Outer tyre lip ring — brighter highlight ring */}
      <mesh>
        <torusGeometry args={[1.92, 0.015, 16, 128]} />
        <meshPhysicalMaterial
          color="#44ff77"
          roughness={0.1}
          metalness={0.0}
          transparent
          opacity={0.5}
          emissive="#22ff55"
          emissiveIntensity={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Tread pattern — subtle circumferential grooves */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i / 36) * Math.PI * 2;
        return (
          <mesh key={i}
                position={[Math.cos(angle) * 1.50, Math.sin(angle) * 1.50, 0]}
                rotation={[0, 0, angle + Math.PI / 2]} castShadow>
            <boxGeometry args={[0.04, 0.85, 0.015]} />
            <meshPhysicalMaterial
              color="#10c838"
              roughness={0.35}
              metalness={0}
              transparent
              opacity={0.4}
              clearcoat={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Hub with Oval Holes ── */
function Hub() {
  const holeCount = 6;
  return (
    <group>
      {/* Hub disc — front face */}
      <mesh position={[0, 0, 0.06]} castShadow receiveShadow>
        <ringGeometry args={[0.48, 1.08, 96]} />
        <meshPhysicalMaterial
          color="#05080c"
          roughness={0.4}
          metalness={0.9}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
          clearcoat={0.1}
          clearcoatRoughness={0.2}
          iridescence={0.05}
          iridescenceIOR={1.3}
        />
      </mesh>
      {/* Hub disc — back face */}
      <mesh position={[0, 0, -0.06]} castShadow receiveShadow>
        <ringGeometry args={[0.48, 1.08, 96]} />
        <meshPhysicalMaterial
          color="#04070a"
          roughness={0.4}
          metalness={0.9}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
          clearcoat={0.1}
          clearcoatRoughness={0.2}
          iridescence={0.05}
          iridescenceIOR={1.3}
        />
      </mesh>
      {/* Hub rim cylinder */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.08, 1.08, 0.12, 96, 1, true]} />
        <meshPhysicalMaterial
          color="#040608"
          roughness={0.3}
          metalness={0.95}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
          clearcoat={0.1}
          clearcoatRoughness={0.2}
        />
      </mesh>
      {/* Inner hub cylinder */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.12, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#030507"
          roughness={0.3}
          metalness={0.95}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
          clearcoat={0.1}
          clearcoatRoughness={0.2}
        />
      </mesh>
      {/* Spokes + holes */}
      {Array.from({ length: holeCount }).map((_, i) => {
        const angle = (i / holeCount) * Math.PI * 2;
        const cx = Math.cos(angle) * 0.78;
        const cy = Math.sin(angle) * 0.78;
        return (
          <group key={i}>
            {/* Spoke — brushed metal */}
            <mesh position={[cx * 0.72, cy * 0.72, 0]} rotation={[0, 0, angle]} castShadow>
              <boxGeometry args={[0.08, 0.50, 0.11]} />
              <meshPhysicalMaterial
                color="#06090d"
                roughness={0.35}
                metalness={0.9}
                envMapIntensity={1.2}
                clearcoat={0.05}
              />
            </mesh>
            {/* Oval hole voids — deep matte black with subtle depth */}
            {[0.066, -0.066].map((z) => (
              <mesh key={z} position={[cx, cy, z]} rotation={[0, 0, angle]}>
                <planeGeometry args={[0.30, 0.18]} />
                <meshStandardMaterial
                  color="#050508"
                  roughness={1.0}
                  metalness={0.0}
                  side={THREE.DoubleSide}
                  emissive="#010103"
                  emissiveIntensity={0.05}
                />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* Edge bevel highlight rings — catch light on outer rim */}
      {[0.066, -0.066].map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <ringGeometry args={[1.06, 1.08, 96]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            roughness={0.05}
            metalness={1.0}
            envMapIntensity={4}
          />
        </mesh>
      ))}
      {/* Inner edge bevel */}
      {[0.066, -0.066].map((z) => (
        <mesh key={`inner-${z}`} position={[0, 0, z]}>
          <ringGeometry args={[0.47, 0.49, 96]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            roughness={0.05}
            metalness={1.0}
            envMapIntensity={3}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Bearing Assembly ── */
function BearingAssembly() {
  const ballCount = 7;
  const ballRadius = 0.06;
  const raceRadius = 0.35;

  return (
    <group>
      {/* Outer bearing race — polished steel */}
      <mesh castShadow>
        <torusGeometry args={[0.42, 0.04, 32, 96]} />
        <meshPhysicalMaterial
          color="#bcc8dc"
          roughness={0.03}
          metalness={1.0}
          envMapIntensity={4.0}
          clearcoat={0.5}
          clearcoatRoughness={0.02}
        />
      </mesh>
      {/* Inner bearing race */}
      <mesh castShadow>
        <torusGeometry args={[0.26, 0.035, 32, 96]} />
        <meshPhysicalMaterial
          color="#b0bcd4"
          roughness={0.04}
          metalness={1.0}
          envMapIntensity={4.0}
          clearcoat={0.5}
          clearcoatRoughness={0.02}
        />
      </mesh>
      {/* Chrome steel balls — mirror-polished */}
      {Array.from({ length: ballCount }).map((_, i) => {
        const angle = (i / ballCount) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * raceRadius, Math.sin(angle) * raceRadius, 0]} castShadow>
            <sphereGeometry args={[ballRadius, 48, 48]} />
            <meshPhysicalMaterial
              color="#d8e0f0"
              roughness={0.01}
              metalness={1.0}
              envMapIntensity={5.0}
              clearcoat={1.0}
              clearcoatRoughness={0.01}
              reflectivity={1.0}
            />
          </mesh>
        );
      })}
      {/* Bearing cage — brass/nylon */}
      <mesh>
        <torusGeometry args={[raceRadius, 0.015, 12, 96]} />
        <meshPhysicalMaterial
          color="#cc9922"
          roughness={0.35}
          metalness={0.65}
          envMapIntensity={2.5}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
        />
      </mesh>
      {/* Cage segments */}
      {Array.from({ length: ballCount }).map((_, i) => {
        const a2 = ((i + 0.5) / ballCount) * Math.PI * 2;
        return (
          <mesh key={`seg-${i}`} position={[Math.cos(a2) * raceRadius, Math.sin(a2) * raceRadius, 0]} rotation={[0, 0, a2]}>
            <boxGeometry args={[0.02, 0.10, 0.04]} />
            <meshPhysicalMaterial color="#bb8818" roughness={0.4} metalness={0.6} envMapIntensity={2} />
          </mesh>
        );
      })}
      {/* Bearing shields — front & back with concentric detail */}
      {[0.045, -0.045].map((z, idx) => (
        <group key={idx}>
          <mesh position={[0, 0, z]}>
            <ringGeometry args={[0.18, 0.43, 96]} />
            <meshPhysicalMaterial
              color="#b4c0d6"
              roughness={0.06}
              metalness={1.0}
              side={THREE.DoubleSide}
              envMapIntensity={3.5}
              clearcoat={0.4}
              clearcoatRoughness={0.05}
            />
          </mesh>
          {/* Score lines */}
          {Array.from({ length: 20 }).map((_, j) => {
            const sa = (j / 20) * Math.PI * 2;
            return (
              <mesh key={j} position={[Math.cos(sa) * 0.31, Math.sin(sa) * 0.31, z + (idx === 0 ? 0.001 : -0.001)]} rotation={[0, 0, sa]}>
                <planeGeometry args={[0.003, 0.22]} />
                <meshBasicMaterial color="#44556a" transparent opacity={0.2} side={THREE.DoubleSide} />
              </mesh>
            );
          })}
          {/* Concentric rings on shield */}
          {[0.22, 0.28, 0.34, 0.40].map((r) => (
            <mesh key={r} position={[0, 0, z + (idx === 0 ? 0.001 : -0.001)]}>
              <ringGeometry args={[r - 0.001, r + 0.001, 96]} />
              <meshBasicMaterial color="#2a2a3a" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Axle — polished steel */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.20, 48]} />
        <meshPhysicalMaterial
          color="#b8c4d8"
          roughness={0.04}
          metalness={1.0}
          envMapIntensity={3.5}
          clearcoat={0.6}
          clearcoatRoughness={0.02}
        />
      </mesh>
    </group>
  );
}

/* ── Orbiting Highlight Light ── */
function OrbitingLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.elapsedTime * 0.5;
    lightRef.current.position.set(Math.cos(t) * 2.5, Math.sin(t) * 2.5, Math.sin(t * 0.7) * 1.5);
  });
  return <pointLight ref={lightRef} color="#fff8f0" intensity={5} distance={10} decay={2} />;
}

/* ═══════════════════════════════════════════════
   Main Wheel Group
   ═══════════════════════════════════════════════ */
export default function ProceduralWheel({ scrollRef }: { scrollRef: RefObject<{ progress: number; velocity: number }> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !scrollRef.current) return;
    const v = Math.abs(scrollRef.current.velocity);
    groupRef.current.rotation.z += 0.003 + v * 0.015;
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.06;
    groupRef.current.rotation.y = Math.cos(clock.elapsedTime * 0.3) * 0.04;
  });

  return (
    <group ref={groupRef} scale={[3, 3, 3]}>
      <UrethaneTyre />
      <Hub />
      <BearingAssembly />
      <OrbitingLight />
    </group>
  );
}

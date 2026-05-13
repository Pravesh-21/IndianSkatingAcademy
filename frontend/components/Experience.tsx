'use client';

import { useRef, useMemo, RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshReflectorMaterial, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

interface ExperienceProps {
  scrollRef: RefObject<{ progress: number; velocity: number }>;
}

function CameraRig({ scrollRef }: { scrollRef: RefObject<{ progress: number; velocity: number }> }) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 2, 12));
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

  const positionCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2, 12),
      new THREE.Vector3(0, 1.5, 10),
      new THREE.Vector3(0, 0.8, 6),
      new THREE.Vector3(0, 0, 2),
      new THREE.Vector3(0, 0, 0.2),
      new THREE.Vector3(0, 0, -2),
      new THREE.Vector3(0, 0, -12),
      new THREE.Vector3(4, 1.6, -16),
      new THREE.Vector3(0, 8, -18),
      new THREE.Vector3(0, 2, -22),
      new THREE.Vector3(0, 5, -18),
      new THREE.Vector3(0, 12, -10),
    ], false, 'catmullrom', 0.5);
  }, []);

  const targetCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -2),
      new THREE.Vector3(0, 0, -10),
      new THREE.Vector3(0, 0, -20),
      new THREE.Vector3(-2, 0, -20),
      new THREE.Vector3(0, 0, -20),
      new THREE.Vector3(0, 0, -22),
      new THREE.Vector3(0, 0, -20),
      new THREE.Vector3(0, 0, -20),
    ], false, 'catmullrom', 0.5);
  }, []);

  useFrame(() => {
    if (!scrollRef.current) return;
    const progress = Math.max(0, Math.min(1, scrollRef.current.progress));
    const targetPos = positionCurve.getPoint(progress);
    const targetLookAt = targetCurve.getPoint(progress);
    currentPos.current.lerp(targetPos, 0.06);
    currentTarget.current.lerp(targetLookAt, 0.06);
    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 1500;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
  <points ref={meshRef}>
    <bufferGeometry>
      <bufferAttribute
        args={[positions, 3]}
      />
    </bufferGeometry>

    <pointsMaterial
      size={0.05}
      color="#00C2FF"
      transparent
      opacity={0.5}
      sizeAttenuation
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  </points>
  );
}

function IntegratedSkateWheel({ scrollRef }: { scrollRef: RefObject<{ progress: number; velocity: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Mesh>(null);
  const bearingBallsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !scrollRef.current) return;
    const progress = scrollRef.current.progress;
    const velocity = Math.abs(scrollRef.current.velocity);
    
    // Keep wheel visible during scroll, positioned in center
    groupRef.current.visible = progress > 0.01 && progress < 0.35;
    
    // Rotate outer wheel
    if (wheelRef.current) wheelRef.current.rotation.x += 0.01 + velocity * 0.05;
    
    // Rotate bearing balls
    if (bearingBallsRef.current) bearingBallsRef.current.rotation.z += 0.003;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Outer wheel rim */}
      <mesh ref={wheelRef} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[2.5, 0.6, 32, 64]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Wheel hub/bearing housing */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.2, 1.2, 0.4, 32]} />
        <meshStandardMaterial color="#C8D0E0" roughness={0.1} metalness={0.95} envMapIntensity={2} />
      </mesh>
      
      {/* Bearing outer ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[2, 0.25, 16, 64]} />
        <meshStandardMaterial color="#8892A4" roughness={0.15} metalness={0.95} envMapIntensity={2} />
      </mesh>
      
      {/* Bearing inner ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.7, 0.2, 16, 64]} />
        <meshStandardMaterial color="#9AA2B4" roughness={0.1} metalness={0.95} envMapIntensity={2} />
      </mesh>
      
      {/* Bearing balls */}
      <group ref={bearingBallsRef} position={[0, 0, 0]}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0]}>
              <sphereGeometry args={[0.28, 32, 32]} />
              <meshStandardMaterial color="#D0D8E8" roughness={0.05} metalness={1} envMapIntensity={3} />
            </mesh>
          );
        })}
      </group>
      
      {/* Bearing glow ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.35, 0.02, 8, 64]} />
        <meshStandardMaterial color="#00C2FF" emissive="#00C2FF" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Center bearing hub */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.5, 32]} />
        <meshStandardMaterial color="#00C2FF" roughness={0.2} metalness={0.8} emissive="#00C2FF" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function BearingFlash({ scrollRef }: { scrollRef: RefObject<{ progress: number; velocity: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!meshRef.current || !scrollRef.current) return;
    const dist = Math.abs(scrollRef.current.progress - 0.37);
    const intensity = Math.max(0, 1 - dist / 0.03);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.8;
    meshRef.current.visible = intensity > 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.5]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function RinkEnvironment() {
  return (
    <group position={[0, 0, -20]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial blur={[300, 100]} resolution={1024} mixBlur={1} mixStrength={40} roughness={0.8} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#0A0A15" metalness={0.5} mirror={0.5} />
      </mesh>
      {/* Enhanced perspective grid with depth fade */}
      <gridHelper args={[40, 40, '#00C2FF', '#0A0A2A']} position={[0, 0.01, 0]} />
      {[-18, 18].map((x) => (<mesh key={x} position={[x, 3, 0]}><boxGeometry args={[0.2, 6, 40]} /><meshStandardMaterial color="#12121A" roughness={0.8} metalness={0.2} /></mesh>))}
      {[-18, 18].map((x) => (<mesh key={`n-${x}`} position={[x, 0.3, 0]}><boxGeometry args={[0.05, 0.05, 40]} /><meshBasicMaterial color="#00C2FF" /></mesh>))}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={i} position={[0, 5.5, -12 + i * 8]}>
          <mesh><boxGeometry args={[12, 0.1, 0.3]} /><meshBasicMaterial color="#F0F4FF" /></mesh>
          <pointLight position={[0, -0.5, 0]} color="#F0F4FF" intensity={8} distance={15} decay={2} />
        </group>
      ))}
      <pointLight position={[-16, 1, -16]} color="#00C2FF" intensity={5} distance={20} />
      <pointLight position={[16, 1, -16]} color="#00C2FF" intensity={5} distance={20} />
    </group>
  );
}

export default function Experience({ scrollRef }: ExperienceProps) {
  return (
    <>
      <CameraRig scrollRef={scrollRef} />
      <Environment preset="night" />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} color="#F0F4FF" />
      <pointLight position={[0, 3, 5]} color="#00C2FF" intensity={3} distance={20} />
      <Particles />
      <Stars radius={50} depth={80} count={3000} factor={3} saturation={0} fade speed={0.5} />
      <IntegratedSkateWheel scrollRef={scrollRef} />
      <BearingFlash scrollRef={scrollRef} />
      <RinkEnvironment />
      <fog attach="fog" args={['#0A0A0F', 15, 60]} />
      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.3} intensity={0.6} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </>
  );
}

'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, RefObject } from 'react';
import * as THREE from 'three';
import Experience from './Experience';

interface SceneCanvasProps {
  scrollRef: RefObject<{ progress: number; velocity: number }>;
}

export default function SceneCanvas({ scrollRef }: SceneCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 20], fov: 50, near: 0.01, far: 200 }}
      dpr={[1, 1.5]}
      shadows="soft"
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.4,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: '#06060f' }}
    >
      <Suspense fallback={null}>
        <Experience scrollRef={scrollRef} />
      </Suspense>
    </Canvas>
  );
}

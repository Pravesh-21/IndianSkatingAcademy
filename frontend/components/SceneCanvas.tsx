'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, RefObject } from 'react';
import Experience from './Experience';

interface SceneCanvasProps {
  scrollRef: RefObject<{ progress: number; velocity: number }>;
}

export default function SceneCanvas({ scrollRef }: SceneCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 2, 12], fov: 50, near: 0.1, far: 200 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{ background: '#0A0A0F' }}
    >
      <Suspense fallback={null}>
        <Experience scrollRef={scrollRef} />
      </Suspense>
    </Canvas>
  );
}

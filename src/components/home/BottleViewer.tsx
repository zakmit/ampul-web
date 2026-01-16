'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import type { Group } from 'three';

function BottleModel() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/Bottle.glb');

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene} scale={10} />
    </group>
  );
}


interface BottleViewerProps {
  isMobile?: boolean;
}

export default function BottleViewer({ isMobile = false }: BottleViewerProps) {

  return (
    <div
      style={{
        backgroundImage: 'url(/models/backdrop.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className={`mx-auto w-full ${isMobile ? "h-[61.8dvw]":"h-[30.9dvw] max-h-123.5"}`}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: 2, // ACESFilmicToneMapping
          toneMappingExposure: 1,
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[-5, 3, 5]} intensity={1.6} castShadow />
          <directionalLight position={[2, -2, 3]} intensity={1} />
          <BottleModel />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
            target={[0, 0, 0]}
          />
          <Environment preset="city" environmentIntensity={2} />
        </Suspense>
      </Canvas>
    </div>
  );
}

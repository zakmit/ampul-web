'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import { FrontSide } from 'three';
import type { Group, Mesh } from 'three';
import Image from 'next/image';

function BottleModel() {
  const groupRef = useRef<Group>(null);
  const { nodes } = useGLTF('/models/Bottle.glb') as unknown as {
    nodes: {
      Bottle: Group;
      Mesh: Mesh;
      Mesh_1: Mesh;
      Cap: Mesh;
      Icare: Mesh;
      Stamp: Mesh;
      Straw: Mesh;
    };
  };

  useEffect(() => {
    if (nodes.Stamp.material) {
      const mats = Array.isArray(nodes.Stamp.material) ? nodes.Stamp.material : [nodes.Stamp.material];
      mats.forEach((m) => { m.side = FrontSide; });
    }
  }, [nodes.Stamp]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={10} position={[0, -0.2, 0]}>
      {/* Outer glass */}
      <mesh geometry={nodes.Mesh.geometry} renderOrder={0}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0}
          roughness={0}
          transmission={1}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0}
          distortionScale={0.1}
          temporalDistortion={0.02}
          color="#e6f5ea"
        />
      </mesh>
      {/* Inner liquid */}
      <mesh geometry={nodes.Mesh_1.geometry}>
        <meshStandardMaterial
          color="#d4fbff"
          transparent
          opacity={0.1}
          roughness={0.05}
          metalness={0}
        />
      </mesh>
      {/* Stamp keeps original material, offset to avoid z-fighting */}
      <primitive object={nodes.Stamp}  />
      {/* Other parts keep their original materials */}
      <primitive object={nodes.Cap} />
      <primitive object={nodes.Icare} />
      <primitive object={nodes.Straw} />
    </group>
  );
}

// Preload the model so it starts fetching immediately when this module loads
useGLTF.preload('/models/Bottle.glb');

function BottleCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: 2, // ACESFilmicToneMapping
        toneMappingExposure: 1,
      }}
    >
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
      <Environment preset="city" environmentIntensity={2.4} />
    </Canvas>
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
      className={`relative mx-auto w-full ${isMobile ? "h-[61.8dvw]" : "h-[30.9dvw] max-h-123.5"}`}
    >
      <Suspense
        fallback={
          <Image
            src="/products/icare-bottle.jpg"
            alt="Bottle loading"
            fill
            className="object-cover"
          />
        }
      >
        <BottleCanvas />
      </Suspense>
    </div>
  );
}

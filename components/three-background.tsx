"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedShape = ({ 
  position, 
  color, 
  speed = 1, 
  distort = 0.3, 
  type = "sphere" 
}: { 
  position: [number, number, number], 
  color: string, 
  speed?: number, 
  distort?: number,
  type?: "sphere" | "torus" | "icosahedron"
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const initialPosition = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const { mouse } = state;
    
    // Rotation
    meshRef.current.rotation.x = speed * time * 0.1;
    meshRef.current.rotation.y = speed * time * 0.15;
    
    // Mouse responsiveness (tilt/parallax)
    const targetX = initialPosition.current.x + (mouse.x * 2);
    const targetY = initialPosition.current.y + (mouse.y * 2);
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
  });

  const renderGeometry = () => {
    switch (type) {
      case "torus":
        return (
          <Torus args={[0.8, 0.3, 16, 100]}>
            <MeshDistortMaterial
              color={color}
              distort={distort}
              speed={speed}
              roughness={0.2}
              metalness={0.8}
            />
          </Torus>
        );
      case "icosahedron":
        return (
          <Icosahedron args={[1, 0]}>
            <MeshWobbleMaterial
              color={color}
              factor={distort * 2}
              speed={speed}
            />
          </Icosahedron>
        );
      default:
        return (
          <Sphere args={[1, 64, 64]}>
            <MeshDistortMaterial
              color={color}
              distort={distort}
              speed={speed}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
        );
    }
  };

  return (
    <Float speed={speed * 2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        {renderGeometry()}
      </mesh>
    </Float>
  );
};

const Particles = ({ count = 150 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        p[i * 3] = (Math.random() - 0.5) * 30;
        p[i * 3 + 1] = (Math.random() - 0.5) * 30;
        p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (pointsRef.current) {
        const { mouse } = state;
        pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 + (mouse.x * 0.05);
        pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02 + (mouse.y * 0.05);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        color="#a855f7" 
        transparent 
        opacity={0.4} 
        sizeAttenuation={true}
      />
    </points>
  );
};

const ThreeBackground = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
            <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#a855f7" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#7c3aed" />
                <spotLight position={[0, 15, 0]} intensity={0.5} color="#ffffff" />
                
                <AnimatedShape position={[-6, 4, -4]} color="#a855f7" speed={1.5} distort={0.4} type="sphere" />
                <AnimatedShape position={[7, -3, -5]} color="#7c3aed" speed={1.2} distort={0.5} type="torus" />
                <AnimatedShape position={[-2, -5, -6]} color="#a855f7" speed={0.8} distort={0.3} type="icosahedron" />
                <AnimatedShape position={[4, 5, -8]} color="#6366f1" speed={1.0} distort={0.4} type="sphere" />
                
                <Particles count={200} />
            </Canvas>
        </div>
    );
};

export default ThreeBackground;

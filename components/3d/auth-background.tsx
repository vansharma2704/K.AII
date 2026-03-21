"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Torus, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const AuthShape = ({ position, rotation, color }: { position: [number, number, number], rotation: [number, number, number], color: string }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = time * 0.2;
        meshRef.current.rotation.y = time * 0.3;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Torus ref={meshRef} position={position} rotation={rotation} args={[4, 1.5, 32, 100]}>
                <MeshDistortMaterial
                    color={color}
                    speed={2}
                    distort={0.4}
                    roughness={0}
                    metalness={0.9}
                    emissive={color}
                    emissiveIntensity={0.5}
                />
            </Torus>
        </Float>
    );
};

const AuthBackground = () => {
  return (
    <group>
      <AuthShape position={[-6, 4, -10]} rotation={[0.5, 0.5, 0]} color="#a855f7" />
      <AuthShape position={[8, -2, -15]} rotation={[-0.2, -0.4, 0.2]} color="#6366f1" />
    </group>
  );
};

export default AuthBackground;

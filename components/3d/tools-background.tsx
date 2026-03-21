"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, TorusKnot, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const ToolGear = ({ position, color, args }: { position: [number, number, number], color: string, args: [number, number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <TorusKnot ref={meshRef} position={position} args={args}>
        <meshStandardMaterial color={color} wireframe />
      </TorusKnot>
    </Float>
  );
};

const ToolsBackground = () => {
  return (
    <group>
      <ToolGear position={[-12, 5, -10]} color="#a855f7" args={[1.5, 0.4, 64, 12]} />
      <ToolGear position={[12, -8, -15]} color="#6366f1" args={[2, 0.5, 64, 12]} />
      
      <mesh position={[0, 0, -20]}>
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial color="#1e1b4b" wireframe transparent opacity={0.05} />
      </mesh>
    </group>
  );
};

export default ToolsBackground;

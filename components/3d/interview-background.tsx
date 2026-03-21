"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Icosahedron, MeshWobbleMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

const NeuralNode = ({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) => {
  return (
    <Float speed={speed} rotationIntensity={2} floatIntensity={1}>
      <Icosahedron position={position} args={[1, 1]}>
        <MeshWobbleMaterial color={color} factor={0.6} speed={speed} roughness={0} metalness={0.8} />
      </Icosahedron>
    </Float>
  );
};

const InterviewBackground = () => {
  const nodes = useMemo(() => {
    const interviewNodes: { position: [number, number, number], color: string, speed: number }[] = [
      { position: [-8, 0, -10] as [number, number, number], color: "#a855f7", speed: 2 },
      { position: [8, 4, -12] as [number, number, number], color: "#6366f1", speed: 1.5 },
      { position: [0, -6, -15] as [number, number, number], color: "#7c3aed", speed: 1.8 },
    ];
    return interviewNodes;
  }, []);

  return (
    <group>
      {nodes.map((node, i) => (
        <NeuralNode key={i} {...node} />
      ))}
      
      {/* Central brain glow */}
      <Sphere args={[3, 32, 32]} position={[0, 0, -5]}>
          <meshStandardMaterial 
              color="#a855f7" 
              emissive="#a855f7" 
              emissiveIntensity={4} 
              transparent 
              opacity={0.1} 
          />
      </Sphere>
    </group>
  );
};

export default InterviewBackground;

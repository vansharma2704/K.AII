"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Box, Edges } from "@react-three/drei";
import * as THREE from "three";

const KnowledgeBlock = ({ position, color, delay }: { position: [number, number, number], color: string, delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y += Math.sin(time + delay) * 0.005;
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <Box ref={meshRef} position={position} args={[2, 2, 2]}>
        <meshStandardMaterial color={color} transparent opacity={0.15} roughness={0} metalness={0.8} />
        <Edges color={color} threshold={15} />
      </Box>
    </Float>
  );
};

const CourseBackground = () => {
  const blocks = useMemo(() => {
    const b = [];
    for(let i=0; i<8; i++) {
        b.push({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10 - 10
            ] as [number, number, number],
            color: i % 2 === 0 ? "#a855f7" : "#6366f1",
            delay: Math.random() * Math.PI * 2
        });
    }
    return b;
  }, []);

  return (
    <group>
        {blocks.map((block, i) => (
            <KnowledgeBlock key={i} {...block} />
        ))}
    </group>
  );
};

export default CourseBackground;

"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Octahedron, Line } from "@react-three/drei";
import * as THREE from "three";

const Milestone = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
      <Octahedron position={position} args={[1, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} wireframe />
      </Octahedron>
    </Float>
  );
};

const RoadmapBackground = () => {
  const points = useMemo(() => {
    const roadmapPoints: [number, number, number][] = [
      [-10, 5, -15],
      [-5, -2, -10],
      [2, 4, -8],
      [8, -3, -12],
      [12, 6, -18],
    ];
    return roadmapPoints;
  }, []);

  return (
    <group>
      {points.map((p, i) => (
        <Milestone key={i} position={p} color={i % 2 === 0 ? "#a855f7" : "#6366f1"} />
      ))}

      {/* Connecting lines */}
      {points.map((p, i) => i < points.length - 1 && (
        <Line
          key={`line-${i}`}
          points={[p, points[i+1]]}
          color="#a855f7"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
      
      {/* Distant glowing nebula */}
      <mesh position={[0, 0, -50]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial color="#1e1b4b" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export default RoadmapBackground;

"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Stars, Sphere, Float, Octahedron, TorusKnot } from "@react-three/drei";
import * as THREE from "three";

export const MovingStarUniverse = ({ count = 40000 }) => {
  const meshRef = useRef<THREE.Points>(null!);
  
  const [positions, offsets, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const off = new Float32Array(count);
    const spd = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Large volume distribution
        pos[i3] = (Math.random() - 0.5) * 200;
        pos[i3 + 1] = (Math.random() - 0.5) * 150;
        pos[i3 + 2] = (Math.random() - 0.5) * 100 - 50;
        
        off[i] = Math.random() * Math.PI * 2;
        spd[i] = 0.5 + Math.random() * 1.5;
    }
    return [pos, off, spd];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.01;
    meshRef.current.rotation.x = time * 0.005;
    
    // Global "bouncing" scale pulse
    const s = 1 + Math.sin(time * 2) * 0.03;
    meshRef.current.scale.set(s, s, s);
    
    // Position floating
    meshRef.current.position.y = Math.sin(time * 0.4) * 5;
  });

  return (
    <Points ref={meshRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
            transparent
            color="#ffffff"
            size={0.4} // Increased for "undeniable" presence
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.8} // Increased opacity
        />
    </Points>
  );
};

export const Nebula = ({ count = 100 }) => { // Increased for milky gas look
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 120;
      p[i * 3 + 1] = (Math.random() - 0.5) * 70;
      p[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;
    }
    return p;
  }, [count]);

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <Sphere key={i} position={[points[i * 3], points[i * 3 + 1], points[i * 3 + 2]]} args={[Math.random() * 10 + 5, 8, 8]}>
          <meshBasicMaterial
            color={i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#38bdf8" : "#0ea5e9"}
            transparent
            opacity={0.012} // Very low for milky mist
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      ))}
    </group>
  );
};

export const ParticleField = ({ count = 2500 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        p[i * 3] = (Math.random() - 0.5) * 120;
        p[i * 3 + 1] = (Math.random() - 0.5) * 120;
        p[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    const { mouse, clock } = state;
    const time = clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.008;
    pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, mouse.x * 3.5, 0.05);
    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, mouse.y * 3.5, 0.05);
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3}>
      <PointMaterial
        transparent
        color="#ffffff" // Clean white particles
        size={0.015} // Reduced size as requested
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export const FloatingBigStars = () => {
    const stars = useMemo(() => {
        return Array.from({ length: 10 }).map(() => ({
            position: [
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20 - 5
            ] as [number, number, number],
            color: ["#ffffff", "#38bdf8", "#0ea5e9", "#7dd3fc"][Math.floor(Math.random() * 4)],
            scale: 0.8 + Math.random() * 1.0, // Increased size
            speed: 0.3 + Math.random() * 0.5,
            offset: Math.random() * Math.PI * 2
        }));
    }, []);

    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            const star = stars[i];
            // Increased speed and range
            child.position.x = star.position[0] + Math.sin(time * star.speed * 1.8 + star.offset) * 15;
            child.position.y = star.position[1] + Math.cos(time * star.speed * 1.5 + star.offset) * 6;
            child.rotation.x += 0.02;
            child.rotation.y += 0.025;
        });
    });

    return (
        <group ref={groupRef}>
            {stars.map((star, i) => (
                <Float key={i} speed={1.5} rotationIntensity={0.8} floatIntensity={0.8}>
                    <Octahedron position={star.position} args={[star.scale, 0]}>
                        <meshStandardMaterial 
                            color={star.color} 
                            emissive={star.color} 
                            emissiveIntensity={2} 
                            transparent 
                            opacity={0.85} 
                            metalness={1}
                            roughness={0}
                        />
                    </Octahedron>
                </Float>
            ))}
        </group>
    );
};

export const ShootingStars = () => {
    const starsRef = useRef<THREE.Group>(null!);
    const stars = useMemo(() => {
      return Array.from({ length: 12 }).map(() => ({
        position: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 30] as [number, number, number],
        speed: 1.2 + Math.random() * 1.8
      }));
    }, []);
  
    useFrame((state) => {
      starsRef.current.children.forEach((group, i) => {
        group.position.x += stars[i].speed;
        group.position.y -= stars[i].speed * 0.5;
        
        if (group.position.x > 60 || group.position.y < -60) {
          group.position.x = -60;
          group.position.y = 60;
        }
        
        const s = state.clock.getElapsedTime() * 2 + i;
        const opacity = Math.max(0, Math.sin(s) * 0.7);
        
        (group as THREE.Group).children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            (mesh.material as THREE.MeshBasicMaterial).opacity = opacity * (mesh.position.x === 0 ? 1 : 0.3);
          }
        });
      });
    });
  
    return (
      <group ref={starsRef}>
        {stars.map((star, i) => (
          <group key={i} position={star.position}>
            <mesh>
              <planeGeometry args={[0.8, 0.02]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[-0.6, 0, 0]}>
              <planeGeometry args={[1.8, 0.04]} />
              <meshBasicMaterial color="#bc8df7" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        ))}
      </group>
    );
};

export const FloatingStarField = ({ count = 15000 }) => {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            // Sphere distribution
            const r = 200 + Math.random() * 100;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            p[i * 3 + 2] = r * Math.cos(phi);
            
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[ i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[ i * 3 + 2] = (Math.random() - 0.5) * 0.02;
            
            sizes[i] = Math.random() * 1.5;
        }
        return { positions: p, velocities, sizes };
    }, [count]);

    const pointsRef = useRef<THREE.Points>(null!);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        pointsRef.current.rotation.y = time * 0.015;
        pointsRef.current.rotation.x = time * 0.008;
        
        // Twinkling scale effect
        pointsRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
        
        pointsRef.current.position.y = Math.sin(time * 0.5) * 4;
    });

    return (
        <Points ref={pointsRef} positions={points.positions} stride={3}>
            <PointMaterial
                transparent
                color="#ffffff"
                size={2.5} // Larger floating stars
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.65} // Boosted
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
};

export const CosmicGalaxy = () => {
  const meshRef = useRef<THREE.Points>(null!);
  const count = 4000; // Increased for global density
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const r = Math.random() * 25; // Slightly larger for global view
        const angle = r * 0.4 + (i % 2 === 0 ? 0 : Math.PI);
        pos[i3] = Math.cos(angle) * r + (Math.random() - 0.5) * 3;
        pos[i3 + 1] = (Math.random() - 0.5) * 3;
        pos[i3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 3;
        
        const color = new THREE.Color(i % 2 === 0 ? "#7c3aed" : "#38bdf8");
        cols[i3] = color.r; cols[i3 + 1] = color.g; cols[i3 + 2] = color.b;
    }
    return [pos, cols];
  }, []);

  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
  });

  return (
    <Points ref={meshRef} positions={positions} colors={colors} stride={3}>
      <PointMaterial 
        transparent 
        vertexColors 
        size={0.18} // Larger galaxy points
        sizeAttenuation 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
        opacity={0.7} // More opaque galaxy
      />
    </Points>
  );
};

export const GlobalCosmicEffects = () => {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const { mouse } = state;
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.08, 0.05);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.08, 0.05);
    });

    return (
        <group ref={groupRef}>
            <Nebula />
            <ParticleField />
            <MovingStarUniverse />
            <FloatingBigStars />
            <ShootingStars />
            <CosmicGalaxy />
        </group>
    );
};

const ParticleBackground = () => {
  return null; // This will be deprecated in favor of GlobalCosmicEffects in the main Canvas
};

export default ParticleBackground;

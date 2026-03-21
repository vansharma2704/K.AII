"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GlobalCosmicEffects } from "./particle-background";
import DynamicBackground from "./dynamic-background";

const GlobalCanvas = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#020105] pointer-events-none">
      <Canvas
        camera={{ position: [0, 15, 25], fov: 60 }}
        dpr={[1, 2]}
        gl={{ 
            powerPreference: "high-performance", 
            antialias: false,
            alpha: true 
        }}
      >
        <Suspense fallback={null}>
          <GlobalCosmicEffects />
          <ambientLight intensity={0.8} />
          <pointLight position={[0, 0, 0]} intensity={2.5} color="#7c3aed" />
          
          {/* Route-specific components */}
          <DynamicBackground />
        </Suspense>
      </Canvas>
      
      {/* Immersive Space Overlays - Adjusted for better visibility */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#020105_70%)] opacity-80" />
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      
      {/* Deep atmosphere glow at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-[40vh] bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default GlobalCanvas;

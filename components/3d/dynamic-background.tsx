"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ParticleBackground from "./particle-background";
import DashboardBackground from "./dashboard-background";
import InterviewBackground from "./interview-background";
import CourseBackground from "./course-background";
import ResumeBackground from "./resume-background";
import RoadmapBackground from "./roadmap-background";
import ToolsBackground from "./tools-background";
import AuthBackground from "./auth-background";

const DynamicBackground = () => {
  const pathname = usePathname();

  // Auth pages
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return <AuthBackground />;
  }

  // Dashboard
  if (pathname.includes("/dashboard")) {
    return <DashboardBackground />;
  }

  // Interview
  if (pathname.includes("/mock-interview") || pathname.includes("/interview")) {
    return <InterviewBackground />;
  }

  // Courses
  if (pathname.includes("/courses") || pathname.includes("/ai-course")) {
    return <CourseBackground />;
  }

  // Resume
  if (pathname.includes("/resume")) {
    return <ResumeBackground />;
  }

  // Roadmap
  if (pathname.includes("/roadmap")) {
    return <RoadmapBackground />;
  }

  // Tools
  if (pathname.includes("/tools") || pathname.includes("/prep-quiz") || pathname.includes("/career-insights")) {
    return <ToolsBackground />;
  }

  // Default fallback (Home page or unmatched)
  // Returning null here because GlobalCosmicEffects handles the base space
  return null;
};

export default DynamicBackground;

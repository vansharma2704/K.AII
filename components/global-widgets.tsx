"use client";

import dynamic from "next/dynamic";

const KaiAssistant = dynamic(() => import("@/components/kai-assistant"), { ssr: false });
const GlobalCanvas = dynamic(() => import("@/components/3d/global-canvas"), { ssr: false });

export function GlobalWidgets() {
  return (
    <>
      <GlobalCanvas />
      <KaiAssistant />
    </>
  );
}

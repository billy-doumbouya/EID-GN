// src/components/LottiePlayer.jsx
"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function LottiePlayer({ animationData, loop = true, className = "" }) {
  return <Lottie animationData={animationData} loop={loop} className={className} />;
}
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Package, Shield, Settings, Truck, MapPin } from "lucide-react";

const BUBBLES = [
  { id: 1, icon: Package, top: "20%", left: "15%", delay: 0 },
  { id: 2, icon: Shield, top: "60%", left: "25%", delay: 1.2 },
  { id: 3, icon: Settings, top: "25%", left: "75%", delay: 0.5 },
  { id: 4, icon: Truck, top: "65%", left: "85%", delay: 2.1 },
  { id: 5, icon: MapPin, top: "80%", left: "55%", delay: 1.7 },
];

export function HeroBackground({ variant = "hero" }) {
  const isAnimated = variant === "animated";
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const opacityClass =
    variant === "auth"
      ? "opacity-[0.1]"
      : variant === "about"
        ? "opacity-[0.15]"
        : "opacity-[0.2]";

  // Pause animation when tab is inactive to save battery
  useEffect(() => {
    if (!isAnimated) return;
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAnimated]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[-1] overflow-hidden ${opacityClass}`}
    >
      {/* Lignes d'orbite courbes (SVG statique) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {variant === "about" ? (
          <>
            <path
              d="M-80 300C180 280 410 450 680 390S1110 190 1520 230M-80 316C190 296 430 466 700 405S1130 206 1520 246M-80 332C205 312 450 482 720 420S1150 222 1520 262M-80 348C220 328 470 498 740 435S1170 238 1520 278M-80 364C235 344 490 514 760 450S1190 254 1520 294M-80 380C250 360 510 530 780 465S1210 270 1520 310M-80 396C265 376 530 546 800 480S1230 286 1520 326M-80 412C280 392 550 562 820 495S1250 302 1520 342M-80 428C295 408 570 578 840 510S1270 318 1520 358M-80 444C310 424 590 594 860 525S1290 334 1520 374M-80 460C325 440 610 610 880 540S1310 350 1520 390M-80 476C340 456 630 626 900 555S1330 366 1520 406"
              stroke="var(--color-navy-700)"
              strokeWidth="1"
              strokeOpacity="0.42"
            />
            <path
              d="M670-40C700 100 835 240 760 365S470 520 190 790M710-40C740 105 870 245 790 370S530 525 260 790M750-40C780 110 905 250 820 375S590 530 330 790M790-40C820 115 940 255 850 380S650 535 400 790M830-40C860 120 975 260 880 385S710 540 470 790M870-40C900 125 1010 265 910 390S770 545 540 790M910-40C940 130 1045 270 940 395S830 550 610 790M950-40C980 135 1080 275 970 400S890 555 680 790M990-40C1020 140 1115 280 1000 405S950 560 750 790M1030-40C1060 145 1150 285 1030 410S1010 565 820 790M1070-40C1100 150 1185 290 1060 415S1070 570 890 790M1110-40C1140 155 1220 295 1090 420S1130 575 960 790M1150-40C1180 160 1255 300 1120 425S1190 580 1030 790M1190-40C1220 165 1290 305 1150 430S1250 585 1100 790M1230-40C1260 170 1325 310 1180 435S1310 590 1170 790M1270-40C1300 175 1360 315 1210 440S1370 595 1240 790M1310-40C1340 180 1395 320 1240 445S1430 600 1310 790M1350-40C1380 185 1430 325 1270 450S1490 605 1380 790M1390-40C1420 190 1465 330 1300 455S1550 610 1450 790"
              stroke="var(--color-navy-700)"
              strokeWidth="1"
              strokeOpacity="0.34"
            />
            <path
              d="M-80 390C200 372 460 536 730 472S1160 286 1520 326M-80 438C305 420 575 582 855 518S1280 332 1520 374"
              stroke="var(--color-amber-500)"
              strokeWidth="1.2"
              strokeOpacity="0.36"
            />
          </>
        ) : (
          <>
            <path
              d="M-100 200 C300 400 800 -100 1540 300"
              stroke="var(--color-mechanic-500)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-30"
            />
            <path
              d="M-100 600 C400 700 900 100 1540 500"
              stroke="var(--color-navy-700)"
              strokeWidth="2"
              className="opacity-20"
            />
            <path
              d="M-100 400 C300 100 1000 700 1540 100"
              stroke="var(--color-amber-500)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              className="opacity-20"
            />
          </>
        )}
      </svg>

      {/* Bulles flottantes (Uniquement sur l'accueil) */}
      {isAnimated && (
        <div className="absolute inset-0 max-w-[1440px] mx-auto">
          {BUBBLES.map((bubble, i) => {
            const Icon = bubble.icon;
            
            // Si le mouvement réduit est activé ou l'onglet inactif, on fige le mouvement
            const animateLoop =
              shouldReduceMotion || !isVisible
                ? { y: 0 }
                : { y: [0, -12, 0] };

            return (
              <motion.div
                key={bubble.id}
                className="absolute flex items-center justify-center rounded-full bg-navy-800/80 p-3 shadow-[0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-white/10 backdrop-blur-md"
                style={{ top: bubble.top, left: bubble.left }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  ...animateLoop,
                }}
                transition={{
                  opacity: { delay: 0.2 + i * 0.1, duration: 0.6 },
                  scale: { delay: 0.2 + i * 0.1, duration: 0.6, type: "spring" },
                  y: {
                    duration: 4 + bubble.id * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: bubble.delay,
                  },
                }}
              >
                <Icon size={20} className="text-mechanic-400 opacity-80" />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
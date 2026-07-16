// components/AnimatedHero.jsx
"use client";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

export function AnimatedHero() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Effet de parallax sur l'image
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 300 });
  const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 300 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX.set(x);
      mouseY.set(y);
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Titre avec animation de lettres
  const title = "Tout pour rouler, livré à Kankan";
  const words = title.split(" ");

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-navy-900 text-white"
    >
      {/* Fond animé : gradient mesh + particules */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-mechanic-500/10 to-amber-500/10" />
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, -10, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-16 md:flex-row md:py-24">
        {/* Texte */}
        <div className="flex-1 text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium uppercase tracking-wide text-mechanic-400"
          >
            Motos - Tricycles - Pièces détachées
          </motion.p>

          <h1 className="mt-3 font-display text-3xl font-bold leading-tight md:text-5xl">
            {words.map((word, wi) => (
              <span key={wi} className="inline-block overflow-hidden">
                {word.split("").map((char, ci) => (
                  <motion.span
                    key={ci}
                    className="inline-block"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.5 + wi * 0.1 + ci * 0.02,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                <span className="inline-block">&nbsp;</span>
              </span>
            ))}
            <span className="text-mechanic-400">livré à Kankan</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-4 max-w-md text-white/70 mx-auto md:mx-0"
          >
            Le plus grand catalogue de pièces détachées et de véhicules deux et
            trois roues, avec vérification de compatibilité par modèle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start"
          >
            <Link
              href="/pieces"
              className="group relative overflow-hidden rounded-lg bg-mechanic-500 px-6 py-3 font-medium text-white transition-all hover:bg-mechanic-600 hover:scale-105"
            >
              <span className="relative z-10">Trouver une pièce</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </Link>
            <Link
              href="/motos"
              className="rounded-lg border border-white/20 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 hover:scale-105"
            >
              Voir les motos
            </Link>
          </motion.div>
        </div>

        {/* Image 3D avec effet de parallax */}
        <motion.div
          className="flex-1 perspective-1000"
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="relative rounded-xl shadow-2xl overflow-hidden">
            <Image
              src="/hero-image.jpg"
              alt="Illustration moto"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

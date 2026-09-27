// // src/components/motion/Reveal.jsx
// "use client";

// import { motion } from "framer-motion";

// const OFFSETS = {
//   up: { y: 24, x: 0 },
//   left: { y: 0, x: 24 },
//   right: { y: 0, x: -24 },
// };

// export function Reveal({ children, direction = "up", delay = 0, className = "" }) {
//   const offset = OFFSETS[direction] ?? OFFSETS.up;

//   return (
//     <motion.div
//       className={className}
//       initial={{ opacity: 0, ...offset }}
//       whileInView={{ opacity: 1, y: 0, x: 0 }}
//       viewport={{ once: true, margin: "-80px" }}
//       transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
//     >
//       {children}
//     </motion.div>
//   );
// }


"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Reveal({ children, delay = 0, className }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1], // cubic-bezier premium (easeOutExpo)
      }}
    >
      {children}
    </motion.div>
  );
}
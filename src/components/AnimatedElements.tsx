import React, { useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function AnimatedElements({ name }: { name: string }) {
  const [isScattered, setIsScattered] = useState(false);
  const [coords, setCoords] = useState<{x: number, y: number, r: number}[]>([]);
  const rotation = useMotionValue(0);
  const rotationSpring = useSpring(rotation, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    rotation.set(((e.clientX - (rect.left + rect.width / 2)) / window.innerWidth) * 60);
  };

  const toggleScatter = () => {
    if (!isScattered) {
      setCoords(Array.from({ length: 20 }, () => ({
        x: (Math.random() - 0.5) * window.innerWidth * 0.8,
        y: (Math.random() - 0.5) * window.innerHeight * 0.8,
        r: (Math.random() - 0.5) * 720
      })));
    }
    setIsScattered(!isScattered);
  };

  return (
    <motion.h1 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => rotation.set(0)}
      onClick={toggleScatter}
      style={{ rotate: rotationSpring, willChange: "transform, opacity" }}
      whileHover={{ scale: 1.05 }}
      className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-pixelify tracking-tighter text-[#FAFAF9] select-none flex flex-wrap justify-center gap-x-2 sm:gap-x-4 cursor-pointer transition-transform duration-300 hover-glow"
    >
      {name.split(' ').map((word, wIdx) => (
        <div key={wIdx} className="flex">
          {word.split('').map((letter, lIdx) => {
            const i = wIdx * 10 + lIdx;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isScattered ? { x: coords[i]?.x||0, y: coords[i]?.y||0, rotate: coords[i]?.r||0 } : { opacity: 1, x: 0, y: 0, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                style={{ willChange: "transform, opacity" }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            );
          })}
        </div>
      ))}
    </motion.h1>
  );
}

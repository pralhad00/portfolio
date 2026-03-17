import React, { Suspense, useState, useEffect, useRef } from 'react';

const AnimatedElements = React.lazy(() => import('./components/AnimatedElements'));
const CursorTrail = React.lazy(() => import('./components/CursorTrail').then(m => ({ default: m.CursorTrail })));

const NAME = "PRALHAD NEUPANE";

const StaticName = ({ name }: { name: string }) => (
  <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-pixelify tracking-tighter text-[#FAFAF9] select-none flex flex-wrap justify-center gap-x-2 sm:gap-x-4 cursor-pointer">
    {name.split(' ').map((word, wIdx) => (
      <div key={wIdx} className="flex">
        {word.split('').map((letter, lIdx) => (
          <span key={wIdx * 10 + lIdx} className="inline-block">{letter}</span>
        ))}
      </div>
    ))}
  </h1>
);

export default function App() {
  const [showAnimations, setShowAnimations] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerAnimations = () => {
    if (!showAnimations) {
      setShowAnimations(true);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    
    // Fallback: load animations after a short delay if no interaction
    const timer = setTimeout(() => setShowAnimations(true), 500);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      clearTimeout(timer);
    };
  }, []);

  return (
    <main 
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden selection:bg-white/20"
      onMouseEnter={triggerAnimations}
      onTouchStart={triggerAnimations}
      onClick={triggerAnimations}
      ref={containerRef}
    >
      {showAnimations && (
        <Suspense fallback={null}>
          <CursorTrail rainbow={true} />
        </Suspense>
      )}
      <div className="spotlight" />
      
      <section className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full max-w-7xl mx-auto">
        <header>
          {showAnimations ? (
            <Suspense fallback={<StaticName name={NAME} />}>
              <AnimatedElements name={NAME} />
            </Suspense>
          ) : (
            <StaticName name={NAME} />
          )}
          <h2 className="sr-only">Software Engineer</h2>
        </header>
      </section>
    </main>
  );
}

import React, { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 40;

export function CursorSnake() {
  const svgRef = useRef<SVGSVGElement>(null);
  const linesRef = useRef<(SVGLineElement | null)[]>([]);
  const headRef = useRef<SVGGElement>(null);

  const mouse = useRef({ x: -100, y: -100 });
  const points = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }))
  );
  const hasMoved = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMoved.current) {
        points.current.forEach((p) => {
          p.x = e.clientX;
          p.y = e.clientY;
        });
        hasMoved.current = true;
      }
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        if (!hasMoved.current) {
          points.current.forEach((p) => {
            p.x = e.touches[0].clientX;
            p.y = e.touches[0].clientY;
          });
          hasMoved.current = true;
        }
        mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    let animationFrameId: number;

    const animate = () => {
      const pts = points.current;

      // Head follows mouse
      pts[0].x += (mouse.current.x - pts[0].x) * 0.25;
      pts[0].y += (mouse.current.y - pts[0].y) * 0.25;

      // Rest of the body follows the segment ahead of it
      for (let i = 1; i < TRAIL_LENGTH; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * 0.45;
        pts[i].y += (pts[i - 1].y - pts[i].y) * 0.45;
      }

      // Update line segments
      linesRef.current.forEach((line, i) => {
        if (line && pts[i] && pts[i + 1]) {
          line.setAttribute('x1', pts[i].x.toString());
          line.setAttribute('y1', pts[i].y.toString());
          line.setAttribute('x2', pts[i + 1].x.toString());
          line.setAttribute('y2', pts[i + 1].y.toString());
        }
      });

      // Update head position and rotation
      if (headRef.current && hasMoved.current) {
        const dx = pts[0].x - pts[1].x;
        const dy = pts[0].y - pts[1].y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        headRef.current.setAttribute(
          'transform',
          `translate(${pts[0].x}, ${pts[0].y}) rotate(${angle})`
        );
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 pointer-events-none z-40 w-full h-full"
      style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 204, 0.6))' }}
    >
      {/* Trail Body */}
      {Array.from({ length: TRAIL_LENGTH - 1 }).map((_, i) => {
        const width = Math.max(2, 14 - (i / TRAIL_LENGTH) * 14);
        const opacity = 1 - i / TRAIL_LENGTH;
        // Gradient from Cyan (180) to Green (120)
        const hue = 180 - (i / TRAIL_LENGTH) * 60;
        const color = `hsla(${hue}, 100%, 50%, ${opacity})`;

        return (
          <line
            key={i}
            ref={(el) => (linesRef.current[i] = el)}
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
          />
        );
      })}

      {/* Snake Head */}
      <g ref={headRef} style={{ visibility: 'hidden' }} className="snake-head">
        {/* Head Shape */}
        <path
          d="M -8 -10 C 12 -10 18 -5 18 0 C 18 5 12 10 -8 10 C -14 10 -16 5 -16 0 C -16 -5 -14 -10 -8 -10 Z"
          fill="#00FFFF"
        />
        {/* Eyes */}
        <circle cx="6" cy="-4" r="2" fill="#0F1419" />
        <circle cx="6" cy="4" r="2" fill="#0F1419" />
        {/* Tongue */}
        <path
          d="M 18 0 L 26 -3 M 18 0 L 26 3"
          stroke="#ef4444"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <style>{`
        .snake-head {
          visibility: visible !important;
        }
      `}</style>
    </svg>
  );
}

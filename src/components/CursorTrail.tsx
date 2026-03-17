import React, { useRef, useEffect, useState, startTransition } from "react";

interface CursorTrailProps {
  squareSize?: number;
  fadeDuration?: number;
  color?: string;
  maxSquares?: number;
  shape?: "square" | "circle";
  rainbow?: boolean;
  style?: React.CSSProperties;
}

interface Square {
  x: number;
  y: number;
  key: number;
  created: number;
}

export const CursorTrail: React.FC<CursorTrailProps> = (props) => {
  const {
    squareSize = 32,
    fadeDuration = 700,
    color = "#222",
    maxSquares = 30,
    shape = "square",
    rainbow = false,
    style,
  } = props;

  const [squares, setSquares] = useState<Square[]>([]);
  const keyRef = useRef(0);
  const rafRef = useRef<number>();

  // Mouse move handler
  useEffect(() => {
    function handle(e: MouseEvent) {
      // Snap to grid
      const x = Math.floor(e.clientX / squareSize) * squareSize;
      const y = Math.floor(e.clientY / squareSize) * squareSize;
      const now = Date.now();

      startTransition(() => {
        setSquares((prev) => {
          // Avoid duplicate squares at same grid position
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            if (last.x === x && last.y === y) return prev;
          }
          const next = [...prev, { x, y, key: keyRef.current++, created: now }];
          // Limit to maxSquares
          return next.slice(-maxSquares);
        });
      });
    }
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [squareSize, maxSquares]);

  // Remove old squares
  useEffect(() => {
    function clean() {
      const now = Date.now();
      startTransition(() => {
        setSquares((prev) => prev.filter((sq) => now - sq.created < fadeDuration));
      });
      rafRef.current = requestAnimationFrame(clean);
    }
    rafRef.current = requestAnimationFrame(clean);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fadeDuration]);

  // Render squares
  return (
    <div
      style={{
        ...style,
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {squares.map((sq) => {
        const age = Date.now() - sq.created;
        const opacity = 1 - Math.min(1, age / fadeDuration);
        const bgColor = rainbow ? `hsl(${(sq.key * 15) % 360}, 100%, 60%)` : color;
        
        return (
          <div
            key={sq.key}
            style={{
              position: "absolute",
              left: sq.x,
              top: sq.y,
              width: squareSize,
              height: squareSize,
              background: bgColor,
              opacity,
              borderRadius: shape === "circle" ? "50%" : 0,
              pointerEvents: "none",
              transition: "opacity 0.2s linear",
              willChange: "opacity",
            }}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
};

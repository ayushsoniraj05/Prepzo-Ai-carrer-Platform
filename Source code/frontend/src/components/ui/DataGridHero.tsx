import React, { useEffect, useRef } from "react";

interface DataGridHeroProps {
  rows: number;
  cols: number;
  spacing: number;
  duration: number;
  color: string;
  animationType: "pulse" | "wave" | "random";
  pulseEffect: boolean;
  mouseGlow: boolean;
  opacityMin: number;
  opacityMax: number;
  background: string;
  children?: React.ReactNode;
}

/**
 * A generative hero component with animated grid background.
 */
export const DataGridHero: React.FC<DataGridHeroProps> = ({
  rows,
  cols,
  spacing,
  duration,
  color,
  animationType,
  pulseEffect,
  mouseGlow,
  opacityMin,
  opacityMax,
  background,
  children,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Build grid cells on cfg change
  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    container.style.gap = `${spacing}px`;
    container.style.position = "absolute";
    container.style.inset = "0";
    container.style.zIndex = "0";
    container.style.pointerEvents = "none";
    container.style.setProperty("--mouse-glow-opacity", mouseGlow ? "1" : "0");

    const total = rows * cols;
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);

    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.style.backgroundColor = color;
      cell.style.setProperty("--opacity-min", String(opacityMin));
      cell.style.setProperty("--opacity-max", String(opacityMax));
      cell.style.width = "100%";
      cell.style.height = "100%";
      cell.style.opacity = String(opacityMin);

      if (pulseEffect) {
        let delay;
        const r = Math.floor(i / cols);
        const c = i % cols;

        if (animationType === "wave") {
          delay = (r + c) * 0.1;
        } else if (animationType === "random") {
          delay = Math.random() * duration;
        } else {
          const dr = Math.abs(r - centerRow);
          const dc = Math.abs(c - centerCol);
          delay = Math.sqrt(dr * dr + dc * dc) * 0.2;
        }

        cell.style.animation = `cell-pulse ${duration}s infinite alternate`;
        cell.style.animationDelay = `${delay.toFixed(3)}s`;
      }

      container.appendChild(cell);
    }
  }, [
    rows,
    cols,
    spacing,
    color,
    animationType,
    pulseEffect,
    duration,
    opacityMin,
    opacityMax,
    mouseGlow,
  ]);

  // Mouse-follow glow
  useEffect(() => {
    if (!mouseGlow || !gridRef.current) return;
    const handler = (e: MouseEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gridRef.current.style.setProperty("--mouse-x", `${x}px`);
      gridRef.current.style.setProperty("--mouse-y", `${y}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseGlow]);

  return (
    <div 
      className="data-grid-hero relative w-full overflow-hidden flex items-center justify-center p-0 m-0" 
      style={{ background, minHeight: "100vh" }}
    >
      <div
        ref={gridRef}
        className="grid-container"
        aria-hidden="true"
        style={{
          backgroundImage: mouseGlow ? `radial-gradient(circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255, 255, 255, 0.15) 0%, transparent 40%)` : 'none',
          opacity: "var(--mouse-glow-opacity, 0)"
        }}
      />
      <div
        className="hero-content relative z-10 w-full"
        role="region"
        aria-label="Hero Content"
      >
        {children}
      </div>
    </div>
  );
};

export default DataGridHero;

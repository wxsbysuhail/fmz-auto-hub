import React from "react";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface VehicleMapProps {
  points: Point[];
  onPointAdd?: (point: Point) => void;
  onPointRemove?: (index: number) => void;
  readOnly?: boolean;
}

export function VehicleMap({ points, onPointAdd, onPointRemove, readOnly }: VehicleMapProps) {
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || !onPointAdd) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPointAdd({ x, y });
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-secondary/10 rounded-3xl overflow-hidden border border-border/40 transition-all hover:border-primary/20 group shadow-inner">
      {/* Technical Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      
      <svg
        viewBox="0 0 400 200"
        className={cn("w-full h-full p-4", !readOnly && "cursor-crosshair")}
        onClick={handleClick}
      >
        <defs>
          <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* High-Fidelity 3D Studio Render */}
        <foreignObject x="0" y="0" width="400" height="200" className="pointer-events-none">
          <div className="w-full h-full flex items-center justify-center p-4">
            <img 
              src="/clean_modern_car_3d.png" 
              alt="3D Vehicle Model"
              className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </foreignObject>

        {/* Minimalist technical guides */}
        <g className="opacity-20 pointer-events-none">
          <line x1="200" y1="20" x2="200" y2="180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="50" y1="100" x2="350" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </g>
        
        {/* Interactive Markers */}
        {(points || []).map((p, i) => {
          // Scale points to 400x200 viewBox
          const mx = p.x * 4;
          const my = p.y * 2;
          return (
            <g key={i} onClick={(e) => { e.stopPropagation(); onPointRemove?.(i); }} className="cursor-pointer">
              <circle
                cx={mx}
                cy={my}
                r="5"
                className="fill-primary shadow-2xl animate-in zoom-in duration-300"
              />
              <circle
                cx={mx}
                cy={my}
                r="15"
                className="fill-primary/10 stroke-primary/30 stroke-[0.5] animate-pulse"
              />
              <line
                x1={mx} y1={my} x2={mx} y2={my - 20}
                className="stroke-primary/40 stroke-[0.8] stroke-dasharray-[2,2]"
              />
              <text x={mx + 8} y={my - 15} className="fill-primary text-[8px] font-bold uppercase tracking-widest">
                Issue #{i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      {!readOnly && (
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-sm text-[9px] uppercase tracking-widest font-bold text-muted-foreground select-none">
          Click to Pin diagnostics
        </div>
      )}
    </div>
  );
}

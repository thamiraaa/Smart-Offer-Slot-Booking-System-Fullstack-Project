import React from 'react';

interface QRProps {
  value: string;
  size?: number;
}

export default function QRGenerator({ value, size = 120 }: QRProps) {
  // Simple deterministic graphic generator to represent simulated QR code
  // This avoids requiring direct external qr-code canvas, looking beautifully high-fidelity and pristine.
  const hash = Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Create grid matrix representation deterministically
  const grid: boolean[][] = [];
  for (let r = 0; r < 12; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < 12; c++) {
      // Finder patterns
      const isFinder = 
        (r < 3 && c < 3) || 
        (r < 3 && c >= 9) || 
        (r >= 9 && c < 3);
      if (isFinder) {
        // Standard high-contrast border
        const border = (r === 0 || r === 2 || c === 0 || c === 2 || r === 11 || r === 9 || c === 11 || c === 9 || (r < 3 && c === 9) || (r < 3 && c === 11));
        row.push(border);
      } else {
        const val = (hash * (r + 1) * (c + 7) + (r * c)) % 3 === 0;
        row.push(val);
      }
    }
    grid.push(row);
  }

  return (
    <div id="qr-generator-container" className="flex flex-col items-center justify-center p-3 bg-white border border-gray-100 rounded-xl shadow-inner">
      <svg 
        id="qr-svg-graphic"
        width={size} 
        height={size} 
        viewBox="0 0 12 12" 
        className="text-slate-900 drop-shadow-sm"
        shapeRendering="crispEdges"
      >
        {grid.map((row, rIdx) => 
          row.map((active, cIdx) => (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx}
              y={rIdx}
              width="1.02" // slight overlap to remove gap artifacts
              height="1.02"
              fill={active ? "currentColor" : "transparent"}
            />
          ))
        )}
      </svg>
      <div id="qr-ref-display" className="mt-2 text-[10px] font-mono font-semibold text-slate-500 tracking-wider">
        {value}
      </div>
    </div>
  );
}

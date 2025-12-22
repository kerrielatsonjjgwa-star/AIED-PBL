import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GridCellType } from '../types';
import { Home, Factory, Trees, Building2, Minus, Info } from 'lucide-react';
import clsx from 'clsx';
import { weightsByType } from '../services/simulation';

const CELL_CONFIG: Record<GridCellType, { label: string; color: string; icon: React.ReactNode }> = {
  residential: { label: 'Residential', color: 'bg-yellow-200 hover:bg-yellow-300', icon: <Home className="w-6 h-6 text-yellow-700" /> },
  factory: { label: 'Factory', color: 'bg-gray-400 hover:bg-gray-500', icon: <Factory className="w-6 h-6 text-gray-800" /> },
  park: { label: 'Park', color: 'bg-green-200 hover:bg-green-300', icon: <Trees className="w-6 h-6 text-green-700" /> },
  commercial: { label: 'Commercial', color: 'bg-blue-200 hover:bg-blue-300', icon: <Building2 className="w-6 h-6 text-blue-700" /> },
  empty: { label: 'Empty', color: 'bg-slate-100 hover:bg-slate-200', icon: <Minus className="w-6 h-6 text-slate-400" /> },
};

interface MapGridProps {
  onCellClick?: (id: string) => void;
}

const MapGrid: React.FC<MapGridProps> = ({ onCellClick }) => {
  const { grid, phase } = useGameStore();
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const isInteractive = phase === 'proposal';

  return (
    <div className="bg-white p-4 rounded-lg shadow-md relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-700">District Map (Old Banyan Tree)</h3>
        {isInteractive && (
          <div className="group relative">
            <Info className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute right-0 top-6 w-64 bg-gray-800 text-white text-xs p-3 rounded shadow-lg z-50 hidden group-hover:block">
              <p className="font-bold mb-1">规划指南：</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><span className="text-yellow-300">居民区</span>：满意度高，但拆除会引发强烈抗议。</li>
                <li><span className="text-gray-300">工厂</span>：经济高但环境差，拆除可改善环境。</li>
                <li><span className="text-green-300">公园</span>：环境与满意度双优，但无经济产出。</li>
                <li><span className="text-blue-300">商业区</span>：经济极高，但可能带来噪音。</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-2 w-fit mx-auto relative">
        {grid.map((cell) => {
          const config = CELL_CONFIG[cell.type];
          const isHovered = hoveredCell === cell.id;
          
          return (
            <div
              key={cell.id}
              onClick={() => isInteractive && onCellClick?.(cell.id)}
              onMouseEnter={() => setHoveredCell(cell.id)}
              onMouseLeave={() => setHoveredCell(null)}
              className={clsx(
                "w-16 h-16 rounded-md flex items-center justify-center cursor-pointer transition-colors border border-gray-200 relative",
                config.color,
                !isInteractive && "cursor-not-allowed opacity-80"
              )}
            >
              {config.icon}
              
              {/* Hover Preview for next type */}
              {isInteractive && isHovered && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  点击切换用地类型
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        {isInteractive ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            规划模式：点击格子修改用地
          </span>
        ) : "View only mode"}
      </div>
    </div>
  );
};

export default MapGrid;

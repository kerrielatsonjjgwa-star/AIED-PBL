import React from 'react';
import { Metrics } from '../types';
import { TrendingUp, Users, Leaf } from 'lucide-react';
import clsx from 'clsx';

interface MetricBarProps {
  metrics: Metrics;
}

const ProgressBar = ({ label, value, textColor, bgColor, icon: Icon }: { label: string, value: number, textColor: string, bgColor: string, icon: any }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className={clsx("w-4 h-4", textColor)} />
        <span>{label}</span>
      </div>
      <span className="text-xs font-bold text-gray-500">{value}/100</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={clsx("h-2.5 rounded-full transition-all duration-500", bgColor)} 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      ></div>
    </div>
  </div>
);

const MetricBar: React.FC<MetricBarProps> = ({ metrics }) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold mb-4 text-gray-700">City Metrics</h3>
      <ProgressBar 
        label="居民满意度" 
        value={metrics.satisfaction} 
        textColor="text-yellow-500"
        bgColor="bg-yellow-500"
        icon={Users} 
      />
      <ProgressBar 
        label="经济活力" 
        value={metrics.economy} 
        textColor="text-blue-500"
        bgColor="bg-blue-500"
        icon={TrendingUp} 
      />
      <ProgressBar 
        label="环境可持续" 
        value={metrics.environment} 
        textColor="text-green-500"
        bgColor="bg-green-500"
        icon={Leaf} 
      />
    </div>
  );
};

export default MetricBar;

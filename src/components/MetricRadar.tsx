import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Metrics } from '../types';

interface MetricRadarProps {
  metrics: Metrics;
}

const MetricRadar: React.FC<MetricRadarProps> = ({ metrics }) => {
  const data = [
    { subject: 'Satisfaction', A: metrics.satisfaction, fullMark: 100 },
    { subject: 'Economy', A: metrics.economy, fullMark: 100 },
    { subject: 'Environment', A: metrics.environment, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2 text-gray-700">City Metrics</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="City Pulse"
            dataKey="A"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricRadar;

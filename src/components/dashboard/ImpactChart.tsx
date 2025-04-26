import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface ImpactChartProps {
  data: ChartData[];
  type: 'line' | 'bar';
  title: string;
  dataKeys: { key: string; color: string; name: string }[];
  xAxisDataKey?: string;
  yAxisLabel?: string;
}

const ImpactChart: React.FC<ImpactChartProps> = ({
  data,
  type,
  title,
  dataKeys,
  xAxisDataKey = 'name',
  yAxisLabel
}) => {
  const renderChart = () => {
    if (type === 'line') {
      return (
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xAxisDataKey} 
            tick={{ fontSize: 12 }} 
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: 'none' }}
          />
          <Legend verticalAlign="bottom" height={36} />
          {dataKeys.map(({ key, color, name }) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              name={name}
              stroke={color} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      );
    }
    
    if (type === 'bar') {
      return (
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xAxisDataKey} 
            tick={{ fontSize: 12 }} 
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: 'none' }}
          />
          <Legend verticalAlign="bottom" height={36} />
          {dataKeys.map(({ key, color, name }) => (
            <Bar 
              key={key} 
              dataKey={key} 
              name={name}
              fill={color} 
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImpactChart;
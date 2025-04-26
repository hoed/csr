import React from 'react';
import { Indicator } from '../../hooks/useIndicators';

interface IndicatorProgressCardProps {
  indicator: Indicator;
  onClick?: () => void;
}

const IndicatorProgressCard: React.FC<IndicatorProgressCardProps> = ({ indicator, onClick }) => {
  // Calculate progress percentage
  const calculateProgress = () => {
    if (indicator.target_value === null || indicator.current_value === null) {
      return 0;
    }
    
    const startValue = indicator.start_value || 0;
    const current = indicator.current_value - startValue;
    const target = indicator.target_value - startValue;
    
    // Avoid division by zero
    if (target === 0) return 100;
    
    const progress = (current / target) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
  };

  const progress = calculateProgress();

  // Get color based on progress
  const getProgressColor = () => {
    if (progress >= 75) return 'bg-success-500';
    if (progress >= 50) return 'bg-primary-500';
    if (progress >= 25) return 'bg-warning-500';
    return 'bg-error-500';
  };

  return (
    <div 
      className="card hover:border-primary-200 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{indicator.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{indicator.description}</p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
              {indicator.category}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-sm font-medium">{progress.toFixed(0)}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor()}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500">Start</div>
            <div className="text-sm font-medium">
              {indicator.start_value !== null ? indicator.start_value : '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Current</div>
            <div className="text-sm font-medium text-primary-600">
              {indicator.current_value !== null ? indicator.current_value : '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Target</div>
            <div className="text-sm font-medium">
              {indicator.target_value !== null ? indicator.target_value : '-'}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <div>Unit: {indicator.unit}</div>
          <div>Updated: {indicator.last_updated ? new Date(indicator.last_updated).toLocaleDateString() : 'Never'}</div>
        </div>
        
        {indicator.sdg_goals && indicator.sdg_goals.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {indicator.sdg_goals.map(sdg => (
                <span 
                  key={sdg} 
                  className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-primary-50 text-primary-700"
                  title={`SDG ${sdg}`}
                >
                  {sdg}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndicatorProgressCard;
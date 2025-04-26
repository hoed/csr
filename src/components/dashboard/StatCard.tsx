import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon,
  variant = 'primary'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-50 text-primary-700';
      case 'secondary':
        return 'bg-secondary-50 text-secondary-700';
      case 'accent':
        return 'bg-accent-50 text-accent-700';
      case 'success':
        return 'bg-success-50 text-success-700';
      case 'warning':
        return 'bg-warning-50 text-warning-700';
      case 'error':
        return 'bg-error-50 text-error-700';
      default:
        return 'bg-primary-50 text-primary-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${getVariantClasses()}`}>
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-xl font-semibold text-gray-900 mt-1">{value}</h3>
        </div>
      </div>
      
      {typeof change !== 'undefined' && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium flex items-center ${
            change > 0 
              ? 'text-success-600' 
              : change < 0 
                ? 'text-error-600' 
                : 'text-gray-500'
          }`}>
            {change > 0 ? (
              <TrendingUp size={16} className="mr-1" />
            ) : change < 0 ? (
              <TrendingDown size={16} className="mr-1" />
            ) : (
              <Minus size={16} className="mr-1" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">from previous period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
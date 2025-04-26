import React from 'react';
import { useIndicators } from '../hooks/useIndicators';

const Indicators = () => {
  const { indicators, loading, error } = useIndicators();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading indicators. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Project Indicators</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track and manage your project's key performance indicators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicators?.map((indicator) => (
          <div
            key={indicator.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">{indicator.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{indicator.description}</p>
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Current Value</span>
                <span className="text-lg font-semibold text-gray-900">
                  {indicator.current_value} {indicator.unit}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Target</span>
                <span className="text-lg font-semibold text-gray-900">
                  {indicator.target_value} {indicator.unit}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last updated</span>
                <span className="text-gray-900">
                  {new Date(indicator.last_updated || indicator.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Indicators;
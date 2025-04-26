import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center text-primary-600">
            <BarChart3 size={32} className="mr-2" />
            <span className="text-2xl font-bold">ImpactMonitor</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Social Impact Monitoring
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Track, measure, and report your organization's impact
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
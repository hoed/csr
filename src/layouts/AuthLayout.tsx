import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import Footer from '../components/layout/Footer';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-grow flex">
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            <div className="flex justify-center">
              <Link to="/" className="flex items-center text-primary-600">
                <BarChart3 size={32} className="mr-2" />
                <span className="text-2xl font-bold">ImpactMonitor</span>
              </Link>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Social Impact Monitoring
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Track, measure, and report your organization's impact
            </p>
            <div className="mt-8">
              {children}
            </div>
          </div>
        </div>

        {/* Right side - Background image */}
        <div className="hidden md:block md:w-1/2 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(/images/back.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/30 to-primary-800/30" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <span>Made with</span>
            <Heart size={16} className="text-red-500" />
            <span>by ImpactMonitor Team</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} Hoed - ImpactMonitor. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
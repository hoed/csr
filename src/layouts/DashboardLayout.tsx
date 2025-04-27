import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  BarChart3, 
  FileText, 
  ClipboardList, 
  Settings, 
  Bell, 
  ChevronDown, 
  Menu, 
  X, 
  LogOut,
  BookOpen,
  Target
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import NotificationDropdown from '../components/ui/NotificationDropdown';
import ThemeToggle from '../components/layout/ThemeToggle';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';
import Footer from '../components/layout/Footer';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: t('navigation.dashboard'), path: '/', icon: <LayoutDashboard size={20} /> },
    { name: t('navigation.projects'), path: '/projects', icon: <FolderKanban size={20} /> },
    { name: t('navigation.indicators'), path: '/indicators', icon: <BarChart3 size={20} /> },
    { name: t('navigation.reports'), path: '/reports', icon: <FileText size={20} /> },
    { name: t('navigation.forms'), path: '/forms', icon: <ClipboardList size={20} /> },
    { name: 'SDG Alignment', path: '/sdg-alignment', icon: <Target size={20} /> },
    { name: t('navigation.settings'), path: '/settings', icon: <Settings size={20} /> },
    { name: t('navigation.manual'), path: '/manual', icon: <BookOpen size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="sr-only">Open sidebar</span>
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center text-primary-600 dark:text-primary-500 font-bold text-xl">
                  <BarChart3 className="mr-2" />
                  <span>ImpactMonitor</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="relative">
                <button
                  className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <span className="sr-only">View notifications</span>
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-error-500 ring-2 ring-white dark:ring-gray-800"></span>
                </button>
                {notificationsOpen && <NotificationDropdown onClose={() => setNotificationsOpen(false)} />}
              </div>
              <div className="ml-3 relative flex items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-2 hidden md:block">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Administrator</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-20 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0 md:block`}>
          <nav className="mt-5 px-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-300'
                  }`
                }
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-10 bg-gray-600 bg-opacity-50 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 overflow-auto">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
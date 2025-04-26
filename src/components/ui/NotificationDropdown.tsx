import React from 'react';
import { X, Calendar, FileText, Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'report' | 'update';
  date: string;
  read: boolean;
}

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Report due tomorrow',
      message: 'Quarterly report for Clean Water Initiative is due tomorrow',
      type: 'deadline',
      date: '2023-09-15T10:00:00Z',
      read: false
    },
    {
      id: '2',
      title: 'New indicator measurement',
      message: 'Student enrollment was updated for the Youth Education Program',
      type: 'update',
      date: '2023-09-14T15:30:00Z',
      read: false
    },
    {
      id: '3',
      title: 'Report generated',
      message: 'Annual impact report for Sustainable Agriculture has been generated',
      type: 'report',
      date: '2023-09-13T09:15:00Z',
      read: true
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar size={16} className="text-warning-500" />;
      case 'report':
        return <FileText size={16} className="text-success-500" />;
      default:
        return <Bell size={16} className="text-primary-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X size={16} />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-4 px-4 text-center text-gray-500 text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${
                notification.read ? 
                  'border-transparent' : 
                  notification.type === 'deadline' ? 
                    'border-warning-500' : 
                    notification.type === 'report' ? 
                      'border-success-500' : 
                      'border-primary-500'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(notification.date)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-gray-100 px-4 py-2">
        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
          Mark all as read
        </button>
        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium ml-4">
          View all
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
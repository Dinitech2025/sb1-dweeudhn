import React from 'react';
import { format } from 'date-fns';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Notification } from '@/types/database';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white rounded-lg shadow-sm border p-4 ${
            !notification.read ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                !notification.read ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                <Bell className={`w-5 h-5 ${
                  !notification.read ? 'text-indigo-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <p className={`font-medium ${
                  !notification.read ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-500">{notification.message}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(notification.created_at), 'PPp')}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="Marquer comme lu"
                >
                  <Check size={16} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="text-red-600 hover:text-red-700"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Notification } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

function NotificationItem({ notification }) {
  const markAsRead = async () => {
    if (!notification.is_read) {
      await Notification.update(notification.id, { is_read: true });
    }
  };

  return (
    <Link to={notification.link_to || '#'} onClick={markAsRead}>
      <div className={`p-3 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
        <p className="text-sm text-gray-800">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
}

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const userNotifications = await Notification.filter({ user_id: user.id }, '-created_date', 10);
      setNotifications(userNotifications);
      const unread = userNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(n => <NotificationItem key={n.id} notification={n} />)
          ) : (
            <p className="p-4 text-sm text-gray-500 text-center">No new notifications.</p>
          )}
        </div>
        <div className="p-2 border-t text-center">
          <Link to={createPageUrl('Notifications')} className="text-sm font-medium text-[#7DB9E8] hover:underline">
            View All Notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
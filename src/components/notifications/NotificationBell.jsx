import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useGetUnreadCountQuery } from '@/features/notifications/notificationApi';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Button } from '@/components/ui/button';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: countData, refetch } = useGetUnreadCountQuery();
  const unreadCount = countData?.data?.count || 0;

  // 🔥 Enable Firebase real-time notifications (instant delivery!)
  useRealtimeNotifications();

  // Fallback: Poll for new notifications every 30 seconds (if Firebase fails)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only poll if Firebase is not active
      if (!window.__firebaseRealtimeActive) {
        console.log('Firebase inactive, falling back to polling...');
        refetch();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 z-50">
            <NotificationDropdown onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}

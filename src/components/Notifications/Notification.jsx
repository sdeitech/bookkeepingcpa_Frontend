import { Bell, Check, CheckCheck, Trash2, Mail, MailOpen, X, ListTodo, Users, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
} from "@/features/notifications/notificationApi";
import {
  selectNotifications,
  selectUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setNotifications,
  addNotification,
  updateUnreadCount,
  setFilter,
  resetPage,
} from "@/features/notifications/notificationSlice";

const typeIcons = {
  task: ListTodo,
  client: Users,
  system: Info,
  reminder: Clock,
};

const typeColors = {
  task: "bg-primary/10 text-primary",
  client: "bg-chart-4/10 text-chart-4",
  system: "bg-muted text-muted-foreground",
  reminder: "bg-destructive/10 text-destructive",
};
export function NotificationPanel() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const allNotifications = useSelector((state) => state.notifications.notifications);

  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();
  const [deleteNotificationMutation] = useDeleteNotificationMutation();
  const {
    data: notificationsResponse,
    refetch: refetchNotifications,
    isFetching: isPollingNotifications,
  } = useGetNotificationsQuery(
    { page: 1, limit: 100 },
    {
      // pollingInterval: 10000, // Optional: Poll every 10 seconds for new notifications
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const {
    data: unreadCountResponse,
    refetch: refetchUnreadCount,
  } = useGetUnreadCountQuery(undefined, {
    // pollingInterval: 10000, // Optional: Poll every 10 seconds for unread count
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [filter, setLocalFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  // Keep unread badge in sync even when bell is not opened.
  useEffect(() => {
    if (unreadCountResponse !== undefined && unreadCount !== unreadCountResponse) {
      dispatch(updateUnreadCount(unreadCountResponse));
    }
  }, [unreadCountResponse, unreadCount, dispatch]);

  // Keep notification list in sync in background (not only on bell click).
  useEffect(() => {
    if (!notificationsResponse?.data?.notifications) return;

    const apiNotifications = notificationsResponse.data.notifications;
    if (allNotifications.length === 0) {
      dispatch(setNotifications(apiNotifications));
    } else {
      const existingIds = new Set(allNotifications.map((n) => n._id || n.id));
      const newNotifications = apiNotifications.filter(
        (n) => !existingIds.has(n._id) && !existingIds.has(n.id)
      );
      newNotifications.forEach((notification) => dispatch(addNotification(notification)));
    }

    if (notificationsResponse?.data?.unreadCount !== undefined) {
      dispatch(updateUnreadCount(notificationsResponse.data.unreadCount));
    }
  }, [notificationsResponse, allNotifications, dispatch]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([refetchNotifications(), refetchUnreadCount()]);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRead = async (notificationId, isRead) => {
    // Backend supports mark-as-read; keep read notifications unchanged.
    if (isRead) return;

    try {
      dispatch(markAsRead(notificationId));
      const result = await markAsReadMutation(notificationId);
      if (result?.error) {
        handleRefresh();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      handleRefresh();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setIsLoading(true);
      await markAllAsReadMutation();
      dispatch(markAllAsRead());
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotificationMutation(notificationId);
      dispatch(removeNotification(notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClearAll = async () => {
    const ids = notifications.map((n) => n._id || n.id).filter(Boolean);
    if (ids.length === 0) return;

    try {
      setIsLoading(true);
      await Promise.all(ids.map((id) => deleteNotificationMutation(id)));
      ids.forEach((id) => dispatch(removeNotification(id)));
    } catch (error) {
      console.error("Error clearing notifications:", error);
      handleRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  const setFilterTab = (nextFilter) => {
    setLocalFilter(nextFilter);
    dispatch(setFilter(nextFilter));
    dispatch(resetPage());
  };

  const getNotificationId = (notification) => notification._id || notification.id;

  const getNotificationRead = (notification) => Boolean(notification.isRead);

  const getNotificationTime = (notification) => {
    if (notification.time) return notification.time;
    if (notification.createdAt) {
      return new Date(notification.createdAt).toLocaleString();
    }
    return "";
  };

  const mapType = (type) => {
    if (type === "assignment") return "task";
    if (type === "announcement" || type === "update" || type === "alert") return "system";
    if (!typeIcons[type]) return "system";
    return type;
  };

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen) {
      handleRefresh();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-destructive ring-2 ring-background">
              {/* {unreadCount > 9 ? "9+" : unreadCount} */}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 rounded-xl shadow-xl border-border/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-4 pb-2">
              {(["all", "unread"]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                filter === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              )}
            >
              {tab === "all" ? "All" : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        <Separator />

        {/* Notification List */}
        <ScrollArea className="max-h-[360px]">
          {isLoading || isPollingNotifications ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No {filter === "unread" ? "unread " : ""}notifications</p>
            </div>
          ) : (
              <div className="divide-y divide-border/50">
                {filtered.map((notification) => {
                  const normalizedType = mapType(notification.type);
                  const Icon = typeIcons[normalizedType] || Info;
                  const read = getNotificationRead(notification);
                  const notificationId = getNotificationId(notification);
                  return (
                    <div
                      key={notificationId}
                      className={cn(
                        "group flex gap-3 px-4 py-3 transition-colors hover:bg-accent/50",
                        !read && "bg-primary/[0.03]"
                      )}
                    >
                      {/* Type Icon */}
                      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", typeColors[normalizedType] || typeColors.system)}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm leading-tight", !read ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                            {notification.title}
                          </p>
                          {!read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{getNotificationTime(notification)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRead(notificationId, read);
                          }}
                          title={read ? "Marked as read" : "Mark as read"}
                        >
                          {read ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notificationId);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-2.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                onClick={handleClearAll}
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationPanel;

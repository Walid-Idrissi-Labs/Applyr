import { useState, useEffect } from 'react';
import { notificationsAPI } from '../api';
import { Bell, Trash2, Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.data || res.data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    await notificationsAPI.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationsAPI.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  };

  const handleDelete = async (id) => {
    await notificationsAPI.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete all notifications?')) return;
    await notificationsAPI.deleteAll();
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-[20px] tracking-widest dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-[#111] dark:bg-white text-white dark:text-[#111] text-[10px] px-2 py-0.5 rounded font-bold">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="neu-btn-outline flex items-center gap-1 text-[11px]">
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleDeleteAll} className="neu-btn-outline flex items-center gap-1 text-[11px] text-red-600">
              <Trash2 className="w-3 h-3" /> Delete all
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="font-bold dark:text-white">Loading...</div></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <div className="text-gray-400 dark:text-gray-600 text-[14px]">No notifications</div>
        </div>
      ) : (
        <div className="neu-card overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors ${
                !notif.read_at ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read_at ? 'bg-gray-300' : 'bg-blue-500'}`} />
                <div>
                  <div className="text-[12px] font-bold dark:text-white">{notif.message}</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 ml-3">
                {!notif.read_at && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-green-600"
                    title="Mark as read"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
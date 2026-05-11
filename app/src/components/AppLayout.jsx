import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationsAPI } from '../api';
import { Menu, Sun, Moon, Bell, User, LogOut, ArrowRightLeft } from 'lucide-react';

const USER_TABS = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Applications', path: '/applications' },
  { name: 'Resumes', path: '/resumes' },
  { name: 'Notifications', path: '/notifications' },
  { name: 'Profile', path: '/profile' },
];

const ADMIN_TABS = [
  { name: 'Admin Dashboard', path: '/admin/dashboard' },
  { name: 'User Management', path: '/admin/users' },
  { name: 'Profile', path: '/profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminViewMode, setAdminViewMode] = useState(user?.is_admin || false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const hasUnread = unreadCount > 0;

  const currentTabs = user?.is_admin && adminViewMode ? ADMIN_TABS : USER_TABS;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 767px)');
    const handleChange = (event) => {
      const matches = event?.matches ?? media.matches;
      setIsMobile(matches);
      if (matches) {
        setSidebarOpen(false);
      }
    };
    handleChange(media);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    let isActive = true;

    const loadUnreadCount = async () => {
      try {
        const res = await notificationsAPI.getUnreadCount();
        const rawCount = res?.data?.count
          ?? res?.data?.unread_count
          ?? res?.data?.unreadCount
          ?? res?.data?.unread
          ?? res?.data
          ?? 0;
        const parsedCount = Number(rawCount);
        if (isActive) {
          setUnreadCount(Number.isFinite(parsedCount) ? parsedCount : 0);
        }
      } catch (error) {
        if (isActive) {
          setUnreadCount(0);
        }
      }
    };

    let refreshInterval;

    const startPolling = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      refreshInterval = setInterval(loadUnreadCount, 60000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (refreshInterval) {
          clearInterval(refreshInterval);
          refreshInterval = undefined;
        }
        return;
      }

      loadUnreadCount();
      startPolling();
    };

    const handleNotificationsRefresh = () => {
      loadUnreadCount();
    };

    loadUnreadCount();
    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('notifications:refresh', handleNotificationsRefresh);

    return () => {
      isActive = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('notifications:refresh', handleNotificationsRefresh);
    };
  }, [user?.id, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] transition-colors duration-300">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarOpen ? 'md:w-48' : 'md:w-0'} fixed inset-y-0 left-0 w-64 md:static md:translate-x-0 shrink-0 flex flex-col transition-all duration-300 bg-white dark:bg-[#111] md:bg-transparent md:dark:bg-transparent border-r-2 border-[#111] dark:border-gray-800 md:border-0 md:dark:border-0 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] md:shadow-none md:dark:shadow-none overflow-hidden whitespace-nowrap z-20`}
      >
        <div className="p-2 md:p-3 flex flex-col h-full w-full">
          <div className="font-bold text-[18px] tracking-widest mb-6 px-2 mt-2 dark:text-white">
            Applyr
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            {currentTabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => {
                  if (isMobile) setSidebarOpen(false);
                }}
                className={({ isActive }) =>
                  `text-left py-2 px-3 rounded-lg border-2 flex justify-between items-center transition-all text-[13px] font-bold ${
                    isActive
                      ? 'border-[#111] dark:border-gray-500 bg-white dark:bg-[#111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] dark:text-white'
                      : 'border-transparent dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                  }`
                }
              >
                <span>{tab.name}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            className="mt-auto mb-4 mx-2 p-2 rounded-lg border-2 border-transparent hover:border-[#111] dark:hover:border-gray-700 flex items-center gap-3 transition-all dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative p-2 md:p-3 transition-all duration-300">
        <div className="bg-white dark:bg-[#111] rounded-2xl border-2 border-[#111] dark:border-gray-800 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] h-full flex flex-col overflow-hidden relative z-0 transition-colors">
          <header className="p-3 px-5 flex justify-between items-center shrink-0 bg-white dark:bg-[#111] z-10 border-b-2 border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 rounded-md transition-all dark:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className={`font-bold tracking-widest dark:text-white transition-opacity ${sidebarOpen ? 'opacity-0 hidden md:block' : 'opacity-100'}`}>
                Applyr
              </div>
            </div>
            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => navigate('/notifications')}
                className={`hover:bg-gray-100 dark:hover:bg-gray-800 p-2 border-2 rounded-md transition-all dark:text-white relative ${
                  hasUnread
                    ? 'border-red-500 dark:border-red-400 hover:border-red-500 dark:hover:border-red-400'
                    : 'border-transparent hover:border-[#111] dark:hover:border-gray-600'
                }`}
              >
                <Bell className="w-4 h-4" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:underline text-[12px] font-bold dark:text-gray-300"
                >
                  <User className="w-4 h-4" />
                  {user?.name}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#1a1a1a] border-2 border-[#111] dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] py-1 min-w-[180px] z-50">
                    {user?.is_admin && (
                      <button
                        onClick={() => {
                          const newMode = !adminViewMode;
                          setAdminViewMode(newMode);
                          setShowUserMenu(false);
                          navigate(newMode ? '/admin/dashboard' : '/dashboard');
                        }}
                        className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        {adminViewMode ? 'Switch to User Mode' : 'Switch to Admin Mode'}
                      </button>
                    )}
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <LogOut className="w-3 h-3" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          {user?.is_admin && !adminViewMode && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 text-[11px] font-bold text-center py-1.5 border-b-2 border-yellow-200 dark:border-yellow-800 shrink-0">
              Viewing as User (Admin Mode disabled)
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'CLAIM':
      case 'PICKUP':
        return <Sparkles className="w-4 h-4 text-teal-400" />;
      default:
        return <Clock className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-navy-950 shadow-glow-emerald animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-navy-900 border border-slate-700/80 shadow-2xl z-50 overflow-hidden card-3d">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-navy-850/80">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <span className="font-semibold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && markAsRead(item.id)}
                  className={`p-3.5 flex gap-3 text-left transition-colors cursor-pointer ${
                    item.read ? 'bg-transparent hover:bg-navy-800/40 text-slate-400' : 'bg-navy-800/60 hover:bg-navy-800 text-slate-200'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${item.read ? 'text-slate-300' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed text-slate-300/90 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <div className="w-2 h-2 rounded-full bg-teal-400 self-center flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

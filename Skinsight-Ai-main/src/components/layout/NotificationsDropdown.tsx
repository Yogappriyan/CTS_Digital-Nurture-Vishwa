import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert, Check } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsDropdownProps {
  onNavigateToAnalysis?: (id: string) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'success',
    title: 'Screening Complete',
    message: 'Atypical Nevus screening report is ready for review.',
    timestamp: '10m ago',
    read: false,
    relatedAnalysisId: 'DEMO-001'
  },
  {
    id: 'n-2',
    type: 'warning',
    title: 'Follow-up Recommendation',
    message: 'Forehead lesion flagged as Pre-Malignant (Actinic Keratosis). Clinical follow-up recommended.',
    timestamp: '2h ago',
    read: false,
    relatedAnalysisId: 'DEMO-002'
  },
  {
    id: 'n-3',
    type: 'info',
    title: 'Grad-CAM Updated',
    message: 'EfficientNet-B0 visual explainability colormap updated to Jet colormap.',
    timestamp: '1d ago',
    read: true
  }
];

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onNavigateToAnalysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[11px] font-medium bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No notifications</div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      markSingleRead(item.id);
                      if (item.relatedAnalysisId && onNavigateToAnalysis) {
                        onNavigateToAnalysis(item.relatedAnalysisId);
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      !item.read ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {item.type === 'alert' && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                      {item.type === 'info' && <Info className="w-4 h-4 text-sky-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">Real-time clinical screening updates</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

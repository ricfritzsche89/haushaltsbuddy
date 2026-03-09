import { X, BellRing, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface Props {
    onClose: () => void;
}

export default function NotificationCenterModal({ onClose }: Props) {
    const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
    const navigate = useNavigate();

    const myNotifs = notifications.filter(n => n.userId === currentUser);
    const unreadCount = myNotifs.filter(n => !n.read).length;

    const handleNotifClick = (n: any) => {
        if (!n.read) markNotificationAsRead(n.id);
        if (n.link) {
            // Usually n.link looks like: https://hostname/#/wall or just /wall or /dashboard
            try {
                const url = new URL(n.link, window.location.origin);
                const hashPath = url.hash.replace('#', '');
                if (hashPath) navigate(hashPath);
            } catch (e) {
                if (n.link.startsWith('/')) navigate(n.link);
            }
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col max-h-[92vh]">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                        <BellRing className="text-blue-500" /> Mitteilungen
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    </h2>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button onClick={() => currentUser && markAllNotificationsAsRead(currentUser)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:scale-105 transition" title="Alle als gelesen markieren">
                                <Check size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:scale-110 active:scale-95 transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 hide-scrollbar">
                    {myNotifs.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-medium">Keine Mitteilungen vorhanden.</div>
                    ) : (
                        myNotifs.sort((a, b) => b.timestamp - a.timestamp).map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleNotifClick(n)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border ${n.read ? 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-sm'}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <h4 className={`text-sm ${n.read ? 'font-semibold text-slate-700 dark:text-slate-300' : 'font-extrabold text-slate-900 dark:text-white'}`}>
                                            {n.title}
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mt-2 block">
                                            {formatDistanceToNow(n.timestamp, { addSuffix: true, locale: de })}
                                        </span>
                                    </div>
                                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
